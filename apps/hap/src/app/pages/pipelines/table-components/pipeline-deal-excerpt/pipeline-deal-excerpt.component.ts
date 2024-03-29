import { Component, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { IDeal } from '@hap/models';

@Component({
	selector: 'ga-pipeline-excerpt',
	template: `{{ rowData?.stage.name }}`
})
export class PipelineDealExcerptComponent implements ViewCell {
	@Input()
	value: string | number;

	@Input()
	rowData: IDeal;
}
