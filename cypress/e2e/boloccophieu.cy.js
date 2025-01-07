/// <reference types="cypress" />

describe('Kiểm tra Bộ lọc cổ phiếu với các tab khác nhau', () => { 
    const validUsername = 'username';
    const validPassword = 'password';
  
    const login = () => {
        cy.visit('https://kfsp.vn/login');
        cy.get('[type="email"]').type(validUsername);
        cy.get('[type="password"]').type(validPassword);
        cy.get('#btn-login').click();
        cy.url().should('include', '/dashboard');
    };

    /**
     * Hàm checkTable()
     *  - Lấy dữ liệu từ table
     *  - Bỏ cột đầu tiên (rỗng)
     *  - Kiểm tra không có giá trị nào là undefined
     */
    const checkTable = () => {
        let allValues = [];

        cy.get('table.table.table-row-all.table-fixed.table-hover.table-bordered')
          .find('tbody')
          .find('tr')
          .each(($tr) => {
            let rowValues = [];
            cy.wrap($tr)
              .find('td')
              .each(($td) => {
                rowValues.push($td.text());
              })
              .then(() => {
                allValues.push(rowValues);
              });
          })
          .then(() => {
            // Bỏ cột đầu tiên của mỗi dòng (phần tử mảng đầu tiên - thường là "")
            allValues.forEach((row) => {
              row.shift();
            });

            // Kiểm tra toàn bộ giá trị không được là 'undefined'
            allValues.forEach((row, rowIndex) => {
              row.forEach((cell, cellIndex) => {
                expect(cell, `Row ${rowIndex} - Col ${cellIndex}`).to.not.equal(undefined);
              });
            });

            // In ra console để dễ debug
            cy.log('Dữ liệu sau khi bỏ cột đầu:', JSON.stringify(allValues));
            console.log('Dữ liệu sau khi bỏ cột đầu:', allValues);
          });
    };
  
    it('Kiểm tra dữ liệu của bộ lọc cổ phiếu trên từng tab', () => {
        // Đăng nhập
        login();
        
        // Vào trang "Bộ Lọc"
        cy.visit('https://kfsp.vn/bo-loc');
        cy.viewport(1280, 720);
        cy.wait(2000);
        // Lần đầu kiểm tra table (tab mặc định) nếu cần
        checkTable();

        cy.on('uncaught:exception', (err) => {
            if (err.message.includes('Navigating to current location')) {
              return false; // Bỏ qua lỗi này
            }
          });

        // Lưu ý: li[2] (theo kiểu con người đếm) tương ứng với .eq(1) trong Cypress (do 0-based index)
        for (let i = 1; i < 9; i++) {

            cy.get('ul.nav.nav-tabs.mt-1')
              .find('li')
              .eq(i)
              .find('a')
              .click(); // force: true nếu cần click dù element bị che
            cy.wait(2000);

            // Gọi lại hàm checkTable() sau mỗi lần click
            checkTable();
        }
    });
});
