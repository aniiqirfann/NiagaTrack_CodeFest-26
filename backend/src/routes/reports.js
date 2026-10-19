const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../auth');
const { dayFilter, getDate } = require('../util');

router.use(requireAuth);

// Sales, expenses and profit for one day
router.get('/reports/summary', async (req, res) => {
  const date = getDate(req.query);
  const { rows: [r] } = await pool.query(
    `SELECT
       (SELECT COALESCE(SUM(total_sales), 0) FROM jualan
         WHERE user_id = $1 AND deleted_at IS NULL AND ${dayFilter('transaction_date', 2)}) AS sales,
       (SELECT COALESCE(SUM(expense_amount), 0) FROM belanja
         WHERE user_id = $1 AND deleted_at IS NULL AND ${dayFilter('transaction_date', 2)}) AS expenses`,
    [req.userId, date]
  );
  res.json({ date, sales: r.sales, expenses: r.expenses, profit: Math.round((r.sales - r.expenses) * 100) / 100 });
});

// Profit per day for the 7 days ending on "date". Days without records show 0.
router.get('/reports/trend', async (req, res) => {
  const date = getDate(req.query);
  const { rows } = await pool.query(
    `WITH days AS (SELECT ($2::date - g) AS day FROM generate_series(0, 6) g),
     s AS (SELECT (transaction_date AT TIME ZONE 'Asia/Kuala_Lumpur')::date AS day, SUM(total_sales) AS total
           FROM jualan WHERE user_id = $1 AND deleted_at IS NULL
             AND transaction_date >= (($2::date - 6)::timestamp AT TIME ZONE 'Asia/Kuala_Lumpur')
             AND transaction_date <  (($2::date + 1)::timestamp AT TIME ZONE 'Asia/Kuala_Lumpur')
           GROUP BY 1),
     e AS (SELECT (transaction_date AT TIME ZONE 'Asia/Kuala_Lumpur')::date AS day, SUM(expense_amount) AS total
           FROM belanja WHERE user_id = $1 AND deleted_at IS NULL
             AND transaction_date >= (($2::date - 6)::timestamp AT TIME ZONE 'Asia/Kuala_Lumpur')
             AND transaction_date <  (($2::date + 1)::timestamp AT TIME ZONE 'Asia/Kuala_Lumpur')
           GROUP BY 1)
     SELECT to_char(days.day, 'YYYY-MM-DD') AS day, COALESCE(s.total, 0) - COALESCE(e.total, 0) AS profit
     FROM days LEFT JOIN s ON s.day = days.day LEFT JOIN e ON e.day = days.day
     ORDER BY days.day`,
    [req.userId, date]
  );
  res.json(rows);
});

module.exports = router;
