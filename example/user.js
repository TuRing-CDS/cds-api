/**
 * Created by Z on 2017-02-28.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Joi = require('joi');
const language = require('./zh_CN');

const content = fs.readFileSync(path.join(__dirname, './schemas/user.yaml')).toString();

// var doc = yaml.safeLoad(content);

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

class Schema {

    constructor(content) {
        this.schema = Joi.object();
        this.keys = {};
        this.saveLoad(content);
    }

    saveLoad(content) {
        this.content = content;
        this.yaml = yaml.safeLoad(this.content);
        Object.keys(this.yaml.keys || {}).forEach((key) => {
            let item = this.yaml.keys[key];
            let schema = null;
            Object.keys(item).forEach((key) => {
                let value = item[key];
                schema = loadJoi.bind(schema)(key, value);
            });
            this.keys[key] = schema;
        });
        this.schema = this.schema.keys(this.keys);
        this.schema = this.schema.with.apply(this.schema, this.yaml.with || []);
        this.schema = this.schema.without.apply(this.schema, this.yaml.without || []);
    }

    validate(input) {
        return new Promise((resolve, reject) => {
            if (!this.schema) {
                return reject(new Error(`406::还没有实例化`));
            }
            Joi.validate(input, this.schema, {language: language.errors}, (err, value) => {
                if (err) {
                    return reject(err);
                }
                return resolve(value);
            })
        })
    }

    attempt(input) {
        return Joi.attempt(input, this.schema);
    }

    parse(input) {
        console.log(this.keys)
    }
}

let schema = new Schema(content);

let input = {
    username: 'iameea',
    email: 'admin@cavacn.com',
    password: 1000,
    age: '10',
    sex: 'fAlse'
};

schema.validate(input).then(console.log, function(err){
    console.log(err.details)
});
// console.log(schema.attempt(input))


