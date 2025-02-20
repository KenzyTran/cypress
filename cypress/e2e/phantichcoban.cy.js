/// <reference types="cypress" />
import 'cypress-real-events/support';

Cypress.on('uncaught:exception', (err) => {
    cy.log('Lỗi không mong muốn:', err.message);
    return false;
});

const validUsername = 'teamapp@happy.live';
const validPassword = '1368$$kfsp$$1368';
const baseUrl = 'https://kfsp.vn';

//Thay bằng mã cần kiểm tra 3 bảng báo cáo tài chính
    const stockcode = 'VGT';

// Mảng chứa thông tin mã và giá trị mong muốn cho các test
const stockData_CoPhieu = [
    { stockcode: 'BSR', expectedValue: '3,100,499,616' },
];

// Nhập mã cổ phiếu và phần trăm sở hữu nước ngoài ngày mới nhất
const stockData_NuocNgoai = [
    { stockcode: 'SSI', expectedValue: '39.9%' },
    { stockcode: 'PVS', expectedValue: '19.58%' },

];

//Nhập mã cổ phiếu và số liệu mua bán ròng của tự doanh ngày mới nhất
const stockData_TuDoanh = [
    { stockcode: 'BGE', expectedValue: '-204,000' },
    { stockcode: 'PVS', expectedValue: '1,701,500' },
];

const stockData_Price = [
    { stockcode: 'VDP', expectedPrice: '33.1' },
    
];

const loginSetup = () => {
    cy.visit(`${baseUrl}/login`);
    cy.viewport(1280, 720);
    cy.get('[type="email"]').type(validUsername);
    cy.get('[type="password"]').type(validPassword);
    cy.get('#btn-login').click();
    cy.url().should('include', '/dashboard');
};

const calculateQuarter = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const currentQuarter = Math.ceil(currentMonth / 3);
    const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const previousYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
    const earlierQuarter = previousQuarter === 1 ? 4 : previousQuarter - 1;
    const earlierYear = previousQuarter === 1 ? previousYear - 1 : previousYear;

    return {
        currentQuarter,
        previousQuarter,
        previousYear,
        earlierQuarter,
        earlierYear,
    };
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

    it('Kiểm tra dữ liệu Tài chính doanh nghiệp hiển thị dữ liệu quý mới nhất', () => {
        cy.get('input.form-control[placeholder="Mã CK"]').first().clear().type(`${stockcode}{enter}`);
        cy.get('a.nav-link').contains('Tài chính doanh nghiệp').click();

        const { previousQuarter, previousYear } = calculateQuarter();
        const expectedQuarter = `Q${previousQuarter} ${previousYear}`;

        ['Bảng cân đối kế toán', 'Kết quả kinh doanh', 'Lưu chuyển tiền tệ', 'Chỉ tiêu tài chính'].forEach((tabName) => {
            cy.contains('a.nav-link', tabName).click();
            verifyTableHeader(2, expectedQuarter);
        });
    });

    it('Kiểm tra dữ liệu So sánh hiển thị dữ liệu quý mới nhất', () => {
        cy.get('a.nav-link').contains('So sánh').click();
        cy.wait(5000);
        cy.get('div.pr-3 span').should('include.text', 'BCTC Mới');
        // cy.get('div.table-scroll table').should('be.visible').within(() => {
        //     let stockcodeColumnIndex = -1;
        //     cy.get('thead th').each(($th, index) => {
        //         if ($th.text().trim() === stockcode) stockcodeColumnIndex = index;
        //     }).then(() => {
        //         if (stockcodeColumnIndex === -1) throw new Error('Không tìm thấy cột chứa stockcode');
        //         cy.get('tbody tr').each(($row) => {
        //             cy.wrap($row).find('td').eq(stockcodeColumnIndex).should('not.be.empty');
        //         });
        //     });
        // });
    });

    it('Kiểm tra dữ liệu 4M và CANSLIM hiển thị dữ liệu quý mới nhất', () =>  {
        cy.get('a.nav-link').contains('4M & CANSLIM').click();
        cy.get('div.pr-3 span').should('include.text', 'BCTC Mới');
    });

    it('Kiểm tra Biểu đồ tài chính hiển thị dữ liệu quý mới nhất', () => {
        cy.get('a.nav-link').contains('Biểu đồ').click();
        cy.wait(1000);  
        const { previousQuarter, previousYear } = calculateQuarter();
        const expectedQuarter = `Q${previousQuarter}.${previousYear.toString().slice(-2)}`;

        [1, 2, 4, 5].forEach((chartIndex) => {
            cy.get('x-vue-echarts.chart.bg-chart.echarts canvas').eq(chartIndex).realHover({ position: { x: 340, y: 150 } });
            cy.get('x-vue-echarts.chart.bg-chart.echarts')
            .eq(chartIndex)
            .find('div')
            .invoke('text')
            .then((data) => {
                cy.log(`Dữ liệu biểu đồ tại index ${chartIndex}:`, data);
                if (data.includes(expectedQuarter)) {
                    cy.log(`Dữ liệu quý trước được hiển thị chính xác: ${expectedQuarter}`);
                } else {
                    throw new Error(`Dữ liệu không khớp với quý trước: ${expectedQuarter}`);
                }
            });
        });
    });

    function checkLatestQuarter() {
        const { previousQuarter, previousYear } = calculateQuarter();
        return `quý ${previousQuarter} năm ${previousYear}`;
    }

    it('Kiểm tra hiển thị và click xem được các file BCTC gốc/BCTC với quý/năm mới nhất', () => {
        const latestQuarter = checkLatestQuarter(); // Hoặc gọi trực tiếp calculateQuarter
        cy.log(`Quý mới nhất dựa trên ngày hiện tại: ${latestQuarter}`);
        
        cy.get('a.nav-link').contains('Tin tức & Phân tích').click();
        const currentUrl = cy.url();
    
        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').first().within(() => {
            cy.get('td').eq(1).invoke('text').then((reportData) => {
                reportData = reportData.trim();
                cy.log('Dữ liệu trong cột 2:', reportData);
                expect(reportData).to.include(latestQuarter);
            });
    
            cy.get('td').eq(2).find('svg g path').first().click({ force: true });
            cy.url().should('not.equal', currentUrl);
        });
    });

    it('Kiểm tra hiển thị Nghị quyết, BC quản trị và click xem được các file báo cáo mới nhất, không bị lặp', () => {
        const { previousQuarter, previousYear } = calculateQuarter();
        const latestQuarter = `quý ${previousQuarter} năm ${previousYear}`;
    
        // Kiểm tra tab "Nghị quyết"
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
    
        // Kiểm tra tab "Báo cáo quản trị"
        cy.get('a.nav-link').contains('Báo cáo quản trị').click();
        const bcQuanTriUrl = cy.url();
    
        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').each(($row, index) => {
            if (index < 3) {
                cy.wrap($row).find('td').each(($cell) => {
                    cy.wrap($cell).should('not.be.empty');
                });
            }
        });
    
        cy.get('table.table.table-row-stripped.table-hover').eq(1).find('tbody tr').first().click();
        cy.url().should('not.equal', bcQuanTriUrl);
    });
});

