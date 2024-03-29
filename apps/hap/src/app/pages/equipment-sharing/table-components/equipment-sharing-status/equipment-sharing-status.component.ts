import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { RequestApprovalStatusTypesEnum } from '@hap/models';

@Component({
	selector: 'ngx-equipment-sharing-status',
	templateUrl: './equipment-sharing-status.component.html'
})
export class EquipmentSharingStatusComponent implements ViewCell, OnInit {
	@Input()
	rowData: any;

	value: string | number;

	ngOnInit(): void {
		switch (this.value) {
			case RequestApprovalStatusTypesEnum.APPROVED:
				this.value = 'Approved';
				break;
			case RequestApprovalStatusTypesEnum.REFUSED:
				this.value = 'Refused';
				break;
			default:
				this.value = 'Requested';
				break;
		}
	}
}
