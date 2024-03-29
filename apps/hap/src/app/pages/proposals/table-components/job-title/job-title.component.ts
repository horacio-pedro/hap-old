import { Component, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	template: ` <span>{{ rowData.jobTitle }}</span> `
})
export class JobTitleComponent implements ViewCell {
	@Input()
	rowData: any;

	value: string | number;
}
