const appEvents = require('./appEvents');

appEvents.on('user:registered', (user) => {
  console.log(`[event] user:registered -> ${user.username} (${user.email})`);
});

appEvents.on('user:login', (user) => {
  console.log(`[event] user:login -> ${user.username}`);
});

appEvents.on('note:created', (note) => {
  console.log(`[event] note:created -> "${note.title}" by ${note.owner}`);
});

appEvents.on('note:deleted', (note) => {
  console.log(`[event] note:deleted -> "${note.title}"`);
});

appEvents.on('chat:connected', (socketId) => {
  console.log(`User connected: ${socketId}`);
});

appEvents.on('chat:joined', ({ socketId, room }) => {
  console.log(`${socketId} joined room ${room}`);
});

appEvents.on('chat:message', ({ room, username, text }) => {
  console.log(`[${room}] ${username}: ${text}`);
});

appEvents.on('chat:disconnected', (socketId) => {
  console.log(`User disconnected: ${socketId}`);
});
