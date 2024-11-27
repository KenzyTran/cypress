// test_socket.js
const io = require('socket.io-client');

const apiToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5rZnNwLnZuL2FwaS9sb2dpbiIsImlhdCI6MTczMTA1MTM3OSwiZXhwIjoxNzMxMTM3Nzc5LCJuYmYiOjE3MzEwNTEzNzksImp0aSI6ImFmZURMd1JTUmpGeUNtSWsiLCJzdWIiOiI4MDg3IiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.pWB1Yv9I1i-jpGzHulWwULaP9ZikpUO9KUiadeS82Rk'; // Thay thế bằng api_token thực tế

const socket = io('https://ta.kfsp.vn', {
  transports: ['websocket'],
  auth: {
    token: apiToken,
  },
});

socket.on('connect', () => {
  console.log('Kết nối thành công');
  socket.disconnect();
});

socket.on('connect_error', (err) => {
  console.error('Lỗi kết nối:', err);
});
