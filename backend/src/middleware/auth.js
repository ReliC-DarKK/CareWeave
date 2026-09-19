import jwt from 'jsonwebtoken';

/**
 * Authentication middleware for Project 2.0.
 * Validates JWT in Authorization: Bearer <token> header.
 * Attaches verified user payload to req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization format. Expected: Bearer <token>' });
  }

  const token = parts[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is not configured.');
    return res.status(500).json({ error: 'Server authentication configuration error.' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Authentication token has expired. Please log in again.' });
      }
      return res.status(403).json({ error: 'Invalid or malformed authentication token.' });
    }

    req.user = user;
    next();
  });
}
