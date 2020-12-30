/* eslint-env node, mocha */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');
const db = require("../db/database.js");

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
                        'nrofusers', 'nroftransactions', 'nrofpayments'
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
                    res.body.should.be.an("array");
                    done();
                });
        });

        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/payments/456")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
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
                    res.body.should.be.an("array");
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
                        'id', 'email', 'created', 'usd', 'sek', 'chf', 'eur', 'gbp'
                    ]);
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
