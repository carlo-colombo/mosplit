export default {
    "id": "http://carlo-colombo.github.io/Mosplit/bill",
    "type": "object",
    "properties": {
        "splitters": {
            "id": "http://carlo-colombo.github.io/Mosplit/bill/splitters",
            "type": "array",
            minItems: 1,
            "items": {
                "id": "http://carlo-colombo.github.io/Mosplit/bill/splitters/0",
                "type": "string"
            },
            "required": [
                "0"
            ]
        },
        "amount": {
            "id": "http://carlo-colombo.github.io/Mosplit/bill/amount",
            "type": "number"
        },
        "payer": {
            "id": "http://carlo-colombo.github.io/Mosplit/bill/payer",
            "type": "string"
        },
        "trip": {
            "id": "http://carlo-colombo.github.io/Mosplit/bill/trip",
            "type": "string"
        }
    },
    "required": [
        "splitters",
        "amount",
        "payer",
        "trip"
    ]
}
