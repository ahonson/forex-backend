$(> db/forex.sqlite)
cat db/migrate.sql | sqlite3 db/forex.sqlite
