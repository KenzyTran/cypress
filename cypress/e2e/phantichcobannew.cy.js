/// <reference types="cypress" />
import 'cypress-real-events/support';

Cypress.on('uncaught:exception', (err) => {
    cy.log('Lỗi không mong muốn:', err.message);
    return false;
});

const validUsername = 'teamapp@happy.live';
const validPassword = '1368$$kfsp$$1368';
const baseUrl = 'https://kfsp.vn';

// ✅ NHẬP QUÝ KIỂM TRA TẠI ĐÂY — ví dụ: 'Q4 2024'
const manualExpectedQuarter = 'Q4 2024';

// ✅ Biến dùng cho các hiển thị dạng 'quý ... năm ...'
const latestQuarterText = manualExpectedQuarter
    .replace(/^Q(\d)\s(\d{4})$/, 'quý $1 năm $2');

const stockcode = 'VGT';

const loginSetup = () => {
    cy.visit(`${baseUrl}/login`);
    cy.viewport(1280, 720);
    cy.get('[type="email"]').type(validUsername);
    cy.get('[type="password"]').type(validPassword);
    cy.get('#btn-login').click();
    cy.url().should('include', '/dashboard');
};

const verifyTableHeader = (tableIndex, expectedQuarter) => {
    cy.get('table').eq(tableIndex).find('thead th').last().should(($th) => {
        const headerText = $th.text().trim();
        expect(headerText).to.equal(expectedQuarter);
    });
};

describe('Kiểm tra mục Phân tích cơ bản', () => {
    before(() => cy.session('login', loginSetup));

    beforeEach(() => {
        cy.session('login', loginSetup);
        cy.visit(`${baseUrl}/phan-tich-co-ban`);
        cy.viewport(1280, 720);
    });

    it('Kiểm tra dữ liệu Tài chính doanh nghiệp hiển thị đúng quý', () => {
        cy.get('input.form-control[placeholder="Mã CK"]').first().clear().type(`${stockcode}{enter}`);
        cy.get('a.nav-link').contains('Tài chính doanh nghiệp').click();

        ['Bảng cân đối kế toán', 'Kết quả kinh doanh', 'Lưu chuyển tiền tệ', 'Chỉ tiêu tài chính'].forEach((tabName) => {
            cy.contains('a.nav-link', tabName).click();
            verifyTableHeader(2, manualExpectedQuarter);
        });
    });

    it('Kiểm tra Biểu đồ tài chính hiển thị đúng quý', () => {
        cy.get('a.nav-link').contains('Biểu đồ').click();
        cy.wait(1000);

        const expectedQuarter = manualExpectedQuarter.replace(' 20', '.');

        [1, 2, 4, 5].forEach((chartIndex) => {
            cy.get('x-vue-echarts.chart.bg-chart.echarts canvas').eq(chartIndex).realHover({ position: { x: 340, y: 150 } });
            cy.get('x-vue-echarts.chart.bg-chart.echarts')
                .eq(chartIndex)
                .find('div')
                .invoke('text')
                .then((data) => {
                    cy.log(`Dữ liệu biểu đồ tại index ${chartIndex}:`, data);
                    if (data.includes(expectedQuarter)) {
                        cy.log(`✅ Biểu đồ hiển thị đúng quý: ${expectedQuarter}`);
                    } else {
                        throw new Error(`❌ Biểu đồ không khớp quý: ${expectedQuarter}`);
                    }
                });
        });
    });

    it('Kiểm tra BCTC gốc hiển thị đúng quý', () => {
        cy.get('a.nav-link').contains('Tin tức & Phân tích').click();
        const currentUrl = cy.url();

        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').first().within(() => {
            cy.get('td').eq(1).invoke('text').then((text) => {
                const reportData = text.trim();
                expect(reportData).to.include(latestQuarterText);
            });

            cy.get('td').eq(2).find('svg g path').first().click({ force: true });
            cy.url().should('not.equal', currentUrl);
        });
    });

    it('Kiểm tra Nghị quyết và BC quản trị hiển thị đúng dữ liệu mới nhất', () => {
        cy.get('a.nav-link').contains('Tin tức & Phân tích').click();
        cy.get('a.nav-link').contains('Nghị quyết').click();
        const currentUrl = cy.url();

        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').each(($row, index) => {
            if (index < 3) {
                cy.wrap($row).find('td').each(($cell) => {
                    cy.wrap($cell).should('not.be.empty');
                });
            }
        });

        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').first().click();
        cy.url().should('not.equal', currentUrl);

        cy.get('a.nav-link').contains('Báo cáo quản trị').click();
        const bcUrl = cy.url();

        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').each(($row, index) => {
            if (index < 3) {
                cy.wrap($row).find('td').each(($cell) => {
                    cy.wrap($cell).should('not.be.empty');
                });
            }
        });

        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').first().click();
        cy.url().should('not.equal', bcUrl);
    });
});
