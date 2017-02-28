/**
 * Created by Z on 2017-02-28.
 */
var Joi = require('joi');

var schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    access_token: [Joi.string(), Joi.number()],
    birthyear: Joi.number().integer().min(1900).max(2013),
    email: Joi.string().email()
}).with('username', 'birthyear').with('email','password').without('password', 'access_token').without('email','access_token');

Joi.validate({username: 'abc', birthyear: 1994}, schema, function (err, value) {
    console.log(err, value);
});

Joi.validate({email: 'abc@abc.com', password: '1994'}, schema, function (err, value) {
    console.log(err, value);
});

console.log(Joi.attempt({email: 'abc@abc.com', birthyear: '1994',password:'xxxx'},schema,'yes'))