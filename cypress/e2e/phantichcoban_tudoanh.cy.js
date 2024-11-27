/// <reference types="cypress" />

describe('Kiểm tra số liệu tự doanh ở trang Phân Tích Cơ Bản', () => {
    const validUsername = 'teamapp@happy.live';
    const validPassword = '1368$$kfsp$$1368';
  
    // Mảng chứa thông tin mã và giá trị mong muốn
    const stockData = [
      { stockcode: 'SSI', expectedValue: '-2,283,020' },
      { stockcode: 'SCG', expectedValue: '44,200,000' },
      { stockcode: 'FOX', expectedValue: '630,790' }
    ];
  
    const login = () => {
      // Đăng nhập lại sau mỗi lần kiểm tra
      cy.visit('https://kfsp.vn/login');
      cy.get('[type="email"]').type(validUsername);
      cy.get('[type="password"]').type(validPassword);
      cy.get('#btn-login').click();
  
      // Kiểm tra đăng nhập thành công
      cy.url().should('include', '/dashboard');
    };
  
    stockData.forEach(({ stockcode, expectedValue }) => {
      it(`Kiểm tra mã ${stockcode} với giá trị mong muốn ${expectedValue}`, () => {
        // Đăng nhập lại
        login();
  
        // Truy cập trang Phân Tích Cơ Bản
        cy.visit('https://kfsp.vn/phan-tich-co-ban');
        cy.wait(2000);

  
        // Tìm ô input với placeholder="Mã CK" và nhập mã
        cy.get('input.form-control[placeholder="Mã CK"]').eq(0)
          .clear() // Xóa hết chữ trong ô input
          .type(stockcode) // Nhập mã chứng khoán
          .type('{enter}'); // Nhấn Enter để tìm kiếm
        
        cy.wait(2000);

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
            const value = $td.text().trim(); // Lấy giá trị, loại bỏ khoảng trắng
            firstRowValues.push(value); // Lưu vào mảng
          })
          .then(() => {
            console.log('Dòng 1:', firstRowValues); // In ra giá trị dòng 1
          });
  
        // Lấy giá trị của dòng thứ hai
        cy.get('table.table-row-stripped.table-foreign-transaction')
          .find('tbody')
          .find('tr')
          .eq(1) // Dòng thứ hai
          .find('td')
          .each(($td) => {
            const value = $td.text().trim(); // Lấy giá trị, loại bỏ khoảng trắng
            secondRowValues.push(value); // Lưu vào mảng
          })
          .then(() => {
            console.log('Dòng 2:', secondRowValues); // In ra giá trị dòng 2
          })
          .then(() => {
            // So sánh giá trị giữa hai dòng
            expect(firstRowValues[0]).not.to.eq(secondRowValues[0]); // Kiểm tra giá trị đầu tiên của 2 dòng phải khác nhau
  
            // So sánh số nước ngoài nhập và số trên phần mềm (Giả sử số nước ngoài nằm ở cột cuối)
            const actualForeignValue = firstRowValues.slice(-1)[0]; // Lấy giá trị cuối của dòng đầu tiên
            expect(actualForeignValue).to.eq(expectedValue); // So sánh với giá trị mong muốn

            // Reset mảng sau mỗi lần lặp
            firstRowValues = [];
            secondRowValues = [];
          });
      });
      
    });
  });
  