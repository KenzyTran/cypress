describe('Kiểm thử WebSocket với sự kiện getincreasesdecreasesnganh', () => {
    before(() => {
        // Truy cập trang đăng nhập và thực hiện đăng nhập
        cy.visit('https://kfsp.vn/login');

        // Nhập thông tin đăng nhập
        cy.get('input[placeholder="Username"]').type('teamapp@happy.live');
        cy.get('input[placeholder="Password"]').type('1368$$kfsp$$1368');
        cy.get('button[type="submit"]').click();

        // Xác nhận đã đăng nhập thành công
        cy.url().should('include', '/dashboard');
    });

    it('Mô phỏng sự kiện getincreasesdecreasesnganh và kiểm tra phản hồi', () => {
        // Khởi tạo kết nối WebSocket giả với Cypress WebSocket Plugin
        cy.mockWebSocket('wss://ta.kfsp.vn/ws/socket.io')
          .registerSocketRequestResponse(
              { type: 'getincreasesdecreasesnganh', payload: ["NGÂN HÀNG", "BẤT ĐỘNG SẢN", "CHỨNG KHOÁN"] },
              { type: 'response', payload: { data: 'Giả lập phản hồi từ server' } }
          )
          .visit('/'); // Đảm bảo rằng trang đã tải

        // Kiểm tra trang có nút kích hoạt sự kiện không
        cy.contains('Cypress Websocket Plugin').should('exist');

        // Gửi sự kiện và kiểm tra phản hồi từ server
        cy.get('button').contains('Trigger WebSocket Event').click();
        cy.get('pre').contains('Giả lập phản hồi từ server');
    });
});
