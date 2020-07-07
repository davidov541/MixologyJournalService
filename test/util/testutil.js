const latestAPIVersion = 1;

function getBaseRequest(b) {
    return {   
        body: b,
        headers: {
            apiVersion: latestAPIVersion
        },
    }
}

function getBaseContext() {
    return {   
        res: {},
        log: function (msg) {}        
    }
}

exports.getBaseRequest = getBaseRequest;
exports.getBaseContext = getBaseContext;