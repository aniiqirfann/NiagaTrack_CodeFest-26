// Creates demo user "Kak Siti" with data for today + the previous 6 days
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { createDefaultCategories } = require('./defaults');
const { todayKL } = require('./util');

const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM users WHERE phone_number = '123456789'`);
    const hash = await bcrypt.hash('password123', 10);
    const { rows: [u] } = await client.query(
      `INSERT INTO users (name, phone_number, password_hash, shop_name, shop_location, terms_accepted_at)
       VALUES ('Kak Siti', '123456789', $1, 'Gerai Kak Siti', 'Shah Alam', now()) RETURNING user_id`, [hash]);
    await createDefaultCategories(client, u.user_id);
    const { rows: cats } = await client.query('SELECT category_id, system_key FROM kategori WHERE user_id = $1', [u.user_id]);
    const id = (k) => cats.find((c) => c.system_key === k).category_id;

    const sale = (day, time, key, qty, price, pay, note) => client.query(
      `INSERT INTO jualan (user_id, category_id, quantity, unit_price, payment_method, transaction_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`, [u.user_id, id(key), qty, price, pay, `${day}T${time}+08:00`, note]);
    const exp = (day, time, key, amt, pay, note) => client.query(
      `INSERT INTO belanja (user_id, category_id, expense_amount, payment_method, transaction_date, receipt_note)
       VALUES ($1,$2,$3,$4,$5,$6)`, [u.user_id, id(key), amt, pay, `${day}T${time}+08:00`, note]);

    const today = todayKL(); 
    await sale(today, '09:15:00', 'nasi_lemak', 60, 4, 'cash', 'Morning sales');
    await sale(today, '10:40:00', 'kuih', 40, 3, 'cash', 'Assorted kuih');
    await sale(today, '12:10:00', 'drinks', 30, 4, 'duitnow_qr', 'Drinks sold');
    await exp(today, '07:00:00', 'raw_materials', 100, 'cash', 'Eggs and coconut milk');
    await exp(today, '07:30:00', 'stall_rental', 25, 'cash', 'Daily stall rental');
    await exp(today, '08:10:00', 'packaging', 40, 'duitnow_qr', 'Plastic and wrapping paper');

    const profits = [280, 295, 230, 260, 185, 210]; 
    for (let i = 0; i < 6; i++) {
      const day = addDays(today, -(i + 1));
      await sale(day, '10:00:00', 'nasi_lemak', (profits[i] + 100) / 5, 5, 'cash', 'Demo sales');
      await exp(day, '07:00:00', 'raw_materials', 100, 'cash', 'Demo expense');
    }
    await client.query('COMMIT');
    console.log('Demo data created. Log in with phone 123456789 and password password123');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
