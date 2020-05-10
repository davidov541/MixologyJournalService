const cosmos = require('../util/cosmos')
const entityConversion = require('../util/entityConversion')

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
    context.log("Cert = " + cert);

    const issuer = "https://mixologyjournal.auth0.com/";

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

module.exports = async (context, req) => {
    context.log('GET /insecure/recipes');

    const securityResult = checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            const info = await cosmos.getAllDescendentsOfKind('recipe')
    
            var recipes = new Array();
            for(recipe in info) {
                recipes.push(entityConversion.processRecipe(info[recipe]));
            }
    
            context.res = {
                status: 200,
                body: recipes
            };
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: "Error found: " + err
            };
        }
    }
};