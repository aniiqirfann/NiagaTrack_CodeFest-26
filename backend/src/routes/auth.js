const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { signToken, requireAuth } = require('../auth');
const { createDefaultCategories } = require('../defaults');
const { HttpError, parse, normalizePhone } = require('../util');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }); // slows down password guessing

const toUser = (r) => ({
  id: r.user_id, name: r.name, phone: r.phone_number,
  shopName: r.shop_name, shopLocation: r.shop_location, language: r.language,
});

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().min(1),
  password: z.string().min(8).max(72),
  termsAccepted: z.literal(true),
  language: z.enum(['ms', 'en']).optional(),
});

router.post('/auth/register', authLimiter, async (req, res) => {
  const b = parse(registerSchema, req.body);
  const phone = normalizePhone(b.phone);
  if (!/^1\d{8,9}$/.test(phone)) throw new HttpError(400, 'INVALID_INPUT', 'phone: invalid Malaysian mobile number');
  const hash = await bcrypt.hash(b.password, 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // user + default categories are saved together or not at all
    const { rows } = await client.query(
      `INSERT INTO users (name, phone_number, password_hash, language, terms_accepted_at)
       VALUES ($1, $2, $3, $4, now()) RETURNING *`,
      [b.name, phone, hash, b.language || 'ms']
    );
    await createDefaultCategories(client, rows[0].user_id);
    await client.query('COMMIT');
    res.status(201).json({ token: signToken(rows[0].user_id), user: toUser(rows[0]) });
  } catch (e) {
    await client.query('ROLLBACK');
    if (e.code === '23505') throw new HttpError(409, 'PHONE_TAKEN');
    throw e;
  } finally {
    client.release();
  }
});

router.post('/auth/login', authLimiter, async (req, res) => {
  const b = parse(z.object({ phone: z.string().min(1), password: z.string().min(1) }), req.body);
  const { rows } = await pool.query('SELECT * FROM users WHERE phone_number = $1', [normalizePhone(b.phone)]);
  const ok = rows[0] && (await bcrypt.compare(b.password, rows[0].password_hash));
  if (!ok) throw new HttpError(401, 'INVALID_LOGIN'); // same message for wrong phone or wrong password
  res.json({ token: signToken(rows[0].user_id), user: toUser(rows[0]) });
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.userId]);
  if (!rows[0]) throw new HttpError(401, 'UNAUTHORIZED');
  res.json(toUser(rows[0]));
});

router.patch('/me', requireAuth, async (req, res) => {
  const b = parse(z.object({
    language: z.enum(['ms', 'en']).optional(),
    name: z.string().trim().min(1).max(100).optional(),
    shopName: z.string().trim().max(100).optional(),
    shopLocation: z.string().trim().max(100).optional(),
  }), req.body);
  const { rows } = await pool.query(
    `UPDATE users SET language = COALESCE($2, language), name = COALESCE($3, name),
       shop_name = COALESCE($4, shop_name), shop_location = COALESCE($5, shop_location)
     WHERE user_id = $1 RETURNING *`,
    [req.userId, b.language ?? null, b.name ?? null, b.shopName ?? null, b.shopLocation ?? null]
  );
  res.json(toUser(rows[0]));
});

module.exports = router;
