const express = require("express");

const {
    initializeDatabase,
    db
} = require("./database");

const {
    registerUser
} = require("./auth");

const {
    loginUser
} = require("./login");

const verifyToken =
    require("./authMiddleware");

const {
    saveTransaction,
    getTransactions
} = require("./transactions");

const {
    createStatementStream
} = require("./statement");

const bcrypt =
    require("bcrypt");


const app =
    express();


const PORT = process.env.PORT || 3000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(
    express.json()
);


app.use(
    express.static("public")
);


// ========================================
// REGISTER
// ========================================

app.post(
    "/register",
    (req, res) => {

        const {
            name,
            email,
            password,
            transactionPin
        } = req.body;


        if (
            !name ||
            !email ||
            !password ||
            !transactionPin
        ) {

            return res.status(400).json({

                message:
                    "All fields are required."

            });
        }


        if (
            !/^\d{4}$/.test(
                transactionPin
            )
        ) {

            return res.status(400).json({

                message:
                    "Transaction PIN must be exactly 4 digits."

            });
        }


        registerUser(
            name.trim(),
            email.trim().toLowerCase(),
            password,
            transactionPin,
            (error, result) => {

                if (error) {

                    return res.status(400).json({

                        message: error

                    });
                }


                res.status(201).json(
                    result
                );

            }
        );

    }
);


// ========================================
// LOGIN
// ========================================

app.post(
    "/login",
    (req, res) => {

        const {
            email,
            password
        } = req.body;


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Email and password are required."

            });
        }


        loginUser(
            email.trim().toLowerCase(),
            password,
            (error, result) => {

                if (error) {

                    return res.status(401).json({

                        message: error

                    });
                }


                res.json(
                    result
                );

            }
        );

    }
);


// ========================================
// ACCOUNT
// ========================================

app.get(
    "/account",
    verifyToken,
    (req, res) => {

        db.get(
            `
            SELECT
                users.name,
                users.email,
                accounts.account_number,
                accounts.balance

            FROM users

            JOIN accounts
                ON users.id =
                   accounts.user_id

            WHERE users.id = ?
            `,
            [
                req.user.userId
            ],
            (error, account) => {

                if (error) {

                    console.log(
                        "Account error:",
                        error.message
                    );

                    return res.status(500).json({

                        message:
                            "Could not load account."

                    });
                }


                if (!account) {

                    return res.status(404).json({

                        message:
                            "Account not found."

                    });
                }


                res.json({

                    name:
                        account.name,

                    email:
                        account.email,

                    accountNumber:
                        account.account_number,

                    balance:
                        account.balance

                });

            }
        );

    }
);


// ========================================
// DEPOSIT
// ========================================

