import * as loginPage from '../support/Base/pages/Login.po';
import { LoginPageData } from '../support/Base/pagedata/LoginPageData';
import * as organizationRecurringExpensesPage from '../support/Base/pages/OrganizationRecurringExpenses.po';
import { OrganizationRecurringExpensesPageData } from '../support/Base/pagedata/OrganizationRecurringExpensesPageData';
import * as dashboradPage from '../support/Base/pages/Dashboard.po';

describe('Organization recurring expenses test', () => {
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
	it('Should be able to add new expense', () => {
		cy.visit('/#/pages/organization/expense-recurring');
		organizationRecurringExpensesPage.addButtonVisible();
		organizationRecurringExpensesPage.clickAddButton();
		organizationRecurringExpensesPage.expenseDropdownVisible();
		organizationRecurringExpensesPage.clickExpenseDropdown();
		organizationRecurringExpensesPage.selectExpenseOptionDropdown(
			OrganizationRecurringExpensesPageData.defaultExpense
		);
		organizationRecurringExpensesPage.expenseValueInputVisible();
		organizationRecurringExpensesPage.enterExpenseValueInputData(
			OrganizationRecurringExpensesPageData.defaultValue
		);
		organizationRecurringExpensesPage.saveExpenseButtonVisible();
		organizationRecurringExpensesPage.clickSaveExpenseButton();
	});
	it('Should be able to edit expense', () => {
		organizationRecurringExpensesPage.waitMessageToHide();
		organizationRecurringExpensesPage.settingsButtonVisible();
		organizationRecurringExpensesPage.clickSettingsButton();
		organizationRecurringExpensesPage.editButtonVisible();
		organizationRecurringExpensesPage.clickEditButton();
		organizationRecurringExpensesPage.expenseDropdownVisible();
		organizationRecurringExpensesPage.clickExpenseDropdown();
		organizationRecurringExpensesPage.selectExpenseOptionDropdown(
			OrganizationRecurringExpensesPageData.defaultExpense
		);
		organizationRecurringExpensesPage.expenseValueInputVisible();
		organizationRecurringExpensesPage.enterExpenseValueInputData(
			OrganizationRecurringExpensesPageData.defaultValue
		);
		organizationRecurringExpensesPage.saveExpenseButtonVisible();
		organizationRecurringExpensesPage.clickSaveExpenseButton();
	});
	it('Should be able to delete expense', () => {
		organizationRecurringExpensesPage.waitMessageToHide();
		organizationRecurringExpensesPage.settingsButtonVisible();
		organizationRecurringExpensesPage.clickSettingsButton();
		organizationRecurringExpensesPage.deleteButtonVisible();
		organizationRecurringExpensesPage.clickDeleteButton();
		organizationRecurringExpensesPage.deleteOnlyThisRadioButtonVisible();
		organizationRecurringExpensesPage.clickDeleteOnlyThisRadioButton();
	});
});
