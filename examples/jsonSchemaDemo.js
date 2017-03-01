/**
 * Created by Z on 2017-03-01.
 */
const Validator = require('jsonschema').Validator;
const validator = new Validator();

const schema = require('./schemas/user.json');

const result = validator.validate({
    id: '022',
    uname:'aaaa'
}, schema);

console.log(result,result.errors,result.instance)