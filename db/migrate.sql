--
-- Drop and create all tables in the correct order
--
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(100) NOT NULL,
    created NUMERIC DEFAULT CURRENT_TIMESTAMP,
    sek FLOAT DEFAULT 1000.00,
    usd FLOAT DEFAULT 0.00,
    chf FLOAT DEFAULT 0.00,
    gbp FLOAT DEFAULT 0.00,
    eur FLOAT DEFAULT 0.00,
    UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_date NUMERIC DEFAULT CURRENT_TIMESTAMP,
    sold_amount FLOAT,
    sold_currency CHAR(3),
    purch_amount FLOAT,
    purch_currency CHAR(3),
    user_id INTEGER,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_date NUMERIC DEFAULT CURRENT_TIMESTAMP,
    amount FLOAT,
    user_id INTEGER,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (email, password) VALUES ("joe@joe.joe", "$2a$10$vYiGTxMrFYDve3v5.bnAj.La2rkUa4cSZWXCj/ZwuDmkwgw6wCszC");
-- bcrypt hash for pass123
INSERT INTO users (email, password) VALUES ("jane@jane.jane", "$2a$10$vYiGTxMrFYDve3v5.bnAj.La2rkUa4cSZWXCj/ZwuDmkwgw6wCszC");
-- bcrypt hash for pass123

BEGIN TRANSACTION;
UPDATE users SET sek = sek - 10.00, eur = eur + 1.00 WHERE id = 1;
INSERT INTO transactions (sold_currency, sold_amount, purch_currency, purch_amount, user_id) VALUES ("SEK", 10.00, "EUR", 1.00, 1);
END TRANSACTION;

BEGIN TRANSACTION;
UPDATE users SET sek = sek - 25.00, eur = eur + 2.50 WHERE id = 2;
INSERT INTO transactions (sold_currency, sold_amount, purch_currency, purch_amount, user_id) VALUES ("SEK", 25.00, "EUR", 2.50, 2);
END TRANSACTION;

BEGIN TRANSACTION;
UPDATE users SET sek = sek - 108.00, usd = usd + 12.00 WHERE id = 1;
INSERT INTO transactions (sold_currency, sold_amount, purch_currency, purch_amount, user_id) VALUES ("SEK", 108.00, "USD", 12.00, 1);
END TRANSACTION;

BEGIN TRANSACTION;
UPDATE users SET sek = sek + 400 WHERE id = 1;
INSERT INTO payments (amount, user_id) VALUES (400, 1);
END TRANSACTION;

BEGIN TRANSACTION;
UPDATE users SET sek = sek + 300 WHERE id = 2;
INSERT INTO payments (amount, user_id) VALUES (300, 2);
END TRANSACTION;

BEGIN TRANSACTION;
UPDATE users SET sek = sek + 200 WHERE id = 2;
INSERT INTO payments (amount, user_id) VALUES (200, 2);
END TRANSACTION;
