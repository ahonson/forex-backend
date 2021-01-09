var express = require('express');
var router = express.Router();

require("dotenv").config();
const db = require("../db/database.js");

router.get('/', function(req, res, next) {
    res.json({
        msg: "Backend-API works! You can try the following routes.",
        routes: {
            users: "/users/:email",
            transactions: "transactions/:id",
            payments: "payments/:id",
            total: "total"
        }
    });
});

router.get('/users/:email', function(req, res, next) {
    let sql = "SELECT * FROM users WHERE email = ?;";
    // let userEmail = "joe@joe.joe";
    let userEmail = req.params.email;

    db.serialize(function() {
        db.get(sql, [userEmail], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (row) {
                res.json({
                    id: row.id,
                    email: row.email,
                    created: row.created,
                    usd: row.usd,
                    chf: row.chf,
                    eur: row.eur,
                    gbp: row.gbp,
                    sek: row.sek
                });
                return row.email
                    ? console.log(row.email)
                    : console.log(`No email found with the name ${userEmail}`);
            } else {
                return res.json({
                    id: "",
                    email: ""
                });
            }
        });
    });
});

router.get('/transactions/:user_id', function(req, res, next) {
    let sql = "SELECT * FROM transactions WHERE user_id = ?;";
    let userid = req.params.user_id;

    db.serialize(function() {
        db.all(sql, [userid], (err, rows) => {
            if (err) {
                return console.error(err.message);
            }
            if (rows) {
                // var myjson = {};
                var myjson = [];

                rows.forEach((row) => {
                    console.log(row.name);
                    myjson.push({
                        transaction_date: row.transaction_date,
                        sold_currency: row.sold_currency,
                        sold_amount: row.sold_amount,
                        purch_currency: row.purch_currency,
                        purch_amount: row.purch_amount,
                        user_id: row.user_id,
                        row_id: row.id
                    });
                });
                res.json(myjson);
            } else {
                res.json({ report: "There is no such transaction in the database." });
            }
            return rows
                ? console.log(rows[0])
                : console.log(`No transaction found for user with the id ${userid}`);
        });
    });
});

router.get('/payments/:user_id', function(req, res, next) {
    let sql = "SELECT * FROM payments WHERE user_id = ?;";
    let userid = req.params.user_id;

    db.serialize(function() {
        db.all(sql, [userid], (err, rows) => {
            if (err) {
                return console.error(err.message);
            }
            if (rows) {
                // var myjson = {};
                var myjson = [];

                rows.forEach((row) => {
                    myjson.push({
                        amount: row.amount,
                        payment_date: row.payment_date,
                        user_id: row.user_id,
                        row_id: row.id
                    });
                });
                res.json(myjson);
            } else {
                res.json({ report: "There is no such payment in the database." });
            }
            return rows
                ? console.log(rows[0], "9999999999999999")
                : console.log(`No transaction found for user with the name ${userid}`);
        });
    });
});

router.get('/total', function(req, res, next) {
    let sql = "SELECT COUNT(*) AS 'allusers' FROM users;";
    let sql2 = "SELECT COUNT(*) AS 'alltransactions' FROM transactions;";
    let sql3 = "SELECT COUNT(*) AS 'allpayments' FROM payments;";
    let myjson = {};

    db.serialize(function() {
        db.get(sql, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            myjson['nrofusers'] = row.allusers;
        });
        db.get(sql2, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            myjson['nroftransactions'] = row.alltransactions;
        });
        db.get(sql3, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            myjson['nrofpayments'] = row.allpayments;
            res.json(myjson);
            return myjson.nrofusers
                ? console.log(myjson.nrofusers)
                : console.log(`Something went wrong.`);
        });
    });
});

