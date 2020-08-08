function migrateRequestToLatestVersion(body, apiVersion) {
    const version = getActualVersion(apiVersion);
    if (version < 2) {
        return convertVersion0(body);
    } else {
        return convertVersion2(body);
    }
}

function convertVersion0(body) {
    body.plural = body.name;
    body.format = "{0} {1} of {2}";
    return body;
}

function convertVersion2(body) {
    return body;
}

function getActualVersion(apiVersion) {
    if (apiVersion === undefined) {
        return 0;
    } else {
        return apiVersion;
    }
}

exports.migrateRequestToLatestVersion = migrateRequestToLatestVersion;