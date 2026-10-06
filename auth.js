const bcrypt = require("bcrypt");
const { db } = require("./database");

function registerUser(
    name,
    email,
    password,
    transactionPin,
    callback
) {

    db.get(
        "SELECT id FROM users WHERE email = ?",
        [email],
        async (error, existingUser) => {

            if (error) {

                callback(
                    "Database error."
                );

                return;
            }


            if (existingUser) {

                callback(
                    "Email already registered."
                );

                return;
            }


            try {

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                const hashedPin =
                    await bcrypt.hash(
                        transactionPin,
                        10
                    );


                db.run(
                    `
                    INSERT INTO users
                    (
                        name,
                        email,
                        password,
                        transaction_pin
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        name,
                        email,
                        hashedPassword,
                        hashedPin
                    ],
                    function (insertError) {

                        if (insertError) {

                            callback(
                                "Could not create user."
                            );

                            return;
                        }


                        const userId =
                            this.lastID;


                        const accountNumber =
                            "10000" + userId;


                        db.run(
                            `
                            INSERT INTO accounts
                            (
                                user_id,
                                account_number,
                                balance
                            )
                            VALUES (?, ?, ?)
                            `,
                            [
                                userId,
                                accountNumber,
                                0
                            ],
                            (accountError) => {

                                if (accountError) {

                                    callback(
                                        "Could not create account."
                                    );

                                    return;
                                }


                                callback(
                                    null,
                                    {
                                        message:
                                            "Registration successful.",
                                        accountNumber:
                                            accountNumber
                                    }
                                );

                            }
                        );

                    }
                );

            } catch (error) {

                console.log(
                    "Registration error:",
                    error.message
                );

                callback(
                    "Registration failed."
                );
            }

        }
    );
}

module.exports = {
    registerUser
};