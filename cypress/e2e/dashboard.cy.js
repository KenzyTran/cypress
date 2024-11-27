describe('Dashboard Functionality', () => {

    function login() {
        cy.visit('/login');
        cy.get('input[placeholder="Username"]').type('teamapp@happy.live');
        cy.get('input[placeholder="Password"]').type('1368$$kfsp$$1368');
        cy.get('button[type="submit"]').click();
        cy.url().should('not.include', '/login');
    }

    it('Should display time on chart not delayed by more than 3 minutes', () => {
        login();
        cy.visit('/dashboard');

        // Chờ nội dung biểu đồ tải
        cy.get('.chart.bg-chart.echarts', { timeout: 10000 })
          .should('exist')
          .and('be.visible');

        // Kích hoạt tooltip
        cy.get('.chart.bg-chart.echarts')
          .first()
          .trigger('mouseover');

        // Chờ tooltip xuất hiện
        cy.get('body')
          .find('.echarts-tooltip', { timeout: 5000 })
          .should('exist')
          .and('be.visible')
          .then(($tooltip) => {
              const timeText = $tooltip.text().trim();
              console.log('Tooltip time text:', timeText);

              // Phân tích văn bản thời gian
              const [hoursStr, minutesStr] = timeText.split(':');
              const hours = parseInt(hoursStr, 10);
              const minutes = parseInt(minutesStr, 10);

              // Tạo đối tượng Date cho thời gian hiển thị
              const displayedTime = new Date();
              displayedTime.setHours(hours, minutes, 0, 0);

              // Lấy thời gian hiện tại
              const currentTime = new Date();

              // Tính sự khác biệt thời gian tính bằng phút
              const timeDifference = Math.abs(currentTime - displayedTime) / (1000 * 60);
              expect(timeDifference).to.be.lessThan(3);
          });
    });
});
