/**
 * Created by Z on 2017-02-28.
 */
const Joi = require('joi');
const yaml = require('js-yaml');

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
        this.keys = {};
        this.schema = Joi.object();
        this.saveLoad(content);
    }

    saveLoad(content) {
        this.content = content;
        Object.keys(this.content.keys || {}).forEach((key) => {
            let item = this.content.keys[key];
            let schema = null;
            Object.keys(item).forEach((key) => {
                let value = item[key];
                schema = loadJoi.bind(schema)(key, value);
            });
            if (!!schema) {
                this.keys[key] = schema;
            }
        });
        this.schema = this.schema.keys(this.keys);
        this.schema = this.schema.with.apply(this.schema, this.content.with || []);
        this.schema = this.schema.without.apply(this.schema, this.content.without || []);
    }

    validate(input, options, callback) {
        if ('function' === typeof(options)) {
            callback = options;
            options = {};
        }
        return Joi.validate(input, this.schema, options, callback);
    }

    attempt(input) {
        return Joi.attempt(input, this.schema);
    }

}

module.exports = Schema;