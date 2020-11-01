/* eslint-env node, mocha */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const assert = require("chai").assert;
const db = require("../db/database.js");
var token;

console.log("MY DB: ", db);
chai.should();

chai.use(chaiHttp);

describe('Routes', () => {
    before(() => {
        db.run("INSERT INTO users (email, password) VALUES (?, ?)", "jo@jo.jo",
            "$2a$10$vYiGTxMrFYDve3v5.bnAj.La2rkUa4cSZWXCj/ZwuDmkwgw6wCszC",
            (err) => {
                if (err) {
                    console.error("Could not insert user into db", err.message);
                }
            });
    });

    describe('GET /', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.be.an("object").that.has.all.keys([
                        'msg', 'routes'
                    ]);
                    done();
                });
        });
    });

    describe('GET /blabla', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/blabla")
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.be.an("object").that.has.all.keys([
                        'errors'
                    ]);
                    done();
                });
        });
    });

    describe('GET /total', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/total")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.be.an("object").that.has.all.keys([
                        'nrofusers', 'nroftransactions'
                    ]);
                    done();
                });
        });
    });

    describe('GET /payments/1', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/payments/1")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.be.an("object").that.has.all.keys([
                        '1',
                    ]);
                    done();
                });
        });

        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/payments/456")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    done();
                });
        });
    });

    describe('GET /transactions/2', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/transactions/2")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.be.an("object").that.has.all.keys([
                        '2',
                    ]);
                    done();
                });
        });
    });

    describe('GET /users/joe@joe.joe', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/users/joe@joe.joe")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.be.an("object").that.has.all.keys([
                        'email', 'created', 'usd', 'sek', 'chf', 'eur', 'gbp'
                    ]);
                    done();
                });
        });
    });

    describe('POST /register', () => {
        it('201 POST PATH', (done) => {
            let credentials = {
                email: "do@do.do",
                password: "pass123"
            };

            chai.request(server)
                .post("/register")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });

        it('201 POST PATH', (done) => {
            let credentials = {
                email: "do@do.do",
                password: "pass123"
            };

            chai.request(server)
                .post("/register")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });
    });

    describe('POST /login', () => {
        it('201 POST PATH', (done) => {
            let credentials = {
                email: "jo@jo.jo",
                password: ""
            };

            chai.request(server)
                .post("/login")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    token = JSON.parse(res.text).data.token;
                    assert.equal(token, "");
                    done();
                });
        });

        it('201 POST PATH', (done) => {
            let credentials = {
                email: "jo@jo.jo",
                password: "pass123"
            };

            chai.request(server)
                .post("/login")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    token = JSON.parse(res.text).data.token;
                    done();
                });
        });
    });

    describe('POST /addtobalance', () => {
        it('201 POST PATH', (done) => {
            let credentials = {
                token: "token",
                amount: 150,
                user_id: 3
            };

            chai.request(server)
                .post("/addtobalance")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    var info = JSON.parse(res.text).data.info;

                    assert.equal(info, "Du är inte inloggad.");
                    done();
                });
        });

        it('201 POST PATH', (done) => {
            let credentials = {
                token: token,
                amount: 150,
                user_id: 3
            };

            chai.request(server)
                .post("/addtobalance")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    var info = JSON.parse(res.text).data.info;

                    assert.equal(
                        info, "Du är inloggad. Inbetalningen har registrerats på ditt konto."
                    );
                    done();
                });
        });

        it('201 POST PATH', (done) => {
            let credentials = {
                token: token,
                amount: 150
            };

            chai.request(server)
                .post("/addtobalance")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    var info = JSON.parse(res.text).data.info;

                    assert.equal(
                        info, "Ett eller flera värden saknas. Inbetalningen har inte registrerats."
                    );
                    done();
                });
        });
    });

    describe('POST /transactions', () => {
        it('201 POST PATH', (done) => {
            let credentials = {
                token: token,
                user_id: 3,
                sold_amount: 150,
                sold_currency: "sek",
                purch_amount: 15,
                purch_currency: "eur"
            };

            chai.request(server)
                .post("/transactions")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    var info = JSON.parse(res.text).data.info;

                    assert.equal(
                        info, "Du är inloggad. Transaktionen har sparats i databasen."
                    );
                    done();
                });
        });

        it('201 POST PATH', (done) => {
            let credentials = {
                token: token
            };

            chai.request(server)
                .post("/transactions")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    var info = JSON.parse(res.text).data.info;

                    assert.equal(
                        info, "Ett eller flera värden saknas. " +
                            "Transaktionen har inte sparats i databasen."
                    );
                    done();
                });
        });

        it('201 POST PATH', (done) => {
            let credentials = {
                token: "token"
            };

            chai.request(server)
                .post("/transactions")
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(201);
                    var info = JSON.parse(res.text).data.info;

                    assert.equal(
                        info, "Du är inte inloggad."
                    );
                    done();
                });
        });
    });

    after(() => {
        db.run("DELETE FROM users WHERE email = (?)",
            "jo@jo.jo",
            (err) => {
                if (err) {
                    console.error("Could not insert user into db", err.message);
                }
            });

        db.run("DELETE FROM users WHERE email = (?)",
            "do@do.do",
            (err) => {
                if (err) {
                    console.error("Could not insert user into db", err.message);
                }
            });
    });
});
