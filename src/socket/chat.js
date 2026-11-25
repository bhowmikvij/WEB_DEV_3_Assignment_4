const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const appEvents = require('../events/appEvents');
const { extractToken } = require('../middleware/auth');

module.exports = function registerChatHandlers(io) {
  // Only authenticated users can open a socket
  io.use((socket, next) => {
    const token = (socket.handshake.auth && socket.handshake.auth.token) || extractToken(socket.handshake.headers);
    if (!token) return next(new Error('No token provided'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    appEvents.emit('chat:connected', socket.id);

    socket.on('joinRoom', async (room = 'general') => {
      socket.join(room);
      appEvents.emit('chat:joined', { socketId: socket.id, room });

      const history = await Message.find({ room }).sort({ createdAt: -1 }).limit(20);
      socket.emit('history', history.reverse());
      socket.to(room).emit('systemMessage', `${socket.user.username} joined ${room}`);
    });

    socket.on('chatMessage', async ({ room = 'general', text } = {}) => {
      if (!text || !text.trim()) return;
      if (!socket.rooms.has(room)) return socket.emit('errorMessage', 'Join the room first');

      const msg = await Message.create({
        room,
        username: socket.user.username,
        text: text.trim(),
        sender: socket.user.id,
      });

      io.to(room).emit('chatMessage', {
        room,
        username: msg.username,
        text: msg.text,
        createdAt: msg.createdAt,
      });
      appEvents.emit('chat:message', { room, username: msg.username, text: msg.text });
    });

    socket.on('disconnect', () => appEvents.emit('chat:disconnected', socket.id));
  });
};
