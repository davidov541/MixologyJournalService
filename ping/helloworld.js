module.exports = async function (context, _) {
    context.log('GET /');
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "Hello World"
    };
};