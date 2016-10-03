/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

helpers.configure(chai);

describe('Fiscal Year', function () {
  'use strict';

  const path = '#/fiscal';
  var pathNew = '#/fiscal/create';

  before(() => helpers.navigate(path));

  const fiscalYear = {
    label : 'A Special Fiscal Year',
    note : 'Note for the new fiscal Year',
    previous : 'Test Fiscal Year 2016'
  };

  it('blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(pathNew);

    // set invalid date range to test `number_of_months`
    components.dateInterval.range('01/02/2016', '01/01/2016');

    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('FiscalManageCtrl.fiscal.label');
    FU.validation.error('FiscalManageCtrl.fiscal.number_of_months');

    components.notification.hasDanger();
  });

  it('creates a new fiscalYear', function () {
    FU.input('FiscalManageCtrl.fiscal.label', fiscalYear.label);

    // select the proper date
    components.dateInterval.range('01/01/2018', '31/12/2018');
    FU.select('FiscalManageCtrl.fiscal.previous_fiscal_year_id', fiscalYear.previous);
    FU.input('FiscalManageCtrl.fiscal.note', fiscalYear.note);
    FU.buttons.submit();

    components.notification.hasSuccess();
  });


  it('edits a fiscal Year', function () {
    var updateButton = element.all(by.css('[data-fiscal-entry]'));
    updateButton.all(by.css('[data-method="update"]')).first().click();

    // modify the fiscal year label and note
    FU.input('FiscalManageCtrl.fiscal.label', 'Test Fiscal Year 2017 (update)');
    components.dateInterval.range('01/01/2017', '31/12/2017');
    FU.input('FiscalManageCtrl.fiscal.note', 'Test 2017 (update)');

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('delete a fiscal Year', function () {
    var deleteButton = element.all(by.css('[data-fiscal-entry]'));
    deleteButton.all(by.css('[data-method="delete"]')).first().click();

    // click the alert asking for permission
    components.modalAction.confirm();
    components.notification.hasSuccess();
  });

  it('set the opening balance for the first fiscal year', () => {
    helpers.navigate(path);

    // the last in the list is the oldest
    var updateButton = element.all(by.css('[data-fiscal-entry]'));
    updateButton.all(by.css('[data-method="update"]')).last().click();

    // click on the opening balance button
    element(by.css('[data-action="opening-balance"]')).click();

    // activate the edition of the opening balance
    element(by.css('[data-action="edit-opening-balance"]')).click();

    // actions in the grid
    let account1 = 3627;
    let account2 = 3628;
    let account3 = 3630;

    element(by.css(`[data-debit-account="${account1}"]`)).clear().sendKeys(150);
    element(by.css(`[data-debit-account="${account2}"]`)).clear().sendKeys(150);
    element(by.css(`[data-credit-account="${account3}"]`)).clear().sendKeys(300);

    FU.buttons.submit();
    components.notification.hasSuccess();

  });

  it('forbid not balanced submission', () => {
    helpers.navigate(path);

    // the last in the list is the oldest
    var updateButton = element.all(by.css('[data-fiscal-entry]'));
    updateButton.all(by.css('[data-method="update"]')).last().click();

    // click on the opening balance button
    element(by.css('[data-action="opening-balance"]')).click();

    // activate the edition of the opening balance
    element(by.css('[data-action="edit-opening-balance"]')).click();

    // actions in the grid
    let account1 = 3627;
    let account2 = 3628;
    let account3 = 3630;

    element(by.css(`[data-debit-account="${account1}"]`)).clear().sendKeys(150);
    element(by.css(`[data-debit-account="${account2}"]`)).clear().sendKeys(150);
    element(by.css(`[data-credit-account="${account3}"]`)).clear().sendKeys(200);

    FU.buttons.submit();
    components.notification.hasDanger();
    expect(element(by.css('[data-status="not-balanced"]')).isPresent()).to.eventually.equal(true);

  });

  it('forbid negative value for total debit or total credit', () => {
    helpers.navigate(path);

    // the last in the list is the oldest
    var updateButton = element.all(by.css('[data-fiscal-entry]'));
    updateButton.all(by.css('[data-method="update"]')).last().click();

    // click on the opening balance button
    element(by.css('[data-action="opening-balance"]')).click();

    // activate the edition of the opening balance
    element(by.css('[data-action="edit-opening-balance"]')).click();

    // actions in the grid
    let account1 = 3627;
    let account2 = 3628;
    let account3 = 3630;

    element(by.css(`[data-debit-account="${account1}"]`)).clear().sendKeys(150);
    element(by.css(`[data-debit-account="${account2}"]`)).clear().sendKeys(150);
    element(by.css(`[data-credit-account="${account3}"]`)).clear().sendKeys(-200);

    FU.buttons.submit();
    components.notification.hasDanger();
    expect(element(by.css('[data-status="not-positive"]')).isPresent()).to.eventually.equal(true);

  });

});