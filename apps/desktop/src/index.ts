// Adapted from https://github.com/maximegris/angular-electron/blob/master/main.ts

// Import logging for electron and override default console logging
import log from 'electron-log';
console.log = log.log;
Object.assign(console, log.functions);

import { app, dialog, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import { environment } from './environments/environment';
// setup logger to catch all unhandled errors and submit as bug reports to our repo
log.catchErrors({
	showDialog: false,
	onError(error, versions, submitIssue) {
		dialog
			.showMessageBox({
				title: 'An error occurred',
				message: error.message,
				detail: error.stack,
				type: 'error',
				buttons: ['Ignore', 'Report', 'Exit']
			})
			.then((result) => {
				if (result.response === 1) {
					submitIssue('https://github.com/conexoesinfinito/hap/issues/new', {
						title: `Automatic error report for Desktop App ${versions.app}`,
						body:
							'Error:\n```' +
							error.stack +
							'\n```\n' +
							`OS: ${versions.os}`
					});
					return;
				}

				if (result.response === 2) {
					app.quit();
				}
			});
	}
});

import * as path from 'path';
require('module').globalPaths.push(path.join(__dirname, 'node_modules'));
require('sqlite3');
const Store = require('electron-store');
import { ipcMainHandler, ipcTimer } from './libs/ipc';
import TrayIcon from './libs/tray-icon';
import AppMenu from './libs/menu';
import DataModel from './local-data/local-table';
import { LocalStore } from './libs/getSetStore';
import { createhapWindow } from './window/hap';
import { createSetupWindow } from './window/setup';
import { createTimeTrackerWindow } from './window/timeTracker';
import { createSettingsWindow } from './window/settings';
import { fork } from 'child_process';

// the folder where all app data will be stored (e.g. sqlite DB, settings, cache, etc)
// C:\Users\USERNAME\AppData\Roaming\hap-desktop
process.env.hap_USER_PATH = app.getPath('userData');
log.info(`hap_USER_PATH: ${process.env.hap_USER_PATH}`);

const sqlite3filename = `${process.env.hap_USER_PATH}/hap.sqlite3`;
log.info(`Sqlite DB path: ${sqlite3filename}`);

const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: sqlite3filename
	}
});

const dataModel = new DataModel();
dataModel.createNewTable(knex);

const store = new Store();

let serve: boolean;
const args = process.argv.slice(1);
serve = args.some((val) => val === '--serve');

let hapWindow: BrowserWindow = null;
let setupWindow: BrowserWindow = null;
let timeTrackerWindow: BrowserWindow = null;
const NotificationWindow: BrowserWindow = null;
let settingsWindow: BrowserWindow = null;

let tray = null;
let appMenu = null;
let isAlreadyRun = false;
let willQuit = false;
let onWaitingServer = false;
const alreadyQuit = false;
let serverhap = null;
let serverDesktop = null;
let dialogErr = false;

function startServer(value, restart = false) {
	process.env.IS_ELECTRON = 'true';
	if (value.db === 'sqlite') {
		process.env.DB_PATH = sqlite3filename;
		process.env.DB_TYPE = 'sqlite';
	} else {
		process.env.DB_TYPE = 'postgres';
		process.env.DB_HOST = value.dbHost;
		process.env.DB_PORT = value.dbPort;
		process.env.DB_NAME = value.dbName;
		process.env.DB_USER = value.dbUsername;
		process.env.DB_PASS = value.dbPassword;
	}
	if (value.isLocalServer) {
		process.env.port = value.port || environment.API_DEFAULT_PORT;
		process.env.host = 'http://localhost';
		process.env.BASE_URL = `http://localhost:${
			value.port || environment.API_DEFAULT_PORT
		}`;
		// require(path.join(__dirname, 'api/main.js'));
		serverhap = fork(path.join(__dirname, 'api/main.js'), {
			silent: true
		});
		serverhap.stdout.on('data', (data) => {
			const msgData = data.toString();
			if (
				msgData.indexOf('Unable to connect to the database') > -1 &&
				!dialogErr
			) {
				const msg = 'Unable to connect to the database';
				dialogMessage(msg);
			}
		});
	}

	try {
		const config: any = {
			...value,
			isSetup: true
		};
		store.set({
			configs: config
		});
	} catch (error) {}

	/* ping server before launch the ui */
	ipcMain.on('app_is_init', () => {
		if (!isAlreadyRun && value && !restart) {
			onWaitingServer = true;
			setupWindow.webContents.send('server_ping', {
				host: getApiBaseUrl(value)
			});
		}
	});

	return true;
}

const dialogMessage = (msg) => {
	dialogErr = true;
	const options = {
		type: 'question',
		buttons: ['Open Setting', 'Exit'],
		defaultId: 2,
		title: 'Warning',
		message: msg
	};

	dialog.showMessageBox(null, options).then((response) => {
		if (response.response === 1) app.quit();
		else {
			if (settingsWindow) settingsWindow.show();
			else {
				const appSetting = LocalStore.getStore('appSetting');
				const config = LocalStore.getStore('configs');
				if (!settingsWindow) {
					settingsWindow = createSettingsWindow(settingsWindow);
				}
				settingsWindow.show();
				setTimeout(() => {
					settingsWindow.webContents.send('app_setting', {
						setting: appSetting,
						config: config
					});
				}, 500);
			}
		}
	});
};

