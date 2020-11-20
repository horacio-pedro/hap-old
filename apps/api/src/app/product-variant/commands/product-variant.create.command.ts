import { ICommand } from '@nestjs/cqrs';
import { IVariantCreateInput } from '@hap/models';

export class ProductVariantCreateCommand implements ICommand {
	static readonly type = '[ProductVariant] Register';

	constructor(public readonly productInput: IVariantCreateInput) {}
}
