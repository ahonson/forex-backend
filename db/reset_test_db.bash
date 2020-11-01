$(> db/forextest.sqlite)
cat db/migrate.sql | sqlite3 db/forextest.sqlite
