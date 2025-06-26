describe('test dashboard', () => {

    const validUsername = 'username';
    const validPassword = '123456123456';

    beforeEach(() => {
        cy.visit('https://kfsp.vn/login');
        cy.viewport(1280, 720); //Chỉnh size màn hình
        cy.get('[type="email"]').type(validUsername);
        cy.get('[type="password"]').type(validPassword);
        cy.get('#btn-login').click();
        cy.wait(5000);
    });    it('should test all charts in one session - NN & TD, UPCOM, and HNXINDEX', () => {
        // === TEST NN & TD với Tự doanh ===
        cy.log('=== Testing NN & TD with Nước ngoài ===');
        
        // Tìm và click vào thẻ span có class "tab-label" và text "NN & TD"
        cy.get('span.tab-label').contains('NN & TD').click();
        cy.wait(2000);
        cy.get('span.tab-label').contains('NN & TD').should('be.visible');
        
        cy.get('canvas[data-zr-dom-id="zr_0"]').eq(1).trigger('mousemove', 310, 40);
        cy.wait(1000);
        
        cy.get('body').then(() => {
            cy.get('div').contains('Thời gian:').invoke('text').then((tooltipText) => {
                cy.log('NN & TD - Full tooltip text: ' + tooltipText);
                const dateMatch = tooltipText.match(/Thời gian:\s*(\d{2}-\d{2})/);
                const extractedDate = dateMatch ? dateMatch[1] : '';
                cy.log('NN & TD - Extracted date: ' + extractedDate);
                
                // Tính ngày mong đợi
                const today = new Date();
                const options = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' };
                const vietnamDateStr = today.toLocaleDateString('en-CA', options);
                const vietnamTime = new Date(vietnamDateStr);
                
                let yesterday = new Date(vietnamTime);
                yesterday.setDate(vietnamTime.getDate() - 1);
                
                if (yesterday.getDay() === 0) {
                    yesterday.setDate(yesterday.getDate() - 2);
                }
                else if (yesterday.getDay() === 6) {
                    yesterday.setDate(yesterday.getDate() - 1);
                }
                
                const expectedDate = String(yesterday.getDate()).padStart(2, '0') + '-' + 
                                    String(yesterday.getMonth() + 1).padStart(2, '0');
                
                cy.log('NN & TD - Expected date: ' + expectedDate);
                expect(extractedDate.trim()).to.equal(expectedDate);
            });
        });
        
        // === TEST UPCOM ===
        cy.log('=== Testing UPCOM ===');
        
        cy.get('span.name').contains('UPCOM').click();
        cy.wait(2000);
        
        cy.get('canvas[data-zr-dom-id="zr_0"]').eq(1).trigger('mouseover', { clientX: 320, clientY: 50 });
        cy.get('canvas[data-zr-dom-id="zr_0"]').eq(1).trigger('mousemove', 320, 50);
        cy.wait(1000);
        
        cy.get('body').then(() => {
            cy.get('div').contains('Thời gian:').invoke('text').then((tooltipText) => {
                cy.log('UPCOM - Full tooltip text: ' + tooltipText);
                const dateMatch = tooltipText.match(/Thời gian:\s*(\d{2}-\d{2})/);
                const extractedDate = dateMatch ? dateMatch[1] : '';
                cy.log('UPCOM - Extracted date: ' + extractedDate);
                
                // Tính ngày mong đợi
                const today = new Date();
                const options = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' };
                const vietnamDateStr = today.toLocaleDateString('en-CA', options);
                const vietnamTime = new Date(vietnamDateStr);
                
                let yesterday = new Date(vietnamTime);
                yesterday.setDate(vietnamTime.getDate() - 1);
                
                if (yesterday.getDay() === 0) {
                    yesterday.setDate(yesterday.getDate() - 2);
                }
                else if (yesterday.getDay() === 6) {
                    yesterday.setDate(yesterday.getDate() - 1);
                }
                
                const expectedDate = String(yesterday.getDate()).padStart(2, '0') + '-' + 
                                    String(yesterday.getMonth() + 1).padStart(2, '0');
                
                cy.log('UPCOM - Expected date: ' + expectedDate);
                expect(extractedDate.trim()).to.equal(expectedDate);
            });
        });
        
        // === TEST HNXINDEX ===
        cy.log('=== Testing HNXINDEX ===');
        
        cy.get('span.name').contains('HNXINDEX').click();
        cy.wait(2000);
        
        cy.get('canvas[data-zr-dom-id="zr_0"]').eq(1).trigger('mouseover', { clientX: 320, clientY: 50 });
        cy.get('canvas[data-zr-dom-id="zr_0"]').eq(1).trigger('mousemove', 320, 50);
        cy.wait(1000);
        
        cy.get('body').then(() => {
            cy.get('div').contains('Thời gian:').invoke('text').then((tooltipText) => {
                cy.log('HNXINDEX - Full tooltip text: ' + tooltipText);
                const dateMatch = tooltipText.match(/Thời gian:\s*(\d{2}-\d{2})/);
                const extractedDate = dateMatch ? dateMatch[1] : '';
                cy.log('HNXINDEX - Extracted date: ' + extractedDate);
                
                // Tính ngày mong đợi
                const today = new Date();
                const options = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' };
                const vietnamDateStr = today.toLocaleDateString('en-CA', options);
                const vietnamTime = new Date(vietnamDateStr);
                
                let yesterday = new Date(vietnamTime);
                yesterday.setDate(vietnamTime.getDate() - 1);
                
                if (yesterday.getDay() === 0) {
                    yesterday.setDate(yesterday.getDate() - 2);
                }
                else if (yesterday.getDay() === 6) {
                    yesterday.setDate(yesterday.getDate() - 1);
                }
                
                const expectedDate = String(yesterday.getDate()).padStart(2, '0') + '-' + 
                                    String(yesterday.getMonth() + 1).padStart(2, '0');
                
                cy.log('HNXINDEX - Expected date: ' + expectedDate);
                expect(extractedDate.trim()).to.equal(expectedDate);
            });
        });
    });
})
