/// <reference types="cypress" />

import 'cypress-real-events/support';

describe('Kiểm tra dữ liệu khi hover vào Tự doanh với các option khác nhau', () => {
  const validUsername = 'Username';
  const validPassword = 'Password';

  const today = new Date();
  const yesterday = new Date();
  if (today.getDay() === 1) { // 1 tương ứng với thứ 2 trong JavaScript (0: Chủ nhật, 1: Thứ 2,...)
    yesterday.setDate(yesterday.getDate() - 3);
  } else {
    yesterday.setDate(yesterday.getDate() - 1);
  }
  const day = String(yesterday.getDate()).padStart(2, '0');
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const formattedYesterday = `${day}-${month}`;

  // Hàm login: được gọi ở đầu mỗi test
  const login = () => {
    cy.visit('https://kfsp.vn/login');
    cy.viewport(1280, 720);
    cy.get('[type="email"]').type(validUsername);
    cy.get('[type="password"]').type(validPassword);
    cy.get('#btn-login').click();
    cy.url().should('include', '/dashboard');
  };

  it('Kiểm tra mặc định VNINDEX', () => {
    // Đăng nhập
    login();
    cy.wait(2000);

    // Kiểm tra giá trị mặc định của dropdown là VNINDEX
    cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
      .find('select.form-control')
      .eq(1)
      .should('have.value', 'VNINDEX');

    // Nhấn nút "Tự doanh"
    cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
      .find('div.btn-label')
      .eq(10)
      .should('be.visible')
      .click();

    cy.wait(2000);

    // Hover chuột vào biểu đồ sử dụng thẻ có id="prop_charts"
    cy.get('#prop_charts')
      .find('canvas')
      .realHover({ position: { x: 325, y: 50 } });

    // Lấy dữ liệu hiển thị khi hover và log ra kết quả
    cy.get('#prop_charts')
      .find('div')
      .eq(1)
      .then(($div) => {
        const data = $div.text();
        expect(data).to.include(formattedYesterday); // Nếu cần assert dữ liệu
        cy.log('Dữ liệu mặc định VNINDEX:', data);
      });
  });

  it('Kiểm tra hover với các option khác (HNXIndex, UpcomIndex)', () => {
    // Đăng nhập
    login();

    const options = ['HNXIndex', 'UpcomIndex'];

    options.forEach((option) => {
      cy.wait(2000);

      // Đổi giá trị trong dropdown sang option tương ứng
      cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
        .find('select.form-control')
        .eq(1)
        .should('be.visible')
        .select(option);

      cy.wait(2000);

      // Nhấn nút "Tự doanh"
      cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
        .find('div.btn-label')
        .eq(10)
        .should('be.visible')
        .click();

      cy.wait(2000);

      // Hover chuột vào biểu đồ sử dụng thẻ có id="prop_charts"
      cy.get('#prop_charts')
        .find('canvas')
        .realHover({ position: { x: 340, y: 50 } });

      // Lấy dữ liệu hiển thị khi hover và log ra kết quả
      cy.get('#prop_charts')
        .find('div')
        .eq(1)
        .then(($div) => {
          const data = $div.text();
          expect(data).to.include(formattedYesterday); // Nếu cần assert dữ liệu
          cy.log(`Dữ liệu (${option}):`, data);
        });
    });
  });
});
