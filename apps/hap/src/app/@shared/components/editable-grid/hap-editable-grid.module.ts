import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
	NbButtonModule,
	NbIconModule,
	NbCardModule,
	NbListModule,
	NbDialogModule
} from '@nebular/theme';

import { Store } from '../../../@core/services/store.service';
import { ThemeModule } from '../../../@theme/theme.module';
import { HapEditableGridComponent } from './hap-editable-grid.component';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const NbModules = [
	NbButtonModule,
	NbIconModule,
	NbCardModule,
	NbListModule,
	NbDialogModule.forChild()
];

@NgModule({
	imports: [
		ThemeModule,
		[...NbModules],
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		})
	],
	declarations: [HapEditableGridComponent],
	exports: [HapEditableGridComponent],
	entryComponents: [],
	providers: [Store]
})
export class HapEditableGridModule {}
