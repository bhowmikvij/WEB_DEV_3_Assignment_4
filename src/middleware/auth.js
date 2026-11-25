const jwt = require('jsonwebtoken');

// Token can come from "Authorization: Bearer <token>" or from the "token" cookie.
function extractToken(headers) {
  const auth = headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);

  if (headers.cookie) {
    for (const part of headers.cookie.split(';')) {
      const [key, ...rest] = part.trim().split('=');
      if (key === 'token') return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

function verifyToken(req, res, next) {
  const token = extractToken(req.headers);
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Role-based access control: authorizeRoles('admin')
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

module.exports = { extractToken, verifyToken, authorizeRoles };
