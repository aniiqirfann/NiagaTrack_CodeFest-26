const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db');
const { requireAuth } = require('../auth');
const { HttpError, parse, dayFilter, getDate } = require('../util');

router.use(requireAuth); 

const PAY = z.enum(['cash', 'duitnow_qr']);
const DATE = z.string().datetime().optional(); 

router.get('/categories', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT category_id AS id, category_name AS name, category_type AS type, system_key AS "systemKey",
            default_price AS "defaultPrice"
     FROM kategori
     WHERE user_id = $1 AND is_active AND ($2::text IS NULL OR category_type = $2)
     ORDER BY category_id`,
    [req.userId, req.query.type || null]
  );
  res.json(rows);
});

router.post('/categories', async (req, res) => {
  const b = parse(z.object({
    name: z.string().trim().min(1).max(100),
    type: z.enum(['sales', 'expense']),
    defaultPrice: z.number().min(0).optional(),
  }), req.body);
  try {
    const { rows } = await pool.query(
      `INSERT INTO kategori (user_id, category_name, category_type, default_price)
       VALUES ($1, $2, $3, $4) RETURNING category_id AS id`,
      [req.userId, b.name, b.type, b.defaultPrice ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') throw new HttpError(409, 'CATEGORY_EXISTS');
    throw e;
  }
});


router.post('/sales', async (req, res) => {
  const b = parse(z.object({
    categoryId: z.number().int(),
    quantity: z.number().int().min(1).max(100000),
    unitPrice: z.number().min(0).max(1000000),
    paymentMethod: PAY,
    transactionDate: DATE,
    notes: z.string().max(500).optional(),
  }), req.body);

  const { rows } = await pool.query(
    `INSERT INTO jualan (user_id, category_id, quantity, unit_price, payment_method, transaction_date, notes)
     SELECT $1::int, $2::int, $3::int, $4::numeric, $5::text, COALESCE($6::timestamptz, now()), $7::text
     WHERE EXISTS (SELECT 1 FROM kategori WHERE category_id = $2 AND user_id = $1
                   AND category_type = 'sales' AND is_active)
     RETURNING sale_id AS id, total_sales AS total`,
    [req.userId, b.categoryId, b.quantity, b.unitPrice, b.paymentMethod, b.transactionDate ?? null, b.notes ?? null]
  );
  if (!rows[0]) throw new HttpError(400, 'INVALID_INPUT', 'categoryId: not found');
  res.status(201).json(rows[0]);
});

router.delete('/sales/:id', async (req, res) => {
  const r = await pool.query(
    `UPDATE jualan SET deleted_at = now(), updated_at = now()
     WHERE sale_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [Number(req.params.id) || 0, req.userId]
  );
  if (!r.rowCount) throw new HttpError(404, 'NOT_FOUND');
  res.status(204).end(); // soft delete: the row stays in the database
});


router.post('/expenses', async (req, res) => {
  const b = parse(z.object({
    categoryId: z.number().int(),
    amount: z.number().min(0.01).max(10000000),
    paymentMethod: PAY,
    transactionDate: DATE,
    note: z.string().max(500).optional(),
  }), req.body);
  const { rows } = await pool.query(
    `INSERT INTO belanja (user_id, category_id, expense_amount, payment_method, transaction_date, receipt_note)
     SELECT $1::int, $2::int, $3::numeric, $4::text, COALESCE($5::timestamptz, now()), $6::text
     WHERE EXISTS (SELECT 1 FROM kategori WHERE category_id = $2 AND user_id = $1
                   AND category_type = 'expense' AND is_active)
     RETURNING expense_id AS id`,
    [req.userId, b.categoryId, b.amount, b.paymentMethod, b.transactionDate ?? null, b.note ?? null]
  );
  if (!rows[0]) throw new HttpError(400, 'INVALID_INPUT', 'categoryId: not found');
  res.status(201).json(rows[0]);
});

router.delete('/expenses/:id', async (req, res) => {
  const r = await pool.query(
    `UPDATE belanja SET deleted_at = now(), updated_at = now()
     WHERE expense_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
    [Number(req.params.id) || 0, req.userId]
  );
  if (!r.rowCount) throw new HttpError(404, 'NOT_FOUND');
  res.status(204).end();
});


router.get('/records', async (req, res) => {
  const date = getDate(req.query);
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT 'sales' AS type, j.sale_id AS id, j.transaction_date AS "date", k.category_name AS "categoryName",
              k.system_key AS "systemKey", j.payment_method AS "paymentMethod", j.total_sales AS amount, j.notes AS note
       FROM jualan j LEFT JOIN kategori k ON k.category_id = j.category_id AND k.user_id = j.user_id
       WHERE j.user_id = $1 AND j.deleted_at IS NULL AND ${dayFilter('j.transaction_date', 2)}
       UNION ALL
       SELECT 'expense', b.expense_id, b.transaction_date, k.category_name,
              k.system_key, b.payment_method, b.expense_amount, b.receipt_note
       FROM belanja b LEFT JOIN kategori k ON k.category_id = b.category_id AND k.user_id = b.user_id
       WHERE b.user_id = $1 AND b.deleted_at IS NULL AND ${dayFilter('b.transaction_date', 2)}
     ) r ORDER BY "date" DESC`,
    [req.userId, date]
  );
  res.json(rows);
});

module.exports = router;
