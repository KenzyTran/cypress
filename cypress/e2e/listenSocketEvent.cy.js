// Thêm task để lắng nghe sự kiện từ server
on('task', {
    async loginAndConnectSocket() {
      try {
        // Đăng nhập và lấy token từ API
        const response = await axios.post('https://api.kfsp.vn/api/login', {
          email: 'teamapp@happy.live',
          password: '1368$$kfsp$$1368',
          persist_login: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        const token = response.data.access_token;
  
        // Kết nối đến Socket.IO server với token
        socket = io('wss://ta.kfsp.vn', {
          path: '/ws/socket.io',
          autoConnect: true,
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: "Bearer " + token
              },
            },
          },
        });
        
        socket.connect();
  
        socket.on('connect', () => {
          console.log('Connected to WebSocket');
        });
  
        return { success: true, message: 'Connected to WebSocket' };
      } catch (error) {
        console.error('Login or connection failed:', error);
        return { success: false, error: error.message };
      }
    },
  
    // Task lắng nghe sự kiện từ server
    listenSocketEvent(event) {
      return new Promise((resolve) => {
        if (socket) {
          socket.on(event, (data) => {
            resolve({ success: true, data });
          });
        } else {
          resolve({ success: false, error: 'Socket not connected' });
        }
      });
    },
  
    emitSocketEvent(params) {
      return new Promise((resolve, reject) => {
        if (socket && !socket.connected) {
          socket.on('connect', () => {
            if (socket && socket.connected) {
              socket.emit(params.event, params.payload, (res) => {
                resolve({ success: true, data: res });
              });
            } else {
              reject({ success: false, error: 'Socket not connected' });
            }
          });
        } else if (socket && socket.connected) {
          socket.emit(params.event, params.payload, (res) => {
            resolve({ success: true, data: res });
          });
        } else {
          reject({ success: false, error: 'Socket instance not found' });
        }
      });
    },
  
    disconnectSocket() {
      if (socket) {
        socket.disconnect();
        console.log('Disconnected from Socket.IO server');
      }
      return null;
    }
  });
  