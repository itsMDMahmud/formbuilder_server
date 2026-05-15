import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create(data);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await (user as any).comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  // 'idToken' here is the JWT credential returned by Google's Sign-In button
  // It is NOT an access_token. The frontend sends credentialResponse.credential
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'id_token is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token: no email found' });
    }

    // Find existing user or create a new one (handles both login & signup)
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // New user — auto-register via Google
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        password: Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16),
        googleId: payload.sub,
        avatar: payload.picture,
      });
    } else if (!user.googleId) {
      // Existing email/password user — link their Google account
      await User.findByIdAndUpdate(user._id, {
        googleId: payload.sub,
        avatar: payload.picture,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (e: any) {
    console.error('Google auth error:', e.message);
    res.status(400).json({ message: 'Google authentication failed. Please try again.' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar,
        googleId: user.googleId
      }
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  const { name, avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, avatar } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar
      }
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
