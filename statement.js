const {
    Readable
} = require("stream");


function createStatementStream(
    transactions,
    accountNumber
) {

    const lines = [];


    lines.push(
        "=========================================="
    );

    lines.push(
        "             NOVA BANKING"
    );

    lines.push(
        "          TRANSACTION STATEMENT"
    );

    lines.push(
        "=========================================="
    );

    lines.push(
        `Account Number: ${accountNumber}`
    );

    lines.push("");


    if (
        transactions.length === 0
    ) {

        lines.push(
            "No transactions found."
        );

    } else {

        transactions.forEach(
            (transaction) => {

                lines.push(
                    `Transaction ID: ${transaction.id}`
                );

                lines.push(
                    `Type: ${transaction.type}`
                );


                if (
                    transaction.from_account
                ) {

                    lines.push(
                        `From: ${transaction.from_account}`
                    );
                }


                if (
                    transaction.to_account
                ) {

                    lines.push(
                        `To: ${transaction.to_account}`
                    );
                }


                lines.push(
                    `Amount: ₹${transaction.amount}`
                );


                lines.push(
                    `Date: ${new Date(
                        transaction.date
                    ).toLocaleString("en-IN")}`
                );


                lines.push(
                    "------------------------------------------"
                );

            }
        );
    }


    lines.push(
        "End of Statement"
    );

    lines.push(
        "=========================================="
    );


    return Readable.from(
        lines.map(
            line => line + "\n"
        )
    );
}


module.exports = {
    createStatementStream
};