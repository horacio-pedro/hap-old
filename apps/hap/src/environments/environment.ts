// NOTE: Auto-generated file
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// 'ng build --env=prod' then 'environment.prod.ts' will be used instead.
// The list of which env maps to which file can be found in '.angular-cli.json'.

import { Environment } from './model';
import { CloudinaryConfiguration } from '@cloudinary/angular-5.x';
import { ElectronService } from 'ngx-electron';

let API_BASE_URL = 'http://localhost:3000';
let IS_ELECTRON = false;

// https://github.com/electron/electron/issues/2288#issuecomment-337858978
const userAgent = navigator.userAgent.toLowerCase();
if (userAgent.indexOf(' electron/') > -1) {
	try {
		const el: ElectronService = new ElectronService();
		const variableGlobal = el.remote.getGlobal('variableGlobal');
		API_BASE_URL = variableGlobal.API_BASE_URL;
		IS_ELECTRON = true;
	} catch(e) {
	}
}

export const environment: Environment = {
  production:  false,

  API_BASE_URL: API_BASE_URL,
  COMPANY_NAME: 'Conexões Infinito, Lda',
  COMPANY_SITE: 'HAP',
  COMPANY_LINK: 'https://ever.co/',
  COMPANY_SITE_LINK: 'https://hap.ao',
  COMPANY_GITHUB_LINK: 'https://github.com/ever-co',
  COMPANY_FACEBOOK_LINK: 'https://www.facebook.com/happlatform',
  COMPANY_TWITTER_LINK: 'https://twitter.com/happlatform',
  COMPANY_LINKEDIN_LINK: 'https://www.linkedin.com/company/ever-co.',
  CLOUDINARY_CLOUD_NAME: 'dv6ezkfxg',
  CLOUDINARY_API_KEY: '256868982483961',
  GOOGLE_AUTH_LINK: 'http://localhost:3000/api/auth/google',
  FACEBOOK_AUTH_LINK: 'http://localhost:3000/api/auth/facebook',
  LINKEDIN_AUTH_LINK: 'http://localhost:3000/api/auth/linkedin',
  GITHUB_AUTH_LINK: 'http://localhost:3000/api/auth/github',
  TWITTER_AUTH_LINK: 'http://localhost:3000/api/auth/twitter',
  MICROSOFT_AUTH_LINK: 'http://localhost:3000/api/auth/microsoft',
  AUTH0_AUTH_LINK: 'http://localhost:3000/api/auth/auth0',
  NO_INTERNET_LOGO: 'assets/images/logos/logo_HAP.svg',
  SENTRY_DNS: 'https://19293d39eaa14d03aac4d3c156c4d30e@sentry.io/4397292',
  HUBSTAFF_REDIRECT_URI: 'http://localhost:4200/pages/integrations/hubstaff',
  IS_ELECTRON: IS_ELECTRON
};

export const cloudinaryConfiguration: CloudinaryConfiguration = {
  cloud_name: environment.CLOUDINARY_CLOUD_NAME,
  api_key: environment.CLOUDINARY_API_KEY
};

/*
* For easier debugging in development mode, you can import the following file
* to ignore zone related error stack frames such as 'zone.run', 'zoneDelegate.invokeTask'.
*
* This import should be commented out in production mode because it will have a negative impact
* on performance if an error is thrown.
*/
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
