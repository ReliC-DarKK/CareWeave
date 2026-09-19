import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Validates development credentials against environment variables.
 * Returns signed JWT and minimal user object (no passwords).
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};

    // 1. Validate required fields
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const expectedEmail = (process.env.AUTH_EMAIL || '').trim().toLowerCase();
    const expectedPassword = process.env.AUTH_PASSWORD || '';
    const jwtSecret = process.env.JWT_SECRET;

    if (!expectedEmail || !expectedPassword || !jwtSecret) {
      console.error('Authentication configuration missing in environment variables.');
      return res.status(500).json({ error: 'Server authentication configuration error.' });
    }

    // 2. Validate credentials
    if (trimmedEmail !== expectedEmail || password !== expectedPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Generate signed JWT token (24-hour prototype expiry)
    const userPayload = {
      email: trimmedEmail,
    };

    const token = jwt.sign(userPayload, jwtSecret, { expiresIn: '24h' });

    // 4. Return token and safe user profile (strictly no passwords)
    return res.status(200).json({
      token,
      user: {
        email: trimmedEmail,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during authentication.' });
  }
});

/**
 * GET /api/auth/me
 * Protected endpoint returning current authenticated user profile.
 */
router.get('/me', authenticateToken, (req, res) => {
  return res.status(200).json({
    user: {
      email: req.user.email,
    },
  });
});

export default router;
