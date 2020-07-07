function migrateRequestToLatestVersion(body, apiVersion) {
    const version = getActualVersion(apiVersion);
    if (version < 1) {
        return convertVersion0(body);
    } else {
        return convertVersion1(body);
    }
}

function convertVersion0(body) {
    body.basisRecipe = body.sourceRecipeID;
    return convertVersion1(body);
}

function convertVersion1(body) {
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