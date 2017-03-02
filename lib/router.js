/**
 * Created by Z on 2017-03-01.
 */
'use strict'
const pathToRegexp = require('path-to-regexp');
const path = require('path');
const Validator = require('jsonschema').Validator;
const validator = new Validator();
class Router {
    constructor(method, uri, schema, checkOuts, description) {
        this.path = `${method.toUpperCase()} ${uri}`;
        this.schema = schema;
        this.controller = {
            path: uri.split('/').map((x) => {
                return x.indexOf(':') == -1 ? x : `{${x.replace(':', '')}}`
            }).join('/'), method: method.toLowerCase()
        };
        this.regexp = pathToRegexp(this.path);
        this.keys = this.regexp.keys.map((item) => {
            return item.name;
        });
        this.checkOuts = {};
        this.description = description;
        (checkOuts || []).forEach((item) => {
            this.checkOuts[item.key] = item.checkOut;
        });
    }

    invoke(uri, params, cb) {
        let result = this.regexp.exec(uri);
        let flag = !!result;
        if (flag) {
            let controller = null;
            let status = {status: 200};
            let callback = function () {
                cb.apply(status, arguments);
                return true;
            }
            let tempParams = {};
            let values = result.splice(1, this.keys.length);
            let _cb = function (fn, params) {
                return fn.bind(status)(params);
            }
            try {
                controller = require(path.join(process.cwd(), 'controllers', this.controller.path));
            } catch (ex) {
                status.status = 404;
                return callback(new Error(`${ex.message}`));
            }
            if (!(this.controller.method in controller)) {
                status.status = 404;
                return callback(new Error(`${this.controller.method.toUpperCase()} not in ${this.controller.path}`))
            }
            this.keys.forEach((key, index) => {
                tempParams[key] = values[index];
            });
            Object.assign(params, tempParams);
            if (this.schema) {
                let validateResult = validator.validate(params, this.schema);
                if (!validateResult.valid) {
                    status.status = 400;
                    return callback(new Error(`${validateResult.errors.map((item) => {
                        return item.stack
                    }).join(' && ')}`));
                }
                params = validateResult.instance;
            }
            _cb(controller[this.controller.method], params).then((result) => {
                // status.status = (!!result && !!result.length) ? status.status : 404;
                return callback(null, result);
            }, (err) => {
                status.status = status.status == 200 ? 500 : status.status;
                return callback(err);
            });
        }
        return flag;
    }
}

module.exports = Router;