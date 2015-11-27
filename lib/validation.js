import ZSchema from 'z-schema'
import schemas from './schema'

export default function validateFun(object, schema){
    var validator = new ZSchema()

    var valid = validator.validate(object, schemas[schema])

    return {
        valid: valid,
        errors: validator.getLastErrors() || []
    }
}

export function validate(validator){
    return function(target, name, descriptor){
        var orig = descriptor.value

        descriptor.value = function(arg0){
            var res = validateFun(arg0, validator)
            if(!res.valid){
                return Promise.reject(res.errors)
            }
            return orig.apply(this,arguments)
        }

        return descriptor
    }
}


export function decorate(proto, method, decorator){
    let gopd = Object.getOwnPropertyDescriptor
    let dp   = Object.defineProperty
    let temp = decorator(proto,method, gopd(proto,method))

    dp(proto, method, temp)
}
