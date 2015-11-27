'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = validateFun;
exports.validate = validate;
exports.decorate = decorate;

var _zSchema = require('z-schema');

var _zSchema2 = _interopRequireDefault(_zSchema);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validateFun(object, schema) {
    var validator = new _zSchema2.default();

    var valid = validator.validate(object, _schema2.default[schema]);

    return {
        valid: valid,
        errors: validator.getLastErrors() || []
    };
}

function validate(validator) {
    return function (target, name, descriptor) {
        var orig = descriptor.value;

        descriptor.value = function (arg0) {
            var res = validateFun(arg0, validator);
            if (!res.valid) {
                return Promise.reject(res.errors);
            }
            return orig.apply(this, arguments);
        };

        return descriptor;
    };
}

function decorate(proto, method, decorator) {
    var gopd = Object.getOwnPropertyDescriptor;
    var dp = Object.defineProperty;
    var temp = decorator(proto, method, gopd(proto, method));

    dp(proto, method, temp);
}