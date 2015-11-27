"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    "id": "http://carlo-colombo.github.io/Mosplit/payment",
    "type": "object",
    "properties": {
        "source": {
            "id": "http://carlo-colombo.github.io/Mosplit/payment/source",
            "type": "string"
        },
        "target": {
            "id": "http://carlo-colombo.github.io/Mosplit/payment/target",
            "type": "string"
        },
        "amount": {
            "id": "http://carlo-colombo.github.io/Mosplit/payment/amount",
            "type": "number"
        },
        "trip": {
            "id": "http://carlo-colombo.github.io/Mosplit/payment/trip",
            "type": "string"
        }
    },
    "required": ["source", "target", "amount", "trip"]
};