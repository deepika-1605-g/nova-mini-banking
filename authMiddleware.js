const jwt = require("jsonwebtoken");

const {
    JWT_SECRET
} = require("./login");


function verifyToken(
    req,
    res,
    next
) {

    let authorization =
        req.headers.authorization;


    if (!authorization) {

        return res.status(401).json({

            message:
                "Authentication required."

        });
    }


    let token =
        authorization;


    if (
        authorization.startsWith("Bearer ")
    ) {

        token =
            authorization.substring(7);

    }


    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        req.user =
            decoded;


        next();

    } catch (error) {

        return res.status(401).json({

            message:
                "Invalid or expired token."

        });
    }
}


module.exports =
    verifyToken;