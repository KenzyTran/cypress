/// <reference types="cypress" />

import 'cypress-real-events/support';

describe('Kiểm tra trang Dashboard', () => {
    const validUsername = 'teamapp@happy.live';
    const validPassword = '1368$$kfsp$$1368';

    const hoverStartX = 45;
    const hoverEndX = 835;

    function login() {
        // Đăng nhập vào hệ thống
        cy.visit('https://kfsp.vn/login');
        cy.viewport(1280, 720);
        cy.get('[type="email"]').type(validUsername);
        cy.get('[type="password"]').type(validPassword);
        cy.get('#btn-login').click();

        // Kiểm tra đăng nhập thành công
        cy.url().should('include', '/dashboard');
    }

    it('Kiểm tra Bảng chỉ số quốc tế có nhảy dữ liệu', () => {
        login();
        cy.wait(2000);
        cy.contains('.btn-label', 'Quốc tế')
            .click();

        cy.get('select.form-control')
            .eq(0) // Chọn dropdown đầu tiên (hoặc số index mong muốn)
            .select('Tiền tệ và hàng hoá quốc tế')
            .should('have.value', 'internationalCurrencyandCommodities_1'); 
        
        cy.wait(2000);

        cy.get('.dashboard-world-index_item .text-right.text-downchange span')
            .should('be.visible') // Đảm bảo phần tử hiển thị
            .invoke('text') // Lấy nội dung text của phần tử
            .then((initialValue) => {
    
        cy.log('Giá ban đầu:', initialValue);
        
        cy.wait(3000);

        cy.get('.dashboard-world-index_item .text-right.text-downchange span')
            .invoke('text')
            .should('not.eq', initialValue) // So sánh giá trị hiện tại khác giá trị ban đầu
            .then((updatedValue) => {
            cy.log('Giá sau thay đổi:', updatedValue);
        });
    });
        
});

    it('Kiểm tra phần Bảng đồ nhiệt của 3 sàn', () => {
        login();
        // Lấy giờ và phút hiện tại
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Đặt ngưỡng thời gian cho từng option
        const startEmptyHour = 8; // 8h30
        const startEmptyMinute = 30;
        const endEmptyHourForOption1 = 9; // 9h15
        const endEmptyMinuteForOption1 = 15;
        const endEmptyHourForOption23 = 9; // 9h00

        // Chờ ul chứa danh sách các option được render
        cy.get('ul.c-sidebar-nav-dropdown-items')
            .find('div') // Tìm tất cả các thẻ div bên trong ul
            .each(($option, index, $list) => {
                if (index === 0) {
                    // Option 1 là trạng thái mặc định, không cần click
                    cy.log('Đang kiểm tra option 1 (mặc định)');
                } else {
                    // Click vào option 2 và option 3
                    cy.wrap($option).click();
                    cy.log(`Đang kiểm tra option ${index + 1}`);
                }

                // Kiểm tra canvas với mỗi option
                cy.get('.market-analysis-heatmap_right')
                    .find('canvas[data-zr-dom-id="zr_0"]') // Tìm canvas với data-zr-dom-id="zr_0"
                    .should('exist') // Đảm bảo canvas tồn tại
                    .then(($canvas) => {
                        const canvasElement = $canvas[0];

                        // Lấy ngữ cảnh 2D của canvas
                        const ctx = canvasElement.getContext('2d');
                        const canvasWidth = canvasElement.width;
                        const canvasHeight = canvasElement.height;

                        // Lấy dữ liệu pixel từ canvas
                        const pixelData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

                        // Kiểm tra dữ liệu canvas dựa trên thời gian và option
                        const isCanvasEmpty = Array.from(pixelData).every(value => value === 0);

                        if (index === 0) {
                            // Logic cho Option 1
                            if (
                                (currentHour === startEmptyHour &&
                                    currentMinute >= startEmptyMinute &&
                                    currentMinute < 60) ||
                                (currentHour === endEmptyHourForOption1 && currentMinute < endEmptyMinuteForOption1)
                            ) {
                                // Thời gian từ 8h30 đến 9h15, canvas phải rỗng
                                expect(isCanvasEmpty).to.be.true;
                                cy.log('Canvas rỗng cho HSX trong khoảng thời gian từ 8h30 đến 9h15');
                            } else {
                                // Sau 9h15, canvas phải có dữ liệu
                                expect(isCanvasEmpty).to.be.false;
                                cy.log('Canvas có dữ liệu cho HSX sau 9h15');
                            }
                        } else {
                            // Logic cho Option 2 và Option 3
                            if (
                                (currentHour === startEmptyHour &&
                                    currentMinute >= startEmptyMinute &&
                                    currentMinute < 60) ||
                                (currentHour === endEmptyHourForOption23 && currentMinute < 0)
                            ) {
                                // Thời gian từ 8h30 đến 9h00, canvas phải rỗng
                                expect(isCanvasEmpty).to.be.true;
                                cy.log(`Canvas rỗng cho option ${index + 1} trong khoảng thời gian từ 8h30 đến 9h00`);
                            } else {
                                // Sau 9h00, canvas phải có dữ liệu
                                expect(isCanvasEmpty).to.be.false;
                                cy.log(`Canvas có dữ liệu cho option ${index + 1} sau 9h00`);
                            }
                        }
                    });

                // Dừng vòng lặp sau khi kiểm tra option 3
                if (index === 2) {
                    cy.log('Dừng vòng lặp.');
                    return false; // Dừng vòng lặp
                }
            });
    });

    it('Bấm chọn mục IBD và kiểm tra phần Nỗ lực-kết quả', () => {
        login();

        cy.get('div.flexlayout__border.flexlayout__border_right') 
          .find('div.flexlayout__border_inner_tab_container.flexlayout__border_inner_tab_container_right') 
          .eq(0)
          .find('div.flexlayout__border_button_content')
          .eq(0) 
          .should('be.visible') 
          .click(); 

        cy.get('div.index_info_right_tab_wrapper-item.flex-fill')
          .eq(1)
          .click();

        cy.wait(2000);

        cy.get('x-vue-echarts.chart.bg-chart.echarts')
          .find('canvas')
          .eq(0)
          .realHover({ position: { x: 170, y: 50 }});
          
       cy.get('x-vue-echarts.chart.bg-chart.echarts')
       .eq(0)
       .find('div')
       .eq(1)
       .then(($div) => {
           const data = $div.text();
           cy.log(data);
       }); 
    });

    it('Kiểm tra biểu đồ Tự doanh của 3 sàn đã cập nhật dữ liệu ngày mới nhất', () => {
        login();
    
        const options = ['VNINDEX', 'HNXIndex', 'UpcomIndex'];
    
        options.forEach((option) => {
            cy.wait(2000);
    
            // Đổi giá trị trong dropdown
            cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
                .find('select.form-control')
                .eq(1)
                .should('be.visible')
                .select(option); // Đổi sang option tương ứng
    
            // Kiểm tra nút "Tự doanh"
            cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
                .find('div.btn-label')
                .eq(10)
                .should('be.visible')
                .click();
    
            cy.wait(2000);
    
            // Hover vào biểu đồ và lấy dữ liệu
            cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts') // id = 'prop_charts'
                .find('canvas')
                .realHover({ position: { x: 340, y: 50 } });
    
            cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts')
                .eq(0)
                .find('div')
                .eq(1)
                .then(($div) => {
                    const data = $div.text();
                    cy.log(`Dữ liệu (${option}):`, data);
    
                    // Trích xuất mốc thời gian từ dữ liệu
                    const match = data.match(/Thời gian: (\d{2}-\d{2})/);
                    if (match) {
                        const chartDate = match[1];
                        cy.log(`Ngày trên biểu đồ: ${chartDate}`);
    
                        // Xác định ngày hôm qua
                        const now = new Date();
                        const yesterday = new Date(now);
                        yesterday.setDate(now.getDate() - 1);
                        const expectedDate = yesterday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    
                        // So sánh mốc thời gian trích xuất được với expectedDate
                        expect(chartDate).to.equal(expectedDate);
                    } else {
                        throw new Error('Không tìm thấy thời gian trong dữ liệu.');
                    }
                });
        });
    });

    it('Kiểm tra biểu đồ Nước ngoài của 3 sàn đã cập nhật dữ liệu ngày mới nhất', () => {
        login();

        const options = ['VNINDEX', 'HNXIndex', 'UpcomIndex'];

        
            // Chọn option có value='history'
        cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
          .find('select.form-control')
          .eq(2)
          .should('be.visible')
          .select('history'); // Chọn option có value='history'

        cy.wait(2000);

        options.forEach((option) => {
            // Lấy thời gian hiện tại
            const now = new Date();
            const currentHour = now.getHours();

            // Xác định ngày cần kiểm tra
            const today = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

            // Nếu từ 0h đến 15h, expectedDate là hôm qua; sau 15h thì là hôm nay
            const expectedDate = currentHour < 15 ? yesterdayStr : today;

            cy.wait(2000);

            // Đổi giá trị trong dropdown
            cy.get('div.mx-1.mb-0.py-1.dropdown-label.form-group')
                .find('select.form-control')
                .eq(1)
                .should('be.visible')
                .select(option); // Đổi sang option tương ứng

            cy.wait(2000);

            // Hover vào biểu đồ
            cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts') // id='20_session_foreign_charts'
                .find('canvas')
                .realHover({ position: { x: 340, y: 50 } });

            // Lấy dữ liệu và kiểm tra
            cy.get('x-vue-echarts.chart.bg-chart.pl-2.echarts')
                .eq(0)
                .find('div')
                .eq(1)
                .then(($div) => {
                    const data = $div.text();
                    cy.log(`Data (${option}): ${data}`);

                    // Kiểm tra thời gian trong dữ liệu
                    const match = data.match(/Thời gian: (\d{2}-\d{2})/);
                    if (match) {
                        const chartDate = match[1];
                        cy.log(`Ngày trên biểu đồ: ${chartDate}`);
                        expect(chartDate).to.equal(expectedDate);
                    } else {
                        throw new Error('Không tìm thấy thời gian trong dữ liệu.');
                    }
                });
        });
    });

    it('Kiểm tra biểu đồ Phân loại dòng tiền 3 sàn đã cập nhật dữ liệu ngày mới nhất', () => {
        login();
        cy.wait(3000);
    
        // Bấm chọn tab "Phân loại dòng tiền" trước khi bắt đầu vòng lặp
        cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
            .find('div.btn-label')
            .eq(15)
            .should('be.visible')
            .click();
        
        cy.wait(2000);
    
        const options = ['VNINDEX', 'HNXINDEX', 'UPCOMINDEX'];
    
        options.forEach((option) => {
            cy.wait(2000);
    
            // Thay đổi option trong dropdown
            cy.get('div.mb-0.py-1.dropdown-label.form-group')
              .find('select.form-control')
              .eq(3)
              .should('be.visible')
              .select(option); // Đổi sang option tương ứng
            
            cy.wait(2000);
    
            // Hover vào biểu đồ
            cy.get('x-vue-echarts.chart.bg-chart.echarts')
                .eq(2)
                .find('canvas')
                .realHover({ position: { x: 1110, y: 70 } });
    
            // Lấy dữ liệu và kiểm tra
            cy.get('x-vue-echarts.chart.bg-chart.echarts')
                .eq(2)
                .find('div')
                .eq(1)
                .then(($div) => {
                    const data = $div.text();
                    cy.log(`Dữ liệu (${option}):`, data);
    
                    // Trích xuất ngày tháng từ dữ liệu
                    const dateMatch = data.match(/^(\d{2}-\d{2}-\d{4})/);
                    if (dateMatch) {
                        const dataDate = dateMatch[1];
                        cy.log(`Ngày trên biểu đồ: ${dataDate}`);
    
                        // Xác định ngày hôm qua
                        const now = new Date();
                        const yesterday = new Date(now);
                        yesterday.setDate(now.getDate() - 1);
                        const expectedDate = yesterday.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }).replace(/\//g, '-');
    
                        // So sánh ngày tháng trích xuất được với expectedDate
                        expect(dataDate).to.equal(expectedDate);
                    } else {
                        throw new Error('Không tìm thấy ngày trong dữ liệu.');
                    }
    
                    // ... các kiểm tra khác ...
                });
        });
    });

    it('Bấm chọn vào Thanh khoản và kiểm tra dữ liệu', () => {
        login()
        cy.wait(3000);
    
        cy.get('div.mb-0.d-flex.flex-column.card-wrapper')
          .find('div.btn-label')
          .eq(14)
          .should('be.visible')
          .click();
    
        // Thực hiện hover từ X = 45 đến X = 835
        for (let x = hoverStartX; x <= hoverEndX; x += 5) {
          cy.get('x-vue-echarts.chart.bg-chart.echarts') //id='liquid_chart'
            .eq(3)
            .find('canvas')
            .realHover({ position: { x, y: 50 } });
    
          cy.wait(200); // Chờ phản hồi từ biểu đồ 
    
          cy.get('x-vue-echarts.chart.bg-chart.echarts') //id='liquid_chart'
            .eq(3)
            .find('div')
            .eq(1)
            .then(($div) => {
              const data = $div.text();
              cy.log(`Hover tại X: ${x}, Dữ liệu: ${data}`);
    
              if (data.includes('Thời gian')) {
                const timeMatch = data.match(/Thời gian: (\d{2}:\d{2}:\d{2})/);
                if (timeMatch) {
                  const hoverTime = timeMatch[1];
    
                  // Loại trừ thời gian từ 11:31:00 đến 12:59:59
                  if (hoverTime >= '11:31:00' && hoverTime <= '12:59:59') {
                    cy.log('Thời gian nằm trong khoảng bị loại trừ, không kiểm tra dữ liệu.');
                  } else {
                    const now = new Date();
                    const currentTime = now.toTimeString().slice(0, 8);
    
                    if (hoverTime >= '09:00:00' && hoverTime <= currentTime) {
                      // Hover time trong khoảng từ 09:00:00 đến thời gian thực
                      expect(data).to.include('Tổng GTGD hôm nay');
                    } else {
                      // Hover time vượt qua thời gian thực
                      expect(data).to.not.include('Tổng GTGD hôm nay');
                    }
                  }
                }
              }
            });
        }
    });
});