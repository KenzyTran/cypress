/// <reference types="cypress" />

describe('Kiểm tra số liệu cổ phiếu ở trang Phân Tích Cơ Bản', () => {
    const validUsername = 'Username';
    const validPassword = 'Password';
    const stockData = [ // Mảng chứa thông tin mã và giá trị mong muốn
      { stockcode: 'BSR', expectedValue: '3,100,499,66' },

    ];
  
    before(() => {
      // Đăng nhập trước
      cy.visit('https://kfsp.vn/login');
      cy.get('[type="email"]').type(validUsername);
      cy.get('[type="password"]').type(validPassword);
      cy.get('#btn-login').click();
  
      // Kiểm tra đăng nhập thành công
      cy.url().should('include', '/dashboard');
    });
  
    it('Truy cập trang Phân Tích Cơ Bản và kiểm tra số lượng cổ phiếu', () => {
      stockData.forEach((data) => {
        const { stockcode, expectedValue } = data; 
  
        // Truy cập trang Phân Tích Cơ Bản
        cy.visit('https://kfsp.vn/phan-tich-co-ban');
  
        // Tìm ô input với placeholder="Mã CK" và nhập mã chứng khoán
        cy.get('input.form-control[placeholder="Mã CK"]').eq(0)
          .clear() 
          .type(stockcode) 
          .type('{enter}'); 
  
        // Lưu toàn bộ dữ liệu bảng vào mảng
        let tableData = [];
  
        cy.get('table.table-row-stripped')  // Lấy bảng
          .find('tbody')
          .find('tr')
          .each(($tr) => {
            let rowData = [];
            cy.wrap($tr).find('td').each(($td) => {
              rowData.push($td.text().trim());  // Lưu từng giá trị của cột vào mảng
            }).then(() => {
              tableData.push(rowData);  // Lưu toàn bộ dòng vào mảng tableData
            });
          })
          .then(() => {
            console.log('Dữ liệu bảng:', tableData); // In ra toàn bộ bảng sau khi thu thập dữ liệu
  
            // Lặp qua từng mã chứng khoán trong mảng stockData
            stockData.forEach((data) => {
              const { stockcode, expectedValue } = data;
  
              // Tìm dòng chứa mã chứng khoán và so sánh giá trị
              tableData.forEach((row) => {
                if (row.includes(stockcode)) { // Kiểm tra nếu dòng có mã chứng khoán
                  const index = row.indexOf(stockcode);  // Lấy vị trí của mã chứng khoán
                  const valueToCheck = row[index + 1];  // Giá trị cần kiểm tra nằm ở cột kế tiếp
  
                  console.log(`Mã chứng khoán: ${stockcode}, Giá trị thu được: ${valueToCheck}`); // In ra giá trị tìm được
  
                  // So sánh giá trị thu được với giá trị mong đợi
                  expect(valueToCheck).to.eq(expectedValue); // Kiểm tra giá trị
                }
              });
            });
          });
      });
    });
  });
  
