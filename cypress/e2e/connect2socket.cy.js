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
            cy.log('result1111',result)
        //   expect(result).to.have.property('success', true);
        });
  
    });
  
    after(() => {
      // Ngắt kết nối sau khi hoàn thành kiểm thử
    //   cy.task('disconnectSocket').then((result) => {
    //     // expect(result).to.have.property('success', true);
    //     // expect(result).to.have.property('message', 'Disconnected from Socket.IO server');
    //     // expect(result)
    //   });
    });
 });
