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

let presenter = null;
let currentSlide = 0;
let currentStep = 0;
const viewers = new Set();

io.on('connection', (socket) => {
    console.log('✅ Client connecté:', socket.id);

    socket.on('join-presenter', () => {
        if (presenter) {
            io.to(presenter).emit('presenter-replaced');
        }
        presenter = socket.id;
        console.log('👨‍🏫 Nouveau présentateur');

        // Informer du nombre de viewers
        socket.emit('viewers-count', viewers.size);
    });

    socket.on('join-viewer', () => {
        viewers.add(socket.id);
        console.log(`👥 Nouveau viewer (${viewers.size} total)`);

        // Envoyer l'état actuel
        socket.emit('slide-update', {currentSlide, currentStep});

        // Informer le présentateur
        if (presenter) {
            io.to(presenter).emit('viewers-count', viewers.size);
        }
    });

    socket.on('slide-change', ({slide, step}) => {
        if (socket.id !== presenter) return;

        currentSlide = slide;
        currentStep = step;

        console.log(`📊 Slide ${slide}, step ${step}`);

        // Diffuser aux viewers
        viewers.forEach(viewerId => {
            io.to(viewerId).emit('slide-update', {currentSlide, currentStep});
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ Client déconnecté:', socket.id);

        if (socket.id === presenter) {
            presenter = null;
            console.log('Présentateur déconnecté');
        } else if (viewers.has(socket.id)) {
            viewers.delete(socket.id);
            if (presenter) {
                io.to(presenter).emit('viewers-count', viewers.size);
            }
        }
    });
});

httpServer.listen(port, () => {
    console.log(`🔌 WebSocket serveur sur port ${port}`);
});