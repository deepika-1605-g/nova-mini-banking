const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./banking.db");

function initializeDatabase(callback) {

    db.serialize(() => {

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                transaction_pin TEXT NOT NULL
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                account_number TEXT UNIQUE NOT NULL,
                balance REAL NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id)
                REFERENCES users(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                account_number TEXT NOT NULL,
                from_account TEXT,
                to_account TEXT,
                amount REAL NOT NULL,
                date TEXT NOT NULL
            )
        `, (error) => {

            if (error) {
                console.log(
                    "Database initialization failed:",
                    error.message
                );

                callback(error);
                return;
            }

            console.log(
                "Database initialized successfully."
            );

            callback(null);
        });

    });
}

module.exports = {
    db,
    initializeDatabase
};