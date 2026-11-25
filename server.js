require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const notesRoutes = require('./src/routes/notes');
const adminRoutes = require('./src/routes/admin');
const chatRoutes = require('./src/routes/chat');
const registerChatHandlers = require('./src/socket/chat');
require('./src/events/listeners'); // registers EventEmitter listeners

if (!process.env.JWT_SECRET) {
  console.error('[server] JWT_SECRET is missing in .env');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('[server] error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const server = http.createServer(app);
const io = new Server(server);
registerChatHandlers(io);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
});
