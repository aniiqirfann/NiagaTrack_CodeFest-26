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