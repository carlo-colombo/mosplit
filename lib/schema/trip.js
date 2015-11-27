export default {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "http://carlo-colombo.github.io/Mosplit/trip",
    "type": "object",
    "properties": {
        "name": {
            "id": "http://carlo-colombo.github.io/Mosplit/trip/name",
            "type": "string",
            "minLength": 1
        },
        "splitters": {
            "id": "http://carlo-colombo.github.io/Mosplit/trip/splitters",
            "type": "array",
            "minItems": 1,
            "uniqueItems": false,
            "additionalItems": true,
            "items": {
                "id": "http://carlo-colombo.github.io/Mosplit/trip/splitters/0",
                "type": "string"
            }
        }
    },
    "required": [
        "name",
        "splitters"
    ]
}
