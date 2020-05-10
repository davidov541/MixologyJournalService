const jwt = require('jsonwebtoken');
const config = require("../config/config");

function checkToken(context, req) {
    var result = {
        "error": {},
        "user": {},
        "success": false
    }
    var token;
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
        var scheme = parts[0];
        var credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
            token = credentials;
        } else {
            result.error = {
                "message": "Only JWTs are accepted for this API.",
                "code": 401
            }
            context.log("Error found: " + JSON.stringify(result));
            return result;
        }
    } else {
        result.error = {
            "message": "Authentication required for this API.",
            "code": 401
        }
        context.log("Error found: " + JSON.stringify(result));
        return result;
    }

    if (!token) {
        result.error = {
            "message": "No access token was found.",
            "code": 401
        }
        context.log("Error found: " + JSON.stringify(result));
        return result;
    }

    const cert = config.signingToken;
    const issuer = "https://" + process.env.AUTH0_DOMAIN + "/";

    const options = { issuer: issuer, complete: true, algorithms: ['RS256'] };
    var dtoken;
    try {
        dtoken = jwt.decode(token, options)
    } catch (err) {
        result.error = {
            "message": "Cannot decode token: " + err,
            "code": 403
        }
        context.log("Error found: " + JSON.stringify(result));
        return result;
    }

    var rawResult;
    try {
        rawResult = jwt.verify(token, cert, options) || {};
    } catch (err) {
        result.error = {
            "message": "Invalid token: " + err,
            "code": 403
        }
        context.log("Error found: " + JSON.stringify(result));
        return result;
    }

    context.log("Result: " + JSON.stringify(result));
    result.user = rawResult;
    result.success = true;
    return result;
}

exports.checkToken = checkToken;