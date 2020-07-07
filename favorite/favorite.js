const cosmos = require('../util/persistence')
const security = require('../util/security')

module.exports = async function (context, req) {
    context.log('POST /secure/favorite');

    const securityResult = await security.checkToken(context, req);

    if (!securityResult.success)
    {
        context.res = {
            status: securityResult.error.code,
            body: securityResult.error.message
        }
    } else {
        try {
            const existingFavorite = await cosmos.getAllIncomingEdgesOfKind(req.body.recipeId, 'favorite', []);

            if (existingFavorite.length)
            {
                await cosmos.deleteEdge(existingFavorite[0].id)
            }

            await cosmos.createEdge(req.body.drinkId, req.body.recipeId, 'favorite', []);

            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    message: "Success"
                }
            };
        } catch (err) {
            console.log(err)
            context.res = {
                status: 500,
                body: {
                    message: "Error found",
                    error: err
                }
            };
        }
    } 
};