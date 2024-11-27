describe('Socket.IO and Cypress Integration Test', () => {
    before(() => {
      // Đăng nhập và kết nối đến Socket.IO server
      cy.task('loginAndConnectSocket').then((result) => {
        expect(result).to.have.property('success', true);
      });
    });
  
    it('Should send an event to the server and receive a response', () => {
      cy.task('emitSocketEvent', { event: 'getforeignseriesbyindex', payload: 'VNINDEX' })
        .then((result) => {
          // Kiểm tra rằng task trả về thành công
          expect(result).to.have.property('success', true);
  
          // In ra gói tin nhận được để kiểm tra trong quá trình phát triển
          cy.log('Received data from server:', JSON.stringify(result.data));
          
          // Bắt đầu kiểm tra nội dung gói tin trả về
          const data = result.data;
  
          // Kiểm tra các thuộc tính chính trong gói tin trả về
          expect(data).to.have.property('fbuy').and.to.be.an('array');
          expect(data).to.have.property('fsell').and.to.be.an('array');
          expect(data).to.have.property('stockcode', 'VNINDEX'); // Xác nhận mã chứng khoán là 'VNINDEX'
          expect(data).to.have.property('tradingdate').and.to.be.an('array');
  
          // Kiểm tra các giá trị trong từng mảng
          // Kiểm tra rằng mảng `fbuy` và `fsell` không rỗng và là chuỗi số
          expect(data.fbuy.length).to.be.greaterThan(0);
          expect(data.fsell.length).to.be.greaterThan(0);
          data.fbuy.forEach(value => expect(value).to.match(/^\d+(\.\d+)?$/)); // Chuỗi số
          data.fsell.forEach(value => expect(value).to.match(/^\d+(\.\d+)?$/)); // Chuỗi số
  
          // Kiểm tra `tradingdate` là các chuỗi ngày hợp lệ
          data.tradingdate.forEach(date => {
            expect(new Date(date).toString()).not.to.equal('Invalid Date'); // Kiểm tra định dạng ngày hợp lệ
          });
        });
    });
  
    after(() => {
      // Ngắt kết nối sau khi hoàn thành kiểm thử
      cy.task('disconnectSocket');
    });
  });
  