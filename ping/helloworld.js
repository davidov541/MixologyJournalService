module.exports = async function (context, req) {
    context.log('GET /');
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "Hello World"
    };
};