var express = require('express');
var router = express.Router();

require("dotenv").config();
const db = require("../db/database.js");

router.get('/', function(req, res, next) {
    res.json({
        msg: "Backend-API works! You can try the following routes.",
        routes: {
            users: "/users/:email",
            transactions: "transactions/:id"
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
            res.json({
                email: row.email,
                password: row.password,
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
        });
    });
});

router.get('/transactions/:id', function(req, res, next) {
    let sql = "SELECT * FROM transactions WHERE id = ?;";
    let transid = req.params.id;

    db.serialize(function() {
        db.get(sql, [transid], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (row) {
                res.json({
                    sold_currency: row.sold_currency,
                    sold_amount: row.sold_amount,
                    purch_currency: row.purch_currency,
                    purch_amount: row.purch_amount,
                    user_id: row.user_id
                });
            } else {
                res.json({ report: "There is no such transaction in the database." });
            }
            return row
                ? console.log(row.sold_amount)
                : console.log(`No report found with the name ${transid}`);
        });
    });
});

router.post('/register', function(req, res, next) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    // const sqlite3 = require('sqlite3').verbose();
    // const db = new sqlite3.Database('./db/texts.sqlite');

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
    // const sqlite3 = require('sqlite3').verbose();
    // const db = new sqlite3.Database('./db/texts.sqlite');
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
    const user_id = req.body.user_id;
    const sold_amount = req.body.sold_amount;
    const sold_currency = req.body.sold_currency;
    const purch_amount = req.body.purch_amount;
    const purch_currency = req.body.purch_currency;
    var myMessage;

    jwt.verify(token, process.env.JWT_SECRET, function(err) {
        if (err) {
            // not a valid token
            myMessage = "Du är inte inloggad.";
            // console.log("Du är inte inloggad.");
        } else {
            // valid token
            if (sold_amount && sold_currency && purch_amount && purch_currency && user_id) {
                myMessage = "Du är inloggad. Transaktionen har sparats i databasen.";
                // console.log(myMessage);
                // console.log(report);
                const sqlite3 = require('sqlite3').verbose();
                const db = new sqlite3.Database('./db/forex.sqlite');

                db.run("INSERT INTO transactions (sold_amount, sold_currency, purch_amount, purch_currency, user_id) VALUES (?, ?, ?, ?, ?)",
                    [sold_amount, sold_currency, purch_amount, purch_currency, user_id], (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                db.run(`UPDATE users SET ${sold_currency} = ${sold_currency} - ?, ${purch_currency} = ${purch_currency} + ? WHERE id = ?`,
                    [sold_amount, purch_amount, user_id], (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
            } else {
                myMessage = "Ett eller flera värden saknas. Transaktionen har inte sparats i databasen.";
                // console.log(myMessage);
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
    // (req, res) => reports.addReport(res, req.body)
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
