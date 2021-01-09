[![Build Status](https://travis-ci.com/ahonson/forex-backend.svg?branch=main)](https://travis-ci.com/ahonson/forex-backend)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/ahonson/forex-backend/badges/quality-score.png?b=main)](https://scrutinizer-ci.com/g/ahonson/forex-backend/?branch=main)
[![Code Coverage](https://scrutinizer-ci.com/g/ahonson/forex-backend/badges/coverage.png?b=main)](https://scrutinizer-ci.com/g/ahonson/forex-backend/?branch=main)
[![Build Status](https://scrutinizer-ci.com/g/ahonson/forex-backend/badges/build.png?b=main)](https://scrutinizer-ci.com/g/ahonson/forex-backend/build-status/main)

# Forex-backend for Jsramverk at BTH fall 2020

This project was created with the following technologies: sqlite (5.0.0), express (4.17.1), bcryptjs (2.4.3). Check out `package.json` for a complete list of dependencies.

## Redovisningstext för kmom10

I projektet använde jag mig av exakt samma teknologier (node, express etc) som i tidigare kursmoment. På så sätt gick det att återanvända ganska mycket kod och struktur från me-sidan. Jag sköter autentisering med hjälp av `jsonwebtoken` medan för kryptering använder jag modulen `bcrypt`.

Jag känner att jag har bättre koll på relationsdatabaser än på mongoDB, så jag valde att arbeta med `sqlite3`. Databasen består av tre enkla tabeller (users, payments och transactions). Valutaprisernas historik sparas i en annan databas som ingår i socket-servern. `migrate.sql` skapar ett par nya rader i varje tabell så att det går att testa API:et direkt efter installationen.

## Project setup

Run `npm install` to create a `node_modules` directory, which contains all dependencies needed to run the project.

## Run the project

`node app.js` runs the project. `npm start` runs the project and updates itself when you make changes to the source code.