const getApiBaseUrl = (configs) => {
	if (configs.serverUrl) return configs.serverUrl;
	else {
		return configs.port
			? `http://localhost:${configs.port}`
			: `http://localhost:${environment.API_DEFAULT_PORT}`;
	}
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// Added 5000 ms to fix the black background issue while using transparent window.
// More details at https://github.com/electron/electron/issues/15947

app.on('ready', async () => {
	// require(path.join(__dirname, 'desktop-api/main.js'));
	Menu.setApplicationMenu(
		Menu.buildFromTemplate([
			{
				label: app.getName(),
				submenu: [
					{ role: 'about', label: 'About' },
					{ type: 'separator' },
					{ type: 'separator' },
					{ role: 'quit', label: 'Exit' }
				]
			}
		])
	);
	const configs: any = store.get('configs');
	if (configs && configs.isSetup) {
		global.variableGlobal = {
			API_BASE_URL: getApiBaseUrl(configs)
		};
		setupWindow = createSetupWindow(setupWindow, true);
		startServer(configs);
	} else {
		setupWindow = createSetupWindow(setupWindow, false);
	}
	ipcMainHandler(store, startServer, knex);
});

app.on('window-all-closed', quit);

ipcMain.on('server_is_ready', () => {
	serverDesktop = fork(path.join(__dirname, 'desktop-api/main.js'));
	LocalStore.setDefaultApplicationSetting();

	onWaitingServer = false;

	timeTrackerWindow = createTimeTrackerWindow(timeTrackerWindow);

	if (!isAlreadyRun) {
		setTimeout(() => {
			setupWindow.hide();
			if (!settingsWindow)
				settingsWindow = createSettingsWindow(settingsWindow);
			if (!hapWindow)
				hapWindow = createhapWindow(hapWindow, serve);

			ipcTimer(
				store,
				knex,
				setupWindow,
				timeTrackerWindow,
				NotificationWindow,
				settingsWindow
			);

			const auth = store.get('auth');

			appMenu = new AppMenu(timeTrackerWindow, settingsWindow, knex);
			if (!tray) {
				tray = new TrayIcon(
					setupWindow,
					knex,
					timeTrackerWindow,
					auth,
					settingsWindow
				);
			}

			timeTrackerWindow.on('close', (event) => {
				if (willQuit) {
					app.quit();
				} else {
					event.preventDefault();
					timeTrackerWindow.hide();
				}
			});
		}, 1000);
		isAlreadyRun = true;
	}
});

ipcMain.on('quit', quit);

ipcMain.on('minimize', () => {
	hapWindow.minimize();
});

ipcMain.on('maximize', () => {
	hapWindow.maximize();
});

ipcMain.on('restore', () => {
	hapWindow.restore();
});

ipcMain.on('restart_app', (event, arg) => {
	dialogErr = false;
	LocalStore.updateConfigSetting(arg);
	if (serverhap) serverhap.kill();
	if (hapWindow) hapWindow.destroy();
	hapWindow = null;
	isAlreadyRun = false;
	setTimeout(() => {
		if (!hapWindow) {
			const configs = LocalStore.getStore('configs');
			global.variableGlobal = {
				API_BASE_URL: getApiBaseUrl(configs)
			};
			startServer(configs, tray ? true : false);
			setupWindow.webContents.send('server_ping_restart', {
				host: getApiBaseUrl(configs)
			});
		}
	}, 100);
});

ipcMain.on('server_already_start', () => {
	if (!hapWindow && !isAlreadyRun) {
		hapWindow = createhapWindow(hapWindow, serve);
		isAlreadyRun = true;
	}
});

ipcMain.on('open_browser', (event, arg) => {
	shell.openExternal(arg.url);
});
app.on('activate', () => {
	if (hapWindow) {
		if (LocalStore.getStore('configs').hapWindow) {
			hapWindow.show();
		}
	} else if (
		!onWaitingServer &&
		LocalStore.getStore('configs') &&
		LocalStore.getStore('configs').isSetup
	) {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		createhapWindow(hapWindow, serve);
	} else {
		if (setupWindow) {
			setupWindow.show();
		}
	}
});

app.on('before-quit', (e) => {
	e.preventDefault();
	const appSetting = LocalStore.getStore('appSetting');
	if (appSetting && appSetting.timerStarted) {
		e.preventDefault();
		setTimeout(() => {
			willQuit = true;
			timeTrackerWindow.webContents.send('stop_from_tray', {
				quitApp: true
			});
		}, 1000);
	} else {
		app.exit(0);
		if (serverDesktop) serverDesktop.kill();
		if (serverhap) serverhap.kill();
	}
});

// On OS X it is common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q
function quit() {
	if (process.platform !== 'darwin') {
		app.quit();
	}
}
