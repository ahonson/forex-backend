--
-- Drop and create all tables in the correct order
--
DROP TABLE IF EXISTS transactions;
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

INSERT INTO users (email, password) VALUES ("joe@joe.joe", "$2a$10$vYiGTxMrFYDve3v5.bnAj.La2rkUa4cSZWXCj/ZwuDmkwgw6wCszC");
-- bcrypt hash for pass123

BEGIN TRANSACTION;
UPDATE users SET sek = 990.00, eur = 1.00 WHERE id = 1;
INSERT INTO transactions (sold_currency, sold_amount, purch_currency, purch_amount, user_id) VALUES ("SEK", 10.00, "EUR", 1.00, 1);
END TRANSACTION;
