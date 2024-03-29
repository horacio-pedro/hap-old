import * as loginPage from '../support/Base/pages/Login.po';
import { LoginPageData } from '../support/Base/pagedata/LoginPageData';
import * as organizationInventoryPage from '../support/Base/pages/OrganizationInventory.po';
import { OrganizationInventoryPageData } from '../support/Base/pagedata/OrganizationInventoryPageData';
import * as dashboradPage from '../support/Base/pages/Dashboard.po';

describe('Organization inventory test', () => {
	before(() => {
		cy.visit('/');
		loginPage.verifyTitle();
		loginPage.verifyLoginText();
		loginPage.clearEmailField();
		loginPage.enterEmail(LoginPageData.email);
		loginPage.clearPasswordField();
		loginPage.enterPassword(LoginPageData.password);
		loginPage.clickLoginButton();
		dashboradPage.verifyCreateButton();
	});

	it('Should be able to add new product category', () => {
		cy.visit('/#/pages/organization/inventory/all');
		organizationInventoryPage.gridBtnExists();
		organizationInventoryPage.gridBtnClick(1);
		organizationInventoryPage.addCategoryOrTypeButtonVisible();
		organizationInventoryPage.clickAddCategoryOrTypeButton(
			OrganizationInventoryPageData.categoryButtonText
		);
		organizationInventoryPage.addButtonVisible();
		organizationInventoryPage.clickAddButton();
		organizationInventoryPage.nameInputVisible();
		organizationInventoryPage.enterNameInputData(
			OrganizationInventoryPageData.productCategoryName
		);
		organizationInventoryPage.descriptionInputVisivle();
		organizationInventoryPage.enterDescriptionInputData(
			OrganizationInventoryPageData.productCategoryDescription
		);
		organizationInventoryPage.saveButtonVisible();
		organizationInventoryPage.clickSaveButton();
		organizationInventoryPage.backButtonVisible();
		organizationInventoryPage.clickBackButton();
	});
	it('Should be able to add new product type', () => {
		organizationInventoryPage.clickAddCategoryOrTypeButton(
			OrganizationInventoryPageData.typeButtonText
		);
		organizationInventoryPage.addButtonVisible();
		organizationInventoryPage.clickAddButton();
		organizationInventoryPage.nameInputVisible();
		organizationInventoryPage.enterNameInputData(
			OrganizationInventoryPageData.productTypeName
		);
		organizationInventoryPage.descriptionInputVisivle();
		organizationInventoryPage.enterDescriptionInputData(
			OrganizationInventoryPageData.productTypeDescription
		);
		organizationInventoryPage.saveButtonVisible();
		organizationInventoryPage.clickSaveButton();
		organizationInventoryPage.backButtonVisible();
		organizationInventoryPage.clickBackButton();
	});
	it('Should be able to add new inventory', () => {
		organizationInventoryPage.addButtonVisible();
		organizationInventoryPage.clickAddButton();
		organizationInventoryPage.languageDropdownVisible();
		organizationInventoryPage.clickLangaugeDropdown();
		organizationInventoryPage.clickDropdownOption(
			OrganizationInventoryPageData.defaultInventoryLanguage
		);
		organizationInventoryPage.nameInputVisible();
		organizationInventoryPage.enterNameInputData(
			OrganizationInventoryPageData.inventoryName
		);
		organizationInventoryPage.codeInputVisible();
		organizationInventoryPage.enterCodeInputData(
			OrganizationInventoryPageData.defaultInventoryCode
		);
		organizationInventoryPage.productTypeDropdownVisible();
		organizationInventoryPage.clickProductTypeDrodpwon();
		organizationInventoryPage.clickDropdownOption(
			OrganizationInventoryPageData.productTypeName
		);
		organizationInventoryPage.productCategoryDropdownVisible();
		organizationInventoryPage.clickProductCategoryDrodpwon();
		organizationInventoryPage.clickDropdownOption(
			OrganizationInventoryPageData.productCategoryName
		);
		organizationInventoryPage.descriptionInputVisivle();
		organizationInventoryPage.enterDescriptionInputData(
			OrganizationInventoryPageData.productInventoryDescription
		);
		organizationInventoryPage.saveButtonVisible();
		organizationInventoryPage.clickSaveButton();
		organizationInventoryPage.waitMessageToHide();
		organizationInventoryPage.clickBackButton();
	});
	it('Should be able to edit inventory', () => {
		organizationInventoryPage.tableRowVisible();
		organizationInventoryPage.selectTableRow(0);
		organizationInventoryPage.editButtonVisible();
		organizationInventoryPage.clickEditButton();
		organizationInventoryPage.nameInputVisible();
		organizationInventoryPage.enterNameInputData(
			OrganizationInventoryPageData.productTypeName
		);
		organizationInventoryPage.codeInputVisible();
		organizationInventoryPage.enterCodeInputData(
			OrganizationInventoryPageData.defaultInventoryCode
		);
		organizationInventoryPage.descriptionInputVisivle();
		organizationInventoryPage.enterDescriptionInputData(
			OrganizationInventoryPageData.productInventoryDescription
		);
		organizationInventoryPage.saveButtonVisible();
		organizationInventoryPage.clickSaveButton();
		organizationInventoryPage.waitMessageToHide();
		organizationInventoryPage.clickBackButton();
	});
	it('Should be able to delete inventory', () => {
		organizationInventoryPage.selectTableRow(0);
		organizationInventoryPage.deleteButtonVisible();
		organizationInventoryPage.clickDeleteButton();
		organizationInventoryPage.confirmDeleteButtonVisible();
		organizationInventoryPage.clickConfirmDeleteButton();
	});
	it('Should be able to edit product category', () => {
		organizationInventoryPage.waitMessageToHide();
		organizationInventoryPage.addCategoryOrTypeButtonVisible();
		organizationInventoryPage.clickAddCategoryOrTypeButton(
			OrganizationInventoryPageData.categoryButtonText
		);
		organizationInventoryPage.tableRowVisible();
		organizationInventoryPage.selectTableRow(0);
		organizationInventoryPage.editButtonVisible();
		organizationInventoryPage.clickEditButton();
		organizationInventoryPage.nameInputVisible();
		organizationInventoryPage.enterNameInputData(
			OrganizationInventoryPageData.productCategoryName
		);
		organizationInventoryPage.descriptionInputVisivle();
		organizationInventoryPage.enterDescriptionInputData(
			OrganizationInventoryPageData.productCategoryDescription
		);
		organizationInventoryPage.saveButtonVisible();
		organizationInventoryPage.clickSaveButton();
	});
	it('Should be able to delete product category', () => {
		organizationInventoryPage.waitMessageToHide();
		organizationInventoryPage.selectTableRow(0);
		organizationInventoryPage.deleteButtonVisible();
		organizationInventoryPage.clickDeleteButton();
		organizationInventoryPage.confirmDeleteButtonVisible();
		organizationInventoryPage.clickConfirmDeleteButton();
		organizationInventoryPage.backButtonVisible();
		organizationInventoryPage.clickBackButton();
	});
	it('Should be able to edit product type', () => {
		organizationInventoryPage.addCategoryOrTypeButtonVisible();
		organizationInventoryPage.clickAddCategoryOrTypeButton(
			OrganizationInventoryPageData.typeButtonText
		);
		organizationInventoryPage.tableRowVisible();
		organizationInventoryPage.selectTableRow(0);
		organizationInventoryPage.editButtonVisible();
		organizationInventoryPage.clickEditButton();
		organizationInventoryPage.nameInputVisible();
		organizationInventoryPage.enterNameInputData(
			OrganizationInventoryPageData.productTypeName
		);
		organizationInventoryPage.descriptionInputVisivle();
		organizationInventoryPage.enterDescriptionInputData(
			OrganizationInventoryPageData.productTypeDescription
		);
		organizationInventoryPage.saveButtonVisible();
		organizationInventoryPage.clickSaveButton();
	});
	it('Should be able to delete product type', () => {
		organizationInventoryPage.tableRowVisible();
		organizationInventoryPage.selectTableRow(0);
		organizationInventoryPage.deleteButtonVisible();
		organizationInventoryPage.clickDeleteButton();
		organizationInventoryPage.confirmDeleteButtonVisible();
		organizationInventoryPage.clickConfirmDeleteButton();
	});
});
