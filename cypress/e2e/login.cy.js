/// <reference types="cypress" />

describe ('test login',() => {
    const validUsername = 'hoanghaiyenhl2000@gmail.com';
    const validPassword = '123456';
  
    beforeEach(() => {
      cy.visit ('https://kfsp.vn/login');
    });
  
    it ('User đăng nhập thành công với username và password hợp lệ',() => {
      cy.get('[type="email"]').type(validUsername);
      cy.get('[type="password"]').type(validPassword);
      cy.get('#btn-login').click();
      cy.url().should('include',"/dashboard");
    });
  
    it ('User đăng nhập không thành công với username không hợp lệ ',() => {
      cy.get('[type="email"]').type('hahaha@gmail.com');
      cy.get('[type="password"]').type(validPassword);
      cy.get('#btn-login').click();
      cy.wait(2000);
      cy.get('.alert').should('contain', ' Tài khoản hoặc mật khẩu không đúng. Mời quý khách kiểm tra lại. Cảm ơn. ');
    });
  
    it ('User đăng nhập không thành công với username không hợp lệ ',() => {
      cy.get('[type="email"]').type(validUsername);
      cy.get('[type="password"]').type('1111111');
      cy.get('#btn-login').click();
      cy.wait(2000);
      cy.get('.alert').should('contain', ' Tài khoản hoặc mật khẩu không đúng. Mời quý khách kiểm tra lại. Cảm ơn. ');
    });
  
    it ('User đăng nhập không thành công với username và password để trống ',() => {
      cy.get('[type="email"]').should('be.empty');
      cy.get('[type="password"]').should('be.empty');
      cy.get('#btn-login').click();
      cy.wait(4000);
      cy.get('.alert').should('contain', ' Tài khoản hoặc mật khẩu không đúng. Mời quý khách kiểm tra lại. Cảm ơn. ');
    });
    
    // Kiểm thử với tấn công XSS
    it('User đăng nhập không thành công với mã độc XSS trong username', () => {
      cy.get('[type="email"]').type('<script>alert("XSS")</script>@gmail.com');
      cy.get('[type="password"]').type(validPassword);
      cy.get('#btn-login').click();
      cy.get('.alert').should('contain', "A part followed by '@' should not contain the symbol '<'");
    });
  
    it('User đăng nhập không thành công với mã độc XSS trong password', () => {
      cy.get('[type="email"]'). type(validUsername);
      cy.get('[type="password"]').type('<script>alert("XSS")</script>');
      cy.get('#btn-login').click();
      cy.get('.alert').should('contain', ' Tài khoản hoặc mật khẩu không đúng. Mời quý khách kiểm tra lại. Cảm ơn. ');
    });
  });
  