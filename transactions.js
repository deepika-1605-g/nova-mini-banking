const { db } = require("./database");


function saveTransaction(
    type,
    accountNumber,
    fromAccount,
    toAccount,
    amount,
    callback
) {

    const date =
        new Date().toISOString();


    db.run(
        `
        INSERT INTO transactions
        (
            type,
            account_number,
            from_account,
            to_account,
            amount,
            date
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            type,
            accountNumber,
            fromAccount,
            toAccount,
            amount,
            date
        ],
        (error) => {

            if (error) {

                console.log(
                    "Transaction save error:",
                    error.message
                );

                callback(error);

                return;
            }


            callback(null);

        }
    );
}


function getTransactions(
    accountNumber,
    callback
) {

    db.all(
        `
        SELECT
            id,
            type,
            account_number,
            from_account,
            to_account,
            amount,
            date

        FROM transactions

        WHERE
            account_number = ?
            OR from_account = ?
            OR to_account = ?

        ORDER BY
            date DESC
        `,
        [
            accountNumber,
            accountNumber,
            accountNumber
        ],
        (error, transactions) => {

            if (error) {

                callback(
                    error,
                    []
                );

                return;
            }


            callback(
                null,
                transactions
            );

        }
    );
}


module.exports = {
    saveTransaction,
    getTransactions
};