app.post(
    "/deposit",
    verifyToken,
    (req, res) => {

        const {
            amount,
            transactionPin
        } = req.body;


        const depositAmount =
            Number(amount);


        if (
            !depositAmount ||
            depositAmount <= 0
        ) {

            return res.status(400).json({

                message:
                    "Enter a valid amount."

            });
        }


        if (
            !transactionPin
        ) {

            return res.status(400).json({

                message:
                    "Transaction PIN is required."

            });
        }


        db.get(
            `
            SELECT
                users.transaction_pin,
                accounts.account_number,
                accounts.balance

            FROM users

            JOIN accounts
                ON users.id =
                   accounts.user_id

            WHERE users.id = ?
            `,
            [
                req.user.userId
            ],
            async (error, account) => {

                if (error) {

                    return res.status(500).json({

                        message:
                            "Database error."

                    });
                }


                if (!account) {

                    return res.status(404).json({

                        message:
                            "Account not found."

                    });
                }


                const pinMatch =
                    await bcrypt.compare(
                        transactionPin,
                        account.transaction_pin
                    );


                if (!pinMatch) {

                    return res.status(401).json({

                        message:
                            "Incorrect transaction PIN."

                    });
                }


                const newBalance =
                    account.balance +
                    depositAmount;


                db.run(
                    `
                    UPDATE accounts

                    SET balance = ?

                    WHERE user_id = ?
                    `,
                    [
                        newBalance,
                        req.user.userId
                    ],
                    (updateError) => {

                        if (updateError) {

                            return res.status(500).json({

                                message:
                                    "Deposit failed."

                            });
                        }


                        saveTransaction(
                            "DEPOSIT",
                            account.account_number,
                            account.account_number,
                            null,
                            depositAmount,
                            (transactionError) => {

                                if (transactionError) {

                                    return res.status(500).json({

                                        message:
                                            "Transaction could not be saved."

                                    });
                                }


                                res.json({

                                    message:
                                        "Deposit successful.",

                                    balance:
                                        newBalance

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// ========================================
// WITHDRAW
// ========================================

app.post(
    "/withdraw",
    verifyToken,
    (req, res) => {

        const {
            amount,
            transactionPin
        } = req.body;


        const withdrawAmount =
            Number(amount);


        if (
            !withdrawAmount ||
            withdrawAmount <= 0
        ) {

            return res.status(400).json({

                message:
                    "Enter a valid amount."

            });
        }


        if (
            !transactionPin
        ) {

            return res.status(400).json({

                message:
                    "Transaction PIN is required."

            });
        }


        db.get(
            `
            SELECT
                users.transaction_pin,
                accounts.account_number,
                accounts.balance

            FROM users

            JOIN accounts
                ON users.id =
                   accounts.user_id

            WHERE users.id = ?
            `,
            [
                req.user.userId
            ],
            async (error, account) => {

                if (error) {

                    return res.status(500).json({

                        message:
                            "Database error."

                    });
                }


                if (!account) {

                    return res.status(404).json({

                        message:
                            "Account not found."

                    });
                }


                const pinMatch =
                    await bcrypt.compare(
                        transactionPin,
                        account.transaction_pin
                    );


                if (!pinMatch) {

                    return res.status(401).json({

                        message:
                            "Incorrect transaction PIN."

                    });
                }


                if (
                    account.balance <
                    withdrawAmount
                ) {

                    return res.status(400).json({

                        message:
                            "Insufficient balance."

                    });
                }


                const newBalance =
                    account.balance -
                    withdrawAmount;


                db.run(
                    `
                    UPDATE accounts

                    SET balance = ?

                    WHERE user_id = ?
                    `,
                    [
                        newBalance,
                        req.user.userId
                    ],
                    (updateError) => {

                        if (updateError) {

                            return res.status(500).json({

                                message:
                                    "Withdrawal failed."

                            });
                        }


                        saveTransaction(
                            "WITHDRAW",
                            account.account_number,
                            account.account_number,
                            null,
                            withdrawAmount,
                            (transactionError) => {

                                if (transactionError) {

                                    return res.status(500).json({

                                        message:
                                            "Transaction could not be saved."

                                    });
                                }


                                res.json({

                                    message:
                                        "Withdrawal successful.",

                                    balance:
                                        newBalance

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// ========================================
// TRANSFER
// ========================================

app.post(
    "/transfer",
    verifyToken,
    (req, res) => {

        const {
            receiverAccount,
            amount,
            transactionPin
        } = req.body;


        const transferAmount =
            Number(amount);


        if (
            !receiverAccount
        ) {

            return res.status(400).json({

                message:
                    "Receiver account number is required."

            });
        }


        if (
            !transferAmount ||
            transferAmount <= 0
        ) {

            return res.status(400).json({

                message:
                    "Enter a valid amount."

            });
        }


        if (
            !transactionPin
        ) {

            return res.status(400).json({

                message:
                    "Transaction PIN is required."

            });
        }


        db.get(
            `
            SELECT
                users.transaction_pin,
                accounts.account_number,
                accounts.balance

            FROM users

            JOIN accounts
                ON users.id =
                   accounts.user_id

            WHERE users.id = ?
            `,
            [
                req.user.userId
            ],
            async (error, sender) => {

                if (error) {

                    return res.status(500).json({

                        message:
                            "Database error."

                    });
                }


                if (!sender) {

                    return res.status(404).json({

                        message:
                            "Sender account not found."

                    });
                }


                if (
                    sender.account_number ===
                    receiverAccount
                ) {

                    return res.status(400).json({

                        message:
                            "You cannot transfer money to yourself."

                    });
                }


                const pinMatch =
                    await bcrypt.compare(
                        transactionPin,
                        sender.transaction_pin
                    );


                if (!pinMatch) {

                    return res.status(401).json({

                        message:
                            "Incorrect transaction PIN."

                    });
                }


                if (
                    sender.balance <
                    transferAmount
                ) {

                    return res.status(400).json({

                        message:
                            "Insufficient balance."

                    });
                }


                db.get(
                    `
                    SELECT
                        account_number,
                        balance

                    FROM accounts

                    WHERE account_number = ?
                    `,
                    [
                        receiverAccount
                    ],
                    (receiverError, receiver) => {

                        if (receiverError) {

                            return res.status(500).json({

                                message:
                                    "Database error."

                            });
                        }


                        if (!receiver) {

                            return res.status(404).json({

                                message:
                                    "Receiver account not found."

                            });
                        }


                        const senderBalance =
                            sender.balance -
                            transferAmount;


                        const receiverBalance =
                            receiver.balance +
                            transferAmount;


                        db.run(
                            `
                            UPDATE accounts

                            SET balance = ?

                            WHERE account_number = ?
                            `,
                            [
                                senderBalance,
                                sender.account_number
                            ],
                            (senderUpdateError) => {

                                if (senderUpdateError) {

                                    return res.status(500).json({

                                        message:
                                            "Transfer failed."

                                    });
                                }


                                db.run(
                                    `
                                    UPDATE accounts

                                    SET balance = ?

                                    WHERE account_number = ?
                                    `,
                                    [
                                        receiverBalance,
                                        receiver.account_number
                                    ],
                                    (receiverUpdateError) => {

                                        if (receiverUpdateError) {

                                            return res.status(500).json({

                                                message:
                                                    "Transfer failed."

                                            });
                                        }


                                        saveTransaction(
                                            "TRANSFER",
                                            sender.account_number,
                                            sender.account_number,
                                            receiver.account_number,
                                            transferAmount,
                                            (transactionError) => {

                                                if (transactionError) {

                                                    return res.status(500).json({

                                                        message:
                                                            "Transaction could not be saved."

                                                    });
                                                }


                                                res.json({

                                                    message:
                                                        "Transfer successful.",

                                                    balance:
                                                        senderBalance

                                                });

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


// ========================================
// TRANSACTIONS
// ========================================

app.get(
    "/transactions",
    verifyToken,
    (req, res) => {

        db.get(
            `
            SELECT account_number

            FROM accounts

            WHERE user_id = ?
            `,
            [
                req.user.userId
            ],
            (error, account) => {

                if (error) {

                    return res.status(500).json({

                        message:
                            "Database error."

                    });
                }


                if (!account) {

                    return res.status(404).json({

                        message:
                            "Account not found."

                    });
                }


                getTransactions(
                    account.account_number,
                    (transactionError, transactions) => {

                        if (transactionError) {

                            return res.status(500).json({

                                message:
                                    "Could not load transactions."

                            });
                        }


                        res.json({

                            transactions:
                                transactions

                        });

                    }
                );

            }
        );

    }
);


// ========================================
// STATEMENT
// ========================================

app.get(
    "/statement",
    verifyToken,
    (req, res) => {

        db.get(
            `
            SELECT account_number

            FROM accounts

            WHERE user_id = ?
            `,
            [
                req.user.userId
            ],
            (error, account) => {

                if (error) {

                    return res.status(500).json({

                        message:
                            "Database error."

                    });
                }


                if (!account) {

                    return res.status(404).json({

                        message:
                            "Account not found."

                    });
                }


                getTransactions(
                    account.account_number,
                    (transactionError, transactions) => {

                        if (transactionError) {

                            return res.status(500).json({

                                message:
                                    "Could not create statement."

                            });
                        }


                        res.setHeader(
                            "Content-Type",
                            "text/plain"
                        );


                        res.setHeader(
                            "Content-Disposition",
                            "attachment; filename=\"nova-statement.txt\""
                        );


                        const stream =
                            createStatementStream(
                                transactions,
                                account.account_number
                            );


                        stream.pipe(res);

                    }
                );

            }
        );

    }
);


// ========================================
// START SERVER
// ========================================

initializeDatabase(
    (error) => {

        if (error) {

            console.log(
                "Server could not start."
            );

            process.exit(1);
        }


        app.listen(
            PORT,
            () => {

                console.log("");
                console.log(
                    "===================================="
                );

                console.log(
                    "       NOVA BANKING SERVER"
                );

                console.log(
                    "===================================="
                );

                console.log(
                    `Running at http://localhost:${PORT}`
                );

                console.log(
                    "===================================="
                );

            }
        );

    }
);