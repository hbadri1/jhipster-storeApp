import { browser, ExpectedConditions as ec, protractor, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import { InvoiceComponentsPage, InvoiceDeleteDialog, InvoiceUpdatePage } from './invoice.page-object';

const expect = chai.expect;

describe('Invoice e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let invoiceComponentsPage: InvoiceComponentsPage;
  let invoiceUpdatePage: InvoiceUpdatePage;
  let invoiceDeleteDialog: InvoiceDeleteDialog;
  const username = process.env.E2E_USERNAME ?? 'admin';
  const password = process.env.E2E_PASSWORD ?? 'admin';

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing(username, password);
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load Invoices', async () => {
    await navBarPage.goToEntity('invoice');
    invoiceComponentsPage = new InvoiceComponentsPage();
    await browser.wait(ec.visibilityOf(invoiceComponentsPage.title), 5000);
    expect(await invoiceComponentsPage.getTitle()).to.eq('storeApp.invoice.home.title');
    await browser.wait(ec.or(ec.visibilityOf(invoiceComponentsPage.entities), ec.visibilityOf(invoiceComponentsPage.noResult)), 1000);
  });

  it('should load create Invoice page', async () => {
    await invoiceComponentsPage.clickOnCreateButton();
    invoiceUpdatePage = new InvoiceUpdatePage();
    expect(await invoiceUpdatePage.getPageTitle()).to.eq('storeApp.invoice.home.createOrEditLabel');
    await invoiceUpdatePage.cancel();
  });

  it('should create and save Invoices', async () => {
    const nbButtonsBeforeCreate = await invoiceComponentsPage.countDeleteButtons();

    await invoiceComponentsPage.clickOnCreateButton();

    await promise.all([
      invoiceUpdatePage.setDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM'),
      invoiceUpdatePage.setDetailsInput('details'),
      invoiceUpdatePage.statusSelectLastOption(),
      invoiceUpdatePage.paymentMethodSelectLastOption(),
      invoiceUpdatePage.setPaymentDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM'),
      invoiceUpdatePage.setPaymentAmountInput('5'),
      invoiceUpdatePage.orderSelectLastOption(),
    ]);

    await invoiceUpdatePage.save();
    expect(await invoiceUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

    expect(await invoiceComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
  });

  it('should delete last Invoice', async () => {
    const nbButtonsBeforeDelete = await invoiceComponentsPage.countDeleteButtons();
    await invoiceComponentsPage.clickOnLastDeleteButton();

    invoiceDeleteDialog = new InvoiceDeleteDialog();
    expect(await invoiceDeleteDialog.getDialogTitle()).to.eq('storeApp.invoice.delete.question');
    await invoiceDeleteDialog.clickOnConfirmButton();
    await browser.wait(ec.visibilityOf(invoiceComponentsPage.title), 5000);

    expect(await invoiceComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
