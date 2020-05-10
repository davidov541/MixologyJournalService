const cosmos = require('../util/cosmos')
const entityConversion = require('../util/entityConversion')

const jwt = require('jsonwebtoken');
const config = require("../config/config");

function checkToken(context, req) {
    var token;
    var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0];
        var credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        } else {
          context.log("Credentials Bad Scheme 1");
          return false;
        }
      } else {
        context.log("Credentials Bad Scheme 2");
        return false;
    }

    if (!token) {
      context.log("No access token was found.");
      return false;
    }

    const cert = config.signingToken;
    context.log("Cert = " + cert);

    const issuer = "https://mixologyjournal.auth0.com/";

    const options = { issuer: issuer, complete: true, algorithms: ['RS256'] };
    var dtoken;
    try {
        dtoken = jwt.decode(token, options)
    } catch (err) {
        context.log("Cannot Decode Token: " + JSON.stringify(err));
        return false;
    }
    context.log("DToken: " + JSON.stringify(dtoken));

    var result;
    try {
        result = jwt.verify(token, cert, options) || {};
    } catch (err) {
      context.log("Invalid Token: " + JSON.stringify(err));
      context.log("Error = " + err);
      context.log("Result = " + JSON.stringify(result));
      return false;
    }
    context.log("Result: " + JSON.stringify(result));
    return true;
}

module.exports = async (context, req) => {
    context.log('GET /insecure/recipes');

    const success = checkToken(context, req);
    context.log("Check Token Result: " + success);

    context.log("Request: " + JSON.stringify(req));

    if (!success)
    {
        context.res = {
            status: 401,
            body: "Error found: "  + JSON.stringify(success)
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