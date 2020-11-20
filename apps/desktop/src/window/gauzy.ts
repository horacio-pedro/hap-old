import log from 'electron-log';
import { screen, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { environment } from '../environments/environment';
import { LocalStore } from '../libs/getSetStore';
export function createHapWindow(hapWindow, serve) {
	log.info('createHapWindow started');

	let mainWindowSettings: Electron.BrowserWindowConstructorOptions = null;
	mainWindowSettings = windowSetting();
	hapWindow = new BrowserWindow(mainWindowSettings);
	let launchPath;

	if (serve) {
		require('electron-reload')(__dirname, {
			electron: require(`${__dirname}/../../../../node_modules/electron`)
		});

		launchPath = `http://localhost:${environment.HAP_UI_DEFAULT_PORT}`;

		hapWindow.loadURL(launchPath);
	} else {
		launchPath = url.format({
			pathname: path.join(__dirname, '../index.html'),
			protocol: 'file:',
			slashes: true
		});

		hapWindow.loadURL(launchPath);
	}

	const appConfig = LocalStore.getStore('configs');
	if (!appConfig.hapWindow) {
		hapWindow.hide();
	}

	// console.log('launched electron with:', launchPath);
	// hapWindow.webContents.toggleDevTools();

	hapWindow.on('close', (e) => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		e.preventDefault();
		hapWindow.hide(); // hapWindow = null;
	});

	initMainListener();

	log.info('createHapWindow completed');

	return hapWindow;
}

const windowSetting = () => {
	const sizes = screen.getPrimaryDisplay().workAreaSize;
	const mainWindowSettings: Electron.BrowserWindowConstructorOptions = {
		frame: true,
		resizable: true,
		focusable: true,
		fullscreenable: true,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			enableRemoteModule: true
		},
		width: sizes.width,
		height: sizes.height,
		x: 0,
		y: 0,
		title: 'HAP'
	};
	return mainWindowSettings;
};

function initMainListener() {
	ipcMain.on('ELECTRON_BRIDGE_HOST', (event, msg) => {
		console.log('msg received', msg);
		if (msg === 'ping') {
			event.sender.send('ELECTRON_BRIDGE_CLIENT', 'pong');
		}
	});
}

export function getApiBaseUrl(configs) {
	if (configs.serverUrl) return configs.serverUrl;
	else {
		return configs.port
			? `http://localhost:${configs.port}`
			: `http://localhost:${environment.API_DEFAULT_PORT}`;
	}
}