describe('Kiểm tra trang Phân Tích Cơ Bản', () => {

    beforeEach(() => {
        // Đăng nhập vào hệ thống trước mỗi test
        cy.visit('https://kfsp.vn/login');
        cy.viewport(1280, 720);
        cy.get('[type="email"]').type(validUsername);
        cy.get('[type="password"]').type(validPassword);
        cy.get('#btn-login').click();

        // Kiểm tra đăng nhập thành công
        cy.url().should('include', '/dashboard');
    });

    it('Kiểm tra số lượng cổ phiếu đã cập nhật', () => {
        stockData_CoPhieu.forEach(({ stockcode, expectedValue }) => {
            // Truy cập trang Phân Tích Cơ Bản
            cy.visit('https://kfsp.vn/phan-tich-co-ban');

            // Tìm ô input với placeholder="Mã CK" và nhập mã chứng khoán
            cy.get('input.form-control[placeholder="Mã CK"]').eq(0)
                .clear()
                .type(stockcode)
                .type('{enter}');

            // Lưu toàn bộ dữ liệu bảng vào mảng
            let tableData = [];

            cy.get('table.table-row-stripped') // Lấy bảng
                .find('tbody')
                .find('tr')
                .each(($tr) => {
                    let rowData = [];
                    cy.wrap($tr).find('td').each(($td) => {
                        rowData.push($td.text().trim());
                    }).then(() => {
                        tableData.push(rowData);
                    });
                })
                .then(() => {
                    cy.log('Dữ liệu bảng:', tableData);

                    // Tìm dòng chứa mã chứng khoán và so sánh giá trị
                    tableData.forEach((row) => {
                        if (row.includes(stockcode)) {
                            const index = row.indexOf(stockcode);
                            const valueToCheck = row[index + 1];

                            cy.log(`Mã chứng khoán: ${stockcode}, Giá trị thu được: ${valueToCheck}`);

                            // So sánh giá trị thu được với giá trị mong đợi
                            expect(valueToCheck).to.eq(expectedValue);
                        }
                    });
                });
        });
    });

    it('Kiểm tra phần trăm sở hữu cổ phiếu của nước ngoài', () => {
        stockData_NuocNgoai.forEach(({ stockcode, expectedValue }) => {
            // Truy cập trang Phân Tích Cơ Bản
            cy.visit('https://kfsp.vn/phan-tich-co-ban');
            cy.wait(2000);

            // Tìm ô input với placeholder="Mã CK" và nhập mã
            cy.get('input.form-control[placeholder="Mã CK"]').eq(0)
                .clear()
                .type(stockcode)
                .type('{enter}');

            cy.wait(2000);

            // Click vào tab "Nước ngoài"
            cy.contains('a', 'Nước ngoài').click();

            cy.get('body').then(($body) => {
                if ($body.find('table.table-row-stripped.table-foreign-transaction').length > 0) {
                    cy.get('table.table-row-stripped.table-foreign-transaction').should('exist');
                } else {
                    cy.log('Bảng không tồn tại trên trang');
                }
            });

            let firstRowValues = [];
            let secondRowValues = [];

            // Lấy giá trị của dòng đầu tiên
            cy.get('table.table-row-stripped.table-foreign-transaction')
                .find('tbody')
                .find('tr')
                .eq(0) // Dòng đầu tiên
                .find('td')
                .each(($td) => {
                    const value = $td.text().trim();
                    firstRowValues.push(value);
                })
                .then(() => {
                    cy.log('Dòng 1:', firstRowValues);
                });

            // Lấy giá trị của dòng thứ hai
            cy.get('table.table-row-stripped.table-foreign-transaction')
                .find('tbody')
                .find('tr')
                .eq(1) // Dòng thứ hai
                .find('td')
                .each(($td) => {
                    const value = $td.text().trim();
                    secondRowValues.push(value);
                })
                .then(() => {
                    cy.log('Dòng 2:', secondRowValues);
                })
                .then(() => {
                    // So sánh giá trị giữa hai dòng
                    expect(firstRowValues[0]).not.to.eq(secondRowValues[0]);

                    // So sánh giá trị nước ngoài với giá trị mong muốn
                    const actualForeignValue = firstRowValues.slice(-1)[0];
                    expect(actualForeignValue).to.eq(expectedValue);

                    // Reset mảng sau mỗi lần lặp
                    firstRowValues = [];
                    secondRowValues = [];
                });
        });
    });

    it('Kiểm tra giá trị mua bán ròng của tự doanh', () => {
        stockData_TuDoanh.forEach(({ stockcode, expectedValue }) => {
            // Truy cập trang Phân Tích Cơ Bản
            cy.visit('https://kfsp.vn/phan-tich-co-ban');
            cy.wait(2000);

            // Tìm ô input với placeholder="Mã CK" và nhập mã
            cy.get('input.form-control[placeholder="Mã CK"]').eq(0)
                .clear()
                .type(stockcode)
                .type('{enter}');

            cy.wait(2000);

            // Click vào tab "Tự doanh"
            cy.contains('a', 'Tự doanh').click();

            cy.get('body').then(($body) => {
                if ($body.find('table.table-row-stripped.table-foreign-transaction').length > 0) {
                    cy.get('table.table-row-stripped.table-foreign-transaction').should('exist');
                } else {
                    cy.log('Bảng không tồn tại trên trang');
                }
            });

            let firstRowValues = [];
            let secondRowValues = [];

            // Lấy giá trị của dòng đầu tiên
            cy.get('table.table-row-stripped.table-foreign-transaction')
                .find('tbody')
                .find('tr')
                .eq(0) // Dòng đầu tiên
                .find('td')
                .each(($td) => {
                    const value = $td.text().trim();
                    firstRowValues.push(value);
                })
                .then(() => {
                    cy.log('Dòng 1:', firstRowValues);
                });

            // Lấy giá trị của dòng thứ hai
            cy.get('table.table-row-stripped.table-foreign-transaction')
                .find('tbody')
                .find('tr')
                .eq(1) // Dòng thứ hai
                .find('td')
                .each(($td) => {
                    const value = $td.text().trim();
                    secondRowValues.push(value);
                })
                .then(() => {
                    cy.log('Dòng 2:', secondRowValues);
                })
                .then(() => {
                    // So sánh giá trị giữa hai dòng
                    expect(firstRowValues[0]).not.to.eq(secondRowValues[0]);

                    // So sánh giá trị tự doanh với giá trị mong muốn
                    const actualValue = firstRowValues.slice(-1)[0];
                    expect(actualValue).to.eq(expectedValue);

                    // Reset mảng sau mỗi lần lặp
                    firstRowValues = [];
                    secondRowValues = [];
                });
        });
    });

    it('Kiểm tra giá cổ phiếu giao dịch không hưởng quyền', () => {
        stockData_Price.forEach(({ stockcode, expectedPrice }) => {
            // Truy cập trang Phân Tích Cơ Bản
            cy.visit('https://kfsp.vn/phan-tich-co-ban');
            
            cy.wait(2000);
            // Tìm ô input với placeholder="Mã CK" và nhập mã
            cy.get('input.form-control[placeholder="Mã CK"]').eq(0)
                .clear()
                .type(stockcode)
                .type('{enter}');

            cy.wait(2000);

            cy.get('div.card-body.p-0')
                .find('div.row.no-gutters')
                .find('div.py-2.pl-2.pr-0.col-xl-3')
                .find('div.d-flex.flex-column')
                .find('div.mb-2')
                .find('div.d-flex')
                .find('p')
                .should('exist')
                .should(($p) => {
                    expect($p).to.have.length(1);
                    expect($p.text().trim()).not.to.eq('');
                })
                .invoke('text')
                .then((text) => {
                    const cleanText = text.trim();

                    // Tách chuỗi, lấy phần trước dấu cách đầu tiên
                    const actualPrice = cleanText.split(' ')[0];

                    // Log ra giá trị thực tế để kiểm tra
                    cy.log('Giá trị lấy được:', actualPrice);

                    // Kiểm tra giá trị
                    expect(actualPrice).to.eq(expectedPrice);
                });
        });
    });
});