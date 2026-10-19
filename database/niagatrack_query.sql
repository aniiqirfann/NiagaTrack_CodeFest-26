DROP TABLE IF EXISTS belanja CASCADE;
DROP TABLE IF EXISTS jualan CASCADE;
DROP TABLE IF EXISTS kategori CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE, 
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kategori (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id)
        ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    category_type VARCHAR(20) NOT NULL
        CHECK (category_type IN ('sales', 'expense')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, category_name, category_type),
    UNIQUE (category_id, user_id)
);

CREATE TABLE jualan (
    sale_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id)
        ON DELETE CASCADE,
    category_id INTEGER,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL
        CHECK (unit_price >= 0),

    total_sales NUMERIC(12,2)
        GENERATED ALWAYS AS (quantity * unit_price) STORED,

    payment_method VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    FOREIGN KEY (category_id, user_id)
        REFERENCES kategori(category_id, user_id)
        ON DELETE SET NULL (category_id)
);

CREATE TABLE belanja (
    expense_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id)
        ON DELETE CASCADE,
    category_id INTEGER,
    expense_amount NUMERIC(12,2) NOT NULL
        CHECK (expense_amount >= 0),

    payment_method VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    receipt_note TEXT,
    receipt_image_path VARCHAR(255),

    FOREIGN KEY (category_id, user_id)
        REFERENCES kategori(category_id, user_id)
        ON DELETE SET NULL (category_id)
);

CREATE INDEX idx_categories_user
    ON kategori(user_id);

CREATE INDEX idx_sales_user_date
    ON jualan(user_id, transaction_date);

CREATE INDEX idx_expenses_user_date
    ON belanja(user_id, transaction_date);

INSERT INTO users (name, phone_number, password_hash)
VALUES (
    'Kak Siti',
    '123456789', 
    'DEMO_HASH_REPLACE_WITH_REAL_HASH'
);

INSERT INTO kategori (user_id, category_name, category_type)
VALUES
    (1, 'Nasi Lemak', 'sales'),
    (1, 'Drinks', 'sales'),
    (1, 'Kuih', 'sales'),
    (1, 'Raw Materials', 'expense'),
    (1, 'Stall Rental', 'expense'),
    (1, 'Packaging', 'expense');

INSERT INTO jualan
    (user_id, category_id, quantity, unit_price,
     payment_method, transaction_date, notes)
SELECT
    1, c.category_id, v.quantity, v.unit_price,
    v.payment_method, v.transaction_date::timestamp, v.notes
FROM (VALUES
    ('Nasi Lemak', 60, 4.00, 'Cash',
     '2026-10-04 09:15:00', 'Morning sales'),
    ('Drinks', 30, 4.00, 'DuitNow QR',
     '2026-10-04 12:10:00', 'Drinks sold'),
    ('Kuih', 40, 3.00, 'Cash',
     '2026-10-04 10:40:00', 'Assorted kuih')
) AS v(category_name, quantity, unit_price,
       payment_method, transaction_date, notes)
JOIN kategori c
    ON c.category_name = v.category_name
   AND c.category_type = 'sales'
   AND c.user_id = 1;

INSERT INTO belanja
    (user_id, category_id, expense_amount,
     payment_method, transaction_date, receipt_note)
SELECT
    1, c.category_id, v.expense_amount,
     v.payment_method, v.transaction_date::timestamp,
     v.receipt_note
FROM (VALUES
    ('Raw Materials', 45.00, 'Cash',
     '2026-10-04 07:00:00', 'Eggs and coconut milk'),
    ('Stall Rental', 25.00, 'Cash',
     '2026-10-04 07:30:00', 'Daily stall rental'),
    ('Packaging', 40.00, 'DuitNow QR',
     '2026-10-04 08:10:00', 'Plastic and wrapping paper')
) AS v(category_name, expense_amount,
       payment_method, transaction_date, receipt_note)
JOIN kategori c
    ON c.category_name = v.category_name
   AND c.category_type = 'expense'
   AND c.user_id = 1;

SELECT COALESCE(SUM(total_sales), 0) AS total_sales
FROM jualan
WHERE user_id = 1
  AND transaction_date >= TIMESTAMP '2026-10-04 00:00:00'
  AND transaction_date <  TIMESTAMP '2026-10-05 00:00:00';

SELECT COALESCE(SUM(expense_amount), 0) AS total_expenses
FROM belanja
WHERE user_id = 1
  AND transaction_date >= TIMESTAMP '2026-10-04 00:00:00'
  AND transaction_date <  TIMESTAMP '2026-10-05 00:00:00';

WITH daily_sales AS (
    SELECT COALESCE(SUM(total_sales), 0) AS amount
    FROM jualan
    WHERE user_id = 1
      AND transaction_date >= TIMESTAMP '2026-10-04 00:00:00'
      AND transaction_date <  TIMESTAMP '2026-10-05 00:00:00'
),
daily_expenses AS (
    SELECT COALESCE(SUM(expense_amount), 0) AS amount
    FROM belanja
    WHERE user_id = 1
      AND transaction_date >= TIMESTAMP '2026-10-04 00:00:00'
      AND transaction_date <  TIMESTAMP '2026-10-05 00:00:00'
)
SELECT
    daily_sales.amount AS total_sales,
    daily_expenses.amount AS total_expenses,
    daily_sales.amount - daily_expenses.amount AS net_profit
FROM daily_sales
CROSS JOIN daily_expenses;

SELECT
    'sales' AS transaction_type,
    j.sale_id AS transaction_id,
    j.user_id,
    j.transaction_date,
    k.category_name,
    j.payment_method,
    j.total_sales AS amount,
    j.notes AS description
FROM jualan j
LEFT JOIN kategori k
    ON j.category_id = k.category_id
WHERE j.user_id = 1

UNION ALL

SELECT
    'expense' AS transaction_type,
    b.expense_id AS transaction_id,
    b.user_id,
    b.transaction_date,
    k.category_name,
    b.payment_method,
    -b.expense_amount AS amount,
    b.receipt_note AS description
FROM belanja b
LEFT JOIN kategori k
    ON b.category_id = k.category_id
WHERE b.user_id = 1

ORDER BY transaction_date DESC;
