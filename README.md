# MixologyJournalService
![Node.js CI](https://github.com/davidov541/MixologyJournalService/workflows/Node.js%20CI/badge.svg?branch=master)

REST API for the Mixology Journal Service

## Versions
API versions are specified using apiversion tag in the header of a request. Any requests without such a tag is considered version 0.

- 0: Initial versions.
- 1: Switched to using basisRecipe instead of sourceRecipeID for the recipe ID on which a drink was based.
