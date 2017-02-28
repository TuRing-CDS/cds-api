/**
 * Created by Z on 2017-02-28.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Joi = require('joi');

const content = fs.readFileSync(path.join(__dirname, './schemas/uname.yaml')).toString();

var doc = yaml.safeLoad(content);

console.log(doc);

function loadJoi(key, value) {
    if (global === this || !this) {
        return loadJoi.bind(Joi)(key, value)
    }
    if ('type' === key) {
        return (value in this) ? this[value]() : this.object();
    } else {
        return (key in this) ? this[key](value) : this;
    }
}

let schema = null;

let user = doc.uname;


Object.keys(user).forEach((item) => {
    schema = loadJoi.bind(schema)(item, user[item]);
});
// console.log(schema)

Joi.validate('aaaaaa',schema,(err,value)=>{
    console.log(err,value)
});