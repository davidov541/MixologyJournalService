const fs = require('fs')

const uut = require('../util/entityConversion')

describe('Entity Conversion Tests', function () {
    test('should parse a drink JSON with an empty review field successfully.', async function () {
        const drinkJSON = JSON.parse(fs.readFileSync('test/resources/emptyReviewDrink.json'))._items[0]['8c956448-13e9-4191-a3d8-c4e68036e8bb']

        const actual = uut.processDrink(drinkJSON)

        const expected = {
              "id": "8c956448-13e9-4191-a3d8-c4e68036e8bb",
              "ingredients": [
                {
                  "amount": "0.75",
                  "ingredient": {
                    "id": "c80cbd2c-9270-4a73-8d25-8f9ef9d70d4f",
                    "name": "Lime Juice",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
                {
                  "amount": "2",
                  "ingredient": {
                    "id": "ea5e55dc-c6c7-4671-aed7-8f697179abc0",
                    "name": "Rum",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
                {
                  "amount": "1",
                  "ingredient": {
                    "id": "00d79a27-d012-4169-8d12-9b1db3e53546",
                    "name": "Simple Syrup",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
              ],
              "name": "Daiquiri",
              "rating": "4",
              "review": "",
              "steps": [
                "Combine gin and vermouth in mixing glass",
                "Stir",
                "Strain into a martini glass",
                "Garnish with three olives",
              ],
              "user": "root",
            }
        expect(actual).toEqual(expected)
    });

    test('should parse a drink JSON successfully.', async function () {
        const drinkJSON = JSON.parse(fs.readFileSync('test/resources/sampleDrinkResult.json'))._items[0]['8c956448-13e9-4191-a3d8-c4e68036e8bb']

        const actual = uut.processDrink(drinkJSON)

        const expected = {
              "id": "8c956448-13e9-4191-a3d8-c4e68036e8bb",
              "ingredients": [
                {
                  "amount": "0.75",
                  "ingredient": {
                    "id": "c80cbd2c-9270-4a73-8d25-8f9ef9d70d4f",
                    "name": "Lime Juice",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
                {
                  "amount": "2",
                  "ingredient": {
                    "id": "ea5e55dc-c6c7-4671-aed7-8f697179abc0",
                    "name": "Rum",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
                {
                  "amount": "1",
                  "ingredient": {
                    "id": "00d79a27-d012-4169-8d12-9b1db3e53546",
                    "name": "Simple Syrup",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
              ],
              "name": "Daiquiri",
              "rating": "4",
              "review": "This recipe turned out alright.\\nI could've done without the ginger beer.\\nThe vodka sucked.\\nWould get it again.",
              "steps": [
                "Combine gin and vermouth in mixing glass",
                "Stir",
                "Strain into a martini glass",
                "Garnish with three olives",
              ],
              "user": "root",
            }
        expect(actual).toEqual(expected)
    });
    
    test('should parse a recipe JSON successfully.', async function () {
        const recipeJSON = JSON.parse(fs.readFileSync('test/resources/sampleRecipeResult.json'))._items[0]['69dd79ac-1903-4c88-b7e4-b1314d6b149c']

        const actual = uut.processRecipe(recipeJSON)

        const expected = {
              "id": "69dd79ac-1903-4c88-b7e4-b1314d6b149c",
              "ingredients": [
                {
                  "amount": "2.0",
                  "ingredient": {
                    "id": "8730cecb-0b58-4033-9aa5-b127955639c1",
                    "name": "Gin",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
                {
                  "amount": "4.0",
                  "ingredient": {
                    "id": "732e5f28-c2df-499f-b081-51831293dbc2",
                    "name": "Tonic",
                  },
                  "unit": {
                    "id": "d29eabba-bf3b-4d1a-8431-8cdf2f2106bd",
                    "name": "Ounce",
                  },
                },
              ],
              "name": "Gin & Tonic",
              "steps": [
                "Build in a Tom Collins glass",
                "Stir",
                "Garnish with a lime wedge",
              ],
              "user": "root",
            }
        expect(actual).toEqual(expected)
    });
});