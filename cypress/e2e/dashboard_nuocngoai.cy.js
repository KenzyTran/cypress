/// <reference types="cypress" />

import 'cypress-real-events/support';

describe('Kiểm tra dữ liệu khi hover vào Nước ngoài', () => {
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

    it('Bấm chọn vào biểu đồ nước ngoài và kiểm tra dữ liệu', () => {
        // Lấy thời gian hiện tại
        const now = new Date();
        const nineAM = new Date();
        nineAM.setHours(10, 0, 0, 0);

        // Xác định ngày cần kiểm tra
        const today = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

        const expectedDate = now < nineAM ? yesterdayStr : today;

        cy.wait(2000);

        // Chọn option
        cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
            .find('select.form-control')
            .eq(2)
            .should('be.visible')
            .select(1); // Đổi sang option 20 phiên
        cy.wait(2000);

        // Hover vào biểu đồ
        cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts')
            .find('canvas')
            .realHover({ position: { x: 340, y: 50 } });

        // Lấy dữ liệu và kiểm tra
        cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts')
            .eq(0)
            .find('div')
            .eq(1)
            .then(($div) => {
                const data = $div.text();
                cy.log(`Data: ${data}`);

                // Kiểm tra thời gian trong dữ liệu
                const match = data.match(/Thời gian: (\d{2}-\d{2})/);
                if (match) {
                    const chartDate = match[1];
                    cy.log(`Ngày trên biểu đồ: ${chartDate}`);
                    expect(chartDate).to.equal(expectedDate);
                } else {
                    throw new Error('Không tìm thấy thời gian trong dữ liệu.');
                }
            });
    });
});
