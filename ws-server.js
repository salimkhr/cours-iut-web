const {createServer} = require('http');
const {Server} = require('socket.io');

const port = parseInt(process.env.WS_PORT || '3001', 10);
const isDev = process.env.NODE_ENV !== 'production';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: isDev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('✅ Client connecté:', socket.id);

    socket.on('message', (data) => {
        console.log('📨 Message:', data);
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ Client déconnecté:', socket.id);
    });
});

httpServer.listen(port, () => {
    console.log(`🔌 WebSocket serveur sur port ${port}`);
});