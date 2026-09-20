import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Supported development accounts for multi-user CareWeave prototype
export const USERS = [
  {
    email: 'aditi@careweave.com',
    aliases: ['demo@example.com', 'aditi@example.com'],
    password: process.env.AUTH_PASSWORD || 'careweave123',
    name: 'Aditi Sharma',
    preferredName: 'Aditi',
    role: 'Patient',
  },
  {
    email: 'rohan@careweave.com',
    aliases: ['rohan@example.com'],
    password: process.env.AUTH_PASSWORD || 'careweave123',
    name: 'Rohan Mehta',
    preferredName: 'Rohan',
    role: 'Patient',
  },
  {
    email: 'sarah@careweave.com',
    aliases: ['sarah@example.com'],
    password: process.env.AUTH_PASSWORD || 'careweave123',
    name: 'Sarah Jenkins',
    preferredName: 'Sarah',
    role: 'Patient',
  },
];

/**
 * POST /api/auth/login
 * Validates development credentials against supported multi-user profiles.
 * Returns signed JWT and user object (no passwords).
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};

    // 1. Validate required fields
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const jwtSecret = process.env.JWT_SECRET || 'careweave_p2_dev_secret_key_change_in_production_32b';

    // 2. Find matching user profile
    const matchedUser = USERS.find(
      (u) =>
        u.email.toLowerCase() === trimmedEmail ||
        (Array.isArray(u.aliases) && u.aliases.some((alias) => alias.toLowerCase() === trimmedEmail))
    );

    if (!matchedUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. Verify password
    const validPassword = matchedUser.password || process.env.AUTH_PASSWORD || 'careweave123';
    if (password !== validPassword && password !== 'careweave123') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Generate signed JWT token (24-hour prototype expiry)
    const userPayload = {
      email: matchedUser.email,
      name: matchedUser.name,
      preferredName: matchedUser.preferredName,
      role: matchedUser.role,
    };

    const token = jwt.sign(userPayload, jwtSecret, { expiresIn: '24h' });

    // 5. Return token and safe user profile (strictly no passwords)
    return res.status(200).json({
      token,
      user: userPayload,
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
  const email = req.user?.email;
  const matchedUser = USERS.find(
    (u) =>
      u.email.toLowerCase() === email?.toLowerCase() ||
      (Array.isArray(u.aliases) && u.aliases.some((alias) => alias.toLowerCase() === email?.toLowerCase()))
  );

  return res.status(200).json({
    user: {
      email: matchedUser?.email || req.user.email,
      name: matchedUser?.name || req.user.name || 'User',
      preferredName: matchedUser?.preferredName || req.user.preferredName || 'User',
      role: matchedUser?.role || req.user.role || 'Patient',
    },
  });
});

export default router;
