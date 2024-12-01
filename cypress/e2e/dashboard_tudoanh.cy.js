/// <reference types="cypress" />

import 'cypress-real-events/support';

describe('Kiểm tra dữ liệu biểu đồ Tự doanh với các option khác nhau', () => {
    const validUsername = 'username';
    const validPassword = 'password';

    before(() => {
        // Đăng nhập vào hệ thống
        cy.visit('https://kfsp.vn/login');
        cy.viewport(1280, 720);
        cy.get('[type="email"]').type(validUsername);
        cy.get('[type="password"]').type(validPassword);
        cy.get('#btn-login').click();

        // Kiểm tra đăng nhập thành công
        cy.url().should('include', '/dashboard');
    });

    it('Đổi option và kiểm tra dữ liệu khi hover vào Tự doanh', () => {
        const options = ['VNINDEX', 'HNXIndex', 'UpcomIndex'];

        options.forEach((option) => {
            cy.wait(2000);

            // Đổi giá trị trong dropdown
            cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
                .find('select.form-control')
                .eq(1)
                .should('be.visible')
                .select(option); // Đổi sang option tương ứng

            // Kiểm tra nút "Tự doanh"
            cy.get('div.mb-0.d-flex.flex-column.card-wrapper.indexforeign-chart')
                .find('div.p-0.card-label')
                .find('div.d-flex.justify-content-between')
                .find('div.d-flex')
                .find('div.btn-label')  
                .eq(1)  
                .should('be.visible')
                .click();  

            const hoverPositionX = 800;
            const hoverPositionY = 175 * 0.6;

            // Hover vào tọa độ
            cy.get('div.mb-0.d-flex.flex-column.card-wrapper.indexforeign-chart')
                .find('div.card-content.height-100.position-relative')
                .find('div.d-flex.align-items-center')
                .find('x-vue-echarts.chart.bg-chart.pl-2.echarts')
                .eq(0)
                .find('canvas')
                .should('exist')
                .and('be.visible')
                .trigger('mouseover', hoverPositionX, hoverPositionY, { force: true });

            cy.wait(2000);

            // Thử hover với cách khác
            cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts')
                .find('canvas')
                .realHover({ position: { x: 340, y: 50 } });

            // Lấy dữ liệu từ div thứ 2 trong x-vue-echarts
            cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts')
                .eq(0)
                .find('div')
                .eq(1)
                .then(($div) => {
                    const data = $div.text();
                    cy.log(`Dữ liệu từ (${option}):`, data);
                });
        });
    });
});
