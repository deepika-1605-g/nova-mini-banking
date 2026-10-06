const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db } = require("./database");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "nova-banking-demo-secret-2026";


function loginUser(
    email,
    password,
    callback
) {

    db.get(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email],
        async (error, user) => {

            if (error) {

                callback(
                    "Database error."
                );

                return;
            }


            if (!user) {

                callback(
                    "Invalid email or password."
                );

                return;
            }


            try {

                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );


                if (!passwordMatch) {

                    callback(
                        "Invalid email or password."
                    );

                    return;
                }


                const token =
                    jwt.sign(
                        {
                            userId: user.id,
                            email: user.email
                        },
                        JWT_SECRET,
                        {
                            expiresIn: "1h"
                        }
                    );


                callback(
                    null,
                    {
                        message:
                            "Login successful.",
                        token:
                            token
                    }
                );

            } catch (error) {

                console.log(
                    "Login error:",
                    error.message
                );

                callback(
                    "Login failed."
                );
            }

        }
    );
}


module.exports = {
    loginUser,
    JWT_SECRET
};