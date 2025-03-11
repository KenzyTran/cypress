/// <reference types="cypress" />

import 'cypress-real-events/support';

describe('Check valid data tự doanh', () => {
  const validUsername = 'Username';
  const validPassword = 'Password';

  const today = new Date();
  const yesterday = new Date();
  if (today.getDay() === 1) {
    yesterday.setDate(yesterday.getDate() - 3);
  } else {
    yesterday.setDate(yesterday.getDate() - 1);
  }
  const day = String(yesterday.getDate()).padStart(2, '0');
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const formattedYesterday = `${day}-${month}`;

  const login = () => {
    cy.visit('https://kfsp.vn/login');
    cy.viewport(1280, 720);
    cy.get('[type="email"]').type(validUsername);
    cy.get('[type="password"]').type(validPassword);
    cy.get('#btn-login').click();
    cy.url().should('include', '/dashboard');
  };

  it('Check valid data Tự Doanh', () => {
    login();
    cy.wait(2000);

    const options = ['VNINDEX', 'HNXIndex', 'UpcomIndex'];

    options.forEach((option) => {
      cy.wait(2000);
      cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
        .find('div.btn-label')
        .eq(13)
        .should('be.visible')
        .click();

      cy.wait(2000);
      cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
        .find('select.form-control')
        .eq(1)
        .should('be.visible')
        .select(option, { force: true });

      cy.wait(2000);
      const xPosition = option === 'UpcomIndex' ? 320 : 310;

      cy.get('#prop_charts')
        .find('canvas')
        .realHover({ position: { x: xPosition, y: 50 } });

      cy.get('#prop_charts')
        .find('div')
        .eq(1)
        .then(($div) => {
          const data = $div.text();
          expect(data).to.include(formattedYesterday);
          cy.log(`Dữ liệu (${option}):`, data);
        });
    });
  });
});
