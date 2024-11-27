/// <reference types="cypress" />

describe('Kiểm tra giá cổ phiếu ở trang Phân Tích Cơ Bản', () => {
    const validUsername = 'Username';
    const validPassword = 'Password';
  
    // Danh sách mã và giá cổ phiếu cần kiểm tra
    const stockData = [
      { stockcode: 'VIC', expectedPrice: '40.85' }

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
  
    stockData.forEach(({ stockcode, expectedPrice }) => {
      it(`Kiểm tra giá cổ phiếu mã ${stockcode}`, () => {
        
        login();
        // Truy cập trang Phân Tích Cơ Bản
        cy.visit('https://kfsp.vn/phan-tich-co-ban');
  
        // Tìm ô input với placeholder="Mã CK" và nhập mã
        cy.get('input.form-control[placeholder="Mã CK"]').eq(0)
          .clear() // Xóa hết chữ trong ô input
          .type(stockcode) // Nhập mã chứng khoán
          .type('{enter}'); // Nhấn Enter để tìm kiếm
        
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
          .invoke('text') // Lấy nội dung text của thẻ <p>
          .then((text) => {
            const cleanText = text.trim();

            // Tách chuỗi, lấy phần trước dấu cách đầu tiên
            const actualPrice = cleanText.split(' ')[0]; 
        
            // Log ra giá trị thực tế để kiểm tra
            cy.log('Giá trị lấy được:', actualPrice);
            
            // Kiểm tra giá trị
            expect(actualPrice).to.eq(expectedPrice); // So sánh giá trị thực tế với giá trị mong muốn
          });
      });
    });
  });
  
