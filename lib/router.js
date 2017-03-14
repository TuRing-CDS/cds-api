/**
 * Created by Z on 2017-03-01.
 */
'use strict'
const pathToRegexp = require('path-to-regexp');
const path = require('path');
const Validator = require('jsonschema').Validator;
const validator = new Validator();
const Cache = require('./cache');
class Router {

    constructor(method, uri, schema, checkOuts, description, controllerPath) {
        this.controllerPath = controllerPath;
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
        this.cache = new Cache();
        (checkOuts || []).forEach((item) => {
            this.checkOuts[item.key] = item.checkOut;
        });
    }

    validate(input, schema) {
        let validateResult = validator.validate(input, schema);
        if (!validateResult.valid) {
            throw new Error(`${validateResult.errors.map((item) => {
                return item.stack
            }).join(' && ')}`);
        }
        return validateResult.instance;
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
                try {
                    return fn.bind(status)(params);
                } catch (ex) {
                    return Promise.reject(ex);
                }
            }
            this.cache.import(path.join(this.controllerPath, this.controller.path)).then((controller) => {
                if (!(this.controller.method in controller)) {
                    status.status = 404;
                    return callback(new Error(`${this.controller.method.toUpperCase()} not in ${this.controller.path}`))
                }
                this.keys.forEach((key, index) => {
                    tempParams[key] = values[index];
                });
                Object.assign(params, tempParams);
                if (this.schema) {
                    try {
                        params = this.validate(params, this.schema);
                    } catch (ex) {
                        status.status = 400;
                        return callback(ex);
                    }
                }
                _cb(controller[this.controller.method], params).then((result) => {
                    return callback(null, this.validate(result, this.checkOuts[status.status] || {}));
                }).catch((err) => {
                    status.status = err.status || (status.status == 200 ? 500 : status.status);
                    return callback(err);
                });
            }).catch((ex) => {
                status.status = 404;
                return callback(ex);
            });
        }
        return flag;
    }

}

module.exports = Router;