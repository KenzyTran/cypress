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

  it('Bấm chọn vào Thanh khoản và kiểm tra dữ liệu', () => {
    cy.wait(3000);

    cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
      .find('div.btn-label')
      .eq(14)
      .should('be.visible')
      .click();

    // Thực hiện hover từ X = 45 đến X = 835
    for (let x = hoverStartX; x <= hoverEndX; x += 10) {
      cy.get('x-vue-echarts.chart.bg-chart.echarts')
        .eq(3)
        .find('canvas')
        .realHover({ position: { x, y: 50 } });

      cy.wait(200); // Chờ phản hồi từ biểu đồ

      cy.get('x-vue-echarts.chart.bg-chart.echarts')
        .eq(3)
        .find('div')
        .eq(1)
        .then(($div) => {
          const data = $div.text();
          cy.log(`Hover tại X: ${x}, Dữ liệu: ${data}`);

          if (data.includes('Thời gian')) {
            const timeMatch = data.match(/Thời gian: (\d{2}:\d{2}:\d{2})/);
            if (timeMatch) {
              const hoverTime = timeMatch[1];

              // Loại trừ thời gian từ 11:31:00 đến 12:59:59
              if (hoverTime >= '11:31:00' && hoverTime <= '12:59:59') {
                cy.log('Thời gian nằm trong khoảng bị loại trừ, không kiểm tra dữ liệu.');
              } else {
                const now = new Date();
                const currentTime = now.toTimeString().slice(0, 8);

                if (hoverTime >= '09:00:00' && hoverTime <= currentTime) {
                  // Hover time trong khoảng từ 09:00:00 đến thời gian thực
                  expect(data).to.include('Tổng GTGD hôm nay');
                } else {
                  // Hover time vượt qua thời gian thực
                  expect(data).to.not.include('Tổng GTGD hôm nay');
                }
              }
            }
          }
        });
    }
  });
});
