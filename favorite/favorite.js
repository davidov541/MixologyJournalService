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

            var commands = [];
            if (existingFavorite.length)
            {
                commands.push(cosmos.queueDeleteEdge(existingFavorite[0].id));
            }

            if (req.body.isFavorited)
            {
                commands.push(cosmos.queueCreateEdge(req.body.drinkId, req.body.recipeId, 'favorite', []));
            }

            if (commands.length)
            {
                await cosmos.submitMutations(commands);
            }

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