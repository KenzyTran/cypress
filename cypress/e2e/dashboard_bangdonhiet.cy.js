/// <reference types="cypress" />

import 'cypress-real-events/support';

describe('Kiểm tra dữ liệu phần Bảng đồ nhiệt của 3 sàn', () => {
    const validUsername = 'Username';
    const validPassword = 'Password';

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

    it('Kiểm tra bảng đồ nhiệt cho tất cả các options', () => {
        // Lấy giờ và phút hiện tại
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Đặt ngưỡng thời gian cho từng option
        const startEmptyHour = 8; // 8h30
        const startEmptyMinute = 30;
        const endEmptyHourForOption1 = 9; // 9h15
        const endEmptyMinuteForOption1 = 15;
        const endEmptyHourForOption23 = 9; // 9h00

        cy.get('ul.c-sidebar-nav-dropdown-items')
            .find('div') // Tìm tất cả các thẻ div bên trong ul
            .each(($option, index, $list) => {
                if (index === 0) {
                    // Option 1 là trạng thái mặc định, không cần click
                    cy.log('Đang kiểm tra option 1 (mặc định)');
                } else {
                    // Click vào HXN và UpCOM
                    cy.wrap($option).click();
                    cy.log(`Đang kiểm tra option ${index + 1}`);
                }

                // Kiểm tra canvas với mỗi option
                cy.get('.market-analysis-heatmap_right')
                    .find('canvas[data-zr-dom-id="zr_0"]') // Tìm canvas với data-zr-dom-id="zr_0"
                    .should('exist') // Đảm bảo canvas tồn tại
                    .then(($canvas) => {
                        const canvasElement = $canvas[0];

                        // Lấy ngữ cảnh 2D của canvas
                        const ctx = canvasElement.getContext('2d');
                        const canvasWidth = canvasElement.width;
                        const canvasHeight = canvasElement.height;

                        // Lấy dữ liệu pixel từ canvas
                        const pixelData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

                        // Kiểm tra dữ liệu canvas dựa trên thời gian và option
                        const isCanvasEmpty = Array.from(pixelData).every(value => value === 0);

                        if (index === 0) {
                            // Logic cho Option 1
                            if (
                                (currentHour === startEmptyHour &&
                                    currentMinute >= startEmptyMinute &&
                                    currentMinute < 60) ||
                                (currentHour === endEmptyHourForOption1 && currentMinute < endEmptyMinuteForOption1)
                            ) {
                                // Thời gian từ 8h30 đến 9h15, canvas phải rỗng
                                expect(isCanvasEmpty).to.be.true;
                                cy.log('Canvas rỗng cho HSX trong khoảng thời gian từ 8h30 đến 9h15');
                            } else {
                                // Sau 9h15, canvas phải có dữ liệu
                                expect(isCanvasEmpty).to.be.false;
                                cy.log('Canvas có dữ liệu cho HSX sau 9h15');
                            }
                        } else {
                            // Logic cho Option 2 và Option 3
                            if (
                                (currentHour === startEmptyHour &&
                                    currentMinute >= startEmptyMinute &&
                                    currentMinute < 60) ||
                                (currentHour === endEmptyHourForOption23 && currentMinute < 0)
                            ) {
                                // Thời gian từ 8h30 đến 9h00, canvas phải rỗng
                                expect(isCanvasEmpty).to.be.true;
                                cy.log(`Canvas rỗng cho option ${index + 1} trong khoảng thời gian từ 8h30 đến 9h00`);
                            } else {
                                // Sau 9h00, canvas phải có dữ liệu
                                expect(isCanvasEmpty).to.be.false;
                                cy.log(`Canvas có dữ liệu cho option ${index + 1} sau 9h00`);
                            }
                        }
                    });

                // Dừng vòng lặp sau khi kiểm tra option 3
                if (index === 2) {
                    cy.log('Dừng vòng lặp.');
                    return false; // Dừng vòng lặp
                }
            });
    });
});
