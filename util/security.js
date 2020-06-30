var jwt = () => require('jsonwebtoken');
var config = require("../config/config");

async function checkToken(context, req) {
    var result = {
        "error": {},
        "user": {},
        "success": false
    }
    var token;
    if (!req.headers.authorization) {
        result.error = {
            "message": "Authentication required for this API.",
            "code": 401
        }
        context.log("Error found: " + JSON.stringify(result));
        return result;
    }
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

    const issuer = "https://" + process.env.AUTH0_DOMAIN + "/";

    const options = { issuer: issuer, complete: true, algorithms: ['RS256'] };
    var dtoken;
    try {
        dtoken = jwt().decode(token, options)
    } catch (err) {
        result.error = {
            "message": "Cannot decode token: " + err,
            "code": 403
        }
        context.log("Error found: " + JSON.stringify(result));
        return result;
    }

    const cert = (await config()).signingToken;
    var rawResult;
    try {
        rawResult = jwt().verify(token, cert, options) || {};
    } catch (err) {
        result.error = {
            "message": "Invalid token: " + err,
            "code": 403
        }
        context.log("Error found: " + JSON.stringify(result));
        return result;
    }

    result.user = rawResult;
    result.success = true;
    context.log("Result: " + JSON.stringify(result));
    return result;
}

function isAdmin(user) {
    return user.payload.sub == process.env.ADMIN_USER;
}

exports.checkToken = checkToken;
exports.isAdmin = isAdmin;