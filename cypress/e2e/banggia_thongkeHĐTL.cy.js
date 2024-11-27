/// <reference types="cypress" />

describe('Kiểm tra số liệu ở mục Bảng giá', () => {
    const validUsername = 'teamapp@happy.live';
    const validPassword = '1368$$kfsp$$1368';
    const expectedValues = { OI: '195,991', KL_mua: '834', KL_ban: '1,882', KLGD_rong: '2,716' }; // Giá trị mong muốn
  
    before(() => {
      // Đăng nhập trước
      cy.visit('https://kfsp.vn/login');
      cy.get('[type="email"]').type(validUsername);
      cy.get('[type="password"]').type(validPassword);
      cy.get('#btn-login').click();
  
      // Kiểm tra đăng nhập thành công
      cy.url().should('include', '/dashboard');
    });
  
    it('Truy cập Bảng giá và kiểm tra dữ liệu', () => {
      // Truy cập Bảng giá
      cy.visit('https://kfsp.vn/bang-gia');
  
      // Click vào thẻ 'Thống kê HĐTL'
      cy.contains('a', 'Thống kê HĐTL').click();
  
      // Lưu toàn bộ dữ liệu bảng vào mảng
      let tableData = [];
  
      cy.get('table.table-row-all') // Chọn bảng cần kiểm tra
        .find('tbody')
        .find('tr')
        .each(($tr) => {
          let rowData = [];
          cy.wrap($tr).find('td').each(($td) => {
            rowData.push($td.text().trim()); // Lưu giá trị của cột vào mảng
          }).then(() => {
            tableData.push(rowData); // Lưu toàn bộ dòng vào mảng tableData
          });
        })
        .then(() => {
          console.log('Dữ liệu bảng:', tableData); // In ra toàn bộ dữ liệu của bảng
  
          // Lấy 2 dòng đầu tiên
          const firstRow = tableData[0];
          const secondRow = tableData[1];
  
          // Kiểm tra giá trị cột đầu tiên của 2 dòng phải khác nhau
          expect(firstRow[0]).not.to.eq(secondRow[0]);
  
          // So sánh các giá trị mong muốn với cột 10, 12, 13, 14
          const OI_value = firstRow[9]; // Cột 10 (index 9)
          const KL_mua_value = firstRow[11]; // Cột 12 (index 11)
          const KL_ban_value = firstRow[12]; // Cột 13 (index 12)
          const KLGD_rong_value = firstRow[13]; // Cột 14 (index 13)
  
          // Kiểm tra từng giá trị
          expect(OI_value).to.eq(expectedValues.OI);
          expect(KL_mua_value).to.eq(expectedValues.KL_mua);
          expect(KL_ban_value).to.eq(expectedValues.KL_ban);
          expect(KLGD_rong_value).to.eq(expectedValues.KLGD_rong);
  
          console.log('So sánh hoàn tất: Các giá trị khớp với kỳ vọng.');
        });
    });
  });
  