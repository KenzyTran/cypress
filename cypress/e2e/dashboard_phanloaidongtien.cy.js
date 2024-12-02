/// <reference types="cypress" />
import 'cypress-real-events/support';

describe('Kiểm tra dữ liệu thanh khoản', () => {
  const validUsername = 'Username';
  const validPassword = 'Password';
  const hoverStartX = 45;
  const hoverEndX = 835;

  before(() => {
    // Đăng nhập vào phần mềm
    cy.visit('https://kfsp.vn/login');
    cy.viewport(1280, 720);
    cy.get('[type="email"]').type(validUsername);
    cy.get('[type="password"]').type(validPassword);
    cy.get('#btn-login').click();

    // Kiểm tra đăng nhập thành công
    cy.url().should('include', '/dashboard');
  });

  it('Bấm chọn vào Phân loại dòng tiền và kiểm tra dữ liệu', () => {
    cy.wait(3000);

    cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
      .find('div.btn-label')
      .eq(15)
      .should('be.visible')
      .click();

    cy.wait(2000);
    
    cy.get('x-vue-echarts.chart.bg-chart.echarts')
      .eq(2)
      .find('canvas')
      .realHover({ position: { x: 1100, y: 70 } });

      cy.get('x-vue-echarts.chart.bg-chart.echarts')
      .eq(2)
      .find('div')
      .eq(1)
      .then(($div) => {
        const data = $div.text();
        cy.log(data);
    
        // Trích xuất giá trị CN và TC khác ròng
        const cnTcMatch = data.match(/CN và TC khác ròng: ([\-\d.,]+) tỷ VNĐ/);
        const cnTcValue = cnTcMatch ? parseFloat(cnTcMatch[1].replace(/,/g, '')) : null;
    
        // Trích xuất giá trị Tự doanh ròng
        const tuDoanhMatch = data.match(/Tự doanh ròng: ([\-\d.,]+) tỷ VNĐ/);
        const tuDoanhValue = tuDoanhMatch ? parseFloat(tuDoanhMatch[1].replace(/,/g, '')) : null;
    
        // Trích xuất giá trị Nước ngoài ròng
        const nuocNgoaiMatch = data.match(/Nước ngoài ròng: ([\-\d.,]+) tỷ VNĐ/);
        const nuocNgoaiValue = nuocNgoaiMatch ? parseFloat(nuocNgoaiMatch[1].replace(/,/g, '')) : null;
    
        // Kiểm tra các giá trị
        expect(cnTcValue).to.not.equal(0, 'CN và TC khác ròng phải khác 0');
        expect(tuDoanhValue).to.not.equal(0, 'Tự doanh ròng phải khác 0');
        expect(nuocNgoaiValue).to.not.equal(0, 'Nước ngoài ròng phải khác 0');
      });
  });
});
