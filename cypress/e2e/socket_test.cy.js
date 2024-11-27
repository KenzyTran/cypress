// Import socket.io-client
import { io } from 'socket.io-client';

describe('Kiểm tra kết nối Socket.IO', () => {
  let socket;
  let apiToken;

  // Đăng nhập và lấy api_token
  before(() => {
    // Truy cập trang đăng nhập
    cy.visit('https://kfsp.vn/login');

    // Nhập thông tin đăng nhập
    cy.get('input[placeholder="Username"]').type('teamapp@happy.live'); // Thay 'your_username' bằng tên đăng nhập của bạn
    cy.get('input[placeholder="Password"]').type('1368$$kfsp$$1368'); // Thay 'your_password' bằng mật khẩu của bạn
    cy.get('button[type="submit"]').click(); // Thay selector của nút đăng nhập nếu cần

    // Xác nhận đăng nhập thành công
    cy.url().should('include', '/dashboard');

    // Lấy api_token từ Local Storage
    cy.window().then((window) => {
      apiToken = window.localStorage.getItem('api_token');
      if (!apiToken) {
        throw new Error('Không tìm thấy api_token trong Local Storage.');
      }
    });
  });

  // Kiểm tra kết nối Socket.IO
  it('Kiểm tra kết nối với Socket.IO', { timeout: 10000 }, (done) => {
    // Khởi tạo kết nối Socket.IO với apiToken
    socket = io('https://ta.kfsp.vn', {
      transports: ['websocket'],
      auth: {
        token: apiToken,
      },
    });

    let doneCalled = false; // Biến để theo dõi xem done() đã được gọi hay chưa

    // Lắng nghe sự kiện 'connect'
    socket.on('connect', () => {
      console.log('Đã kết nối thành công đến Socket.IO server trên ta.kfsp.vn');
      doneCalled = true;
      done();
    });

    // Lắng nghe sự kiện lỗi
    socket.on('connect_error', (err) => {
      console.error('Lỗi kết nối:', err);
      if (!doneCalled) {
        doneCalled = true;
        done(err);
      }
    });

    socket.on('connect_timeout', () => {
      console.error('Kết nối bị timeout');
      if (!doneCalled) {
        doneCalled = true;
        done(new Error('Kết nối bị timeout'));
      }
    });

    socket.on('error', (err) => {
      console.error('Socket Error:', err);
      if (!doneCalled) {
        doneCalled = true;
        done(err);
      }
    });

    socket.on('disconnect', (reason) => {
      console.error('Socket bị ngắt kết nối:', reason);
      if (!doneCalled) {
        doneCalled = true;
        done(new Error(`Socket bị ngắt kết nối: ${reason}`));
      }
    });

    // Thêm timeout để đảm bảo done() được gọi
    setTimeout(() => {
      if (!doneCalled) {
        doneCalled = true;
        done(new Error('Kiểm thử bị timeout mà không nhận được sự kiện kết nối hoặc lỗi.'));
      }
    }, 9000); // Thiết lập thời gian ít hơn một chút so với timeout của kiểm thử
  });

  // Ngắt kết nối sau khi hoàn thành
  after(() => {
    if (socket) {
      socket.disconnect();
    }
  });
});
