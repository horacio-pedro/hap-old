import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../core';
import { Contact } from './contact.entity';
import { IContactCreateInput } from '@hap/models';

@Injectable()
export class ContactService extends CrudService<Contact> {
	constructor(
		@InjectRepository(Contact)
		private readonly contactRepository: Repository<Contact>
	) {
		super(contactRepository);
	}

	async saveContact(contactRequest: IContactCreateInput): Promise<Contact> {
		return this.contactRepository.save(contactRequest);
	}
}
