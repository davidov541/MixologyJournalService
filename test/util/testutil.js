const latestAPIVersion = 1;

function getBaseRequest(b) {
    return {   
        body: b,
        headers: {},
    }
}

function getBaseContext() {
    return {   
        res: {},
        headers: {
            apiVersion: latestAPIVersion
        },
        log: function (msg) {}        
    }
}

exports.getBaseRequest = getBaseRequest;
exports.getBaseContext = getBaseContext;