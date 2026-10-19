const jwt = require('jsonwebtoken');
const { HttpError } = require('./util');

const signToken = (userId) => jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) throw new HttpError(401, 'UNAUTHORIZED');
  try {
    req.userId = Number(jwt.verify(token, process.env.JWT_SECRET).sub);
  } catch {
    throw new HttpError(401, 'UNAUTHORIZED');
  }
  next();
}

module.exports = { signToken, requireAuth };