router.post('/addtobalance', function(req, res, next) {
    const jwt = require('jsonwebtoken');
    const token = req.body.token;
    const amount = req.body.amount;
    const userid = req.body.user_id;
    var myMessage;

    jwt.verify(token, process.env.JWT_SECRET, function(err) {
        if (err) {
            // not a valid token
            myMessage = "Du är inte inloggad.";
        } else {
            // valid token
            if (token && amount && userid) {
                myMessage = "Du är inloggad. Inbetalningen har registrerats på ditt konto.";
                const sqlite3 = require('sqlite3').verbose();
                const db = new sqlite3.Database('./db/forex.sqlite');

                db.run("INSERT INTO payments (amount, user_id) VALUES (?, ?);",
                    [amount, userid], (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                db.run(`UPDATE users SET sek = sek + ? WHERE id = ?;`,
                    [amount, userid], (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
            } else {
                myMessage = "Ett eller flera värden saknas. Inbetalningen har inte registrerats.";
            }
        }
    });

    res.status(201).json({
        data: {
            msg: "Got a POST request",
            info: myMessage
        }
    });
});

router.post('/register', function(req, res, next) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    console.log(userPassword, userEmail);
    bcrypt.hash(userPassword, saltRounds, function(err, hash) {
        // spara lösenord i databasen.
        db.run("INSERT INTO users (email, password) VALUES (?, ?);",
            userEmail,
            hash, (err) => {
                if (err) {
                // returnera error
                    console.log("DET GICK INTE");
                    return console.error(err.message);
                } else {
                // returnera korrekt svar
                    console.log("DET GICK HYFSAT BRA");
                }
            });
    });

    res.status(201).json({
        data: {
            msg: "Got a POST request"
        }
    });
});

router.post('/login', function(req, res, next) {
    const bcrypt = require('bcryptjs');
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const sqlQuery = "SELECT password FROM users WHERE email = '" + userEmail + "';";

    db.get(sqlQuery, (err, row) => {
        if (err) {
            return console.error(err.message);
        } else if (!row) {
            // console.log("The row is empty.");
            return;
        }
        console.log(row, row.password);
        bcrypt.compare(userPassword, row.password, function(err, res1) {
        // res innehåller nu true eller false beroende på om det är rätt lösenord.
            if (res1) {
                const jwt = require('jsonwebtoken');
                const payload = { email: userEmail };
                const secret = process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, { expiresIn: '1h'});

                res.status(201).json({
                    data: {
                        msg: "Got a POST request",
                        token: token
                    }
                });
            } else {
                const token = "";

                res.status(201).json({
                    data: {
                        msg: "Got a failed POST request",
                        token: token
                    }
                });
            }
        });
        return row.password;
    });
});

router.post('/transactions', function(req, res, next) {
    const jwt = require('jsonwebtoken');
    const token = req.body.token;
    const userid = req.body.user_id;
    const soldamount = req.body.sold_amount;
    const soldcurrency = req.body.sold_currency;
    const purchamount = req.body.purch_amount;
    const purchcurrency = req.body.purch_currency;
    var myMessage;

    jwt.verify(token, process.env.JWT_SECRET, function(err) {
        if (err) {
            // not a valid token
            myMessage = "Du är inte inloggad.";
        } else {
            // valid token
            if (soldamount && soldcurrency && purchamount && purchcurrency && userid) {
                myMessage = "Du är inloggad. Transaktionen har sparats i databasen.";
                const sqlite3 = require('sqlite3').verbose();
                const db = new sqlite3.Database('./db/forex.sqlite');

                db.run("INSERT INTO transactions (sold_amount, sold_currency, purch_amount, "
                + "purch_currency, user_id) VALUES (?, ?, ?, ?, ?)",
                [soldamount, soldcurrency, purchamount, purchcurrency, userid], (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                db.run(`UPDATE users SET ${soldcurrency} = ${soldcurrency} - ?, ${purchcurrency}`
                + ` = ${purchcurrency} + ? WHERE id = ?`,
                [soldamount, purchamount, userid], (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                myMessage = "Ett eller flera värden saknas. " +
                    "Transaktionen har inte sparats i databasen.";
            }
        }
    });

    res.status(201).json({
        data: {
            msg: "Got a POST request",
            info: myMessage
        }
    });
});

router.post("/transactions",
    (req, res, next) => checkToken(req, res, next)
);

function checkToken(req, res, next) {
    const jwt = require('jsonwebtoken');
    const token = req.headers['x-access-token'];

    jwt.verify(token, process.env.JWT_SECRET, function(err) {
        if (err) {
            // send error response
        }

        // Valid token send on the request
        next();
    });
}

module.exports = router;
