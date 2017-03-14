/**
 * Created by Z on 2017-03-01.
 */
'use strict'
const raml1Parser = require('raml-1-parser');
const Router = require('./router');
const path = require('path');
const fs = require('fs');
const ApiError = require('./apiError');
const Cache = require('./cache');
class Api {
    constructor() {

    }

    forEach(callback) {
        for (let i = 0, len = this.length; i < len; i++) {
            if (!!callback(this[i], i)) {
                return true;
            }
        }
        return false;
    }

    load(apiPath) {
        this.apiPath = apiPath;
        this.raml = raml1Parser.loadApiSync(apiPath);
        this.apis = this.raml.toJSON();
        this.schemas = this.mapSchemas(this.apis.schemas);
        this.routers = this.mapResources(this.apis.resources || []).sort((x, y) => x.path < y.path);
    }

    getSchema(queryParams, schema) {
        if (queryParams) {
            schema = {"type": 'object', 'properties': {}};
            Object.keys(queryParams).map((key) => {
                schema.properties[key] = Object.assign({}, queryParams[key]);
            })
        } else {
            schema = schema && this.schemas[schema];
        }
        return schema;
    }

    mapMethods(uri, methods) {
        let routers = [];
        methods.forEach((item) => {
            let schema = this.getSchema(item.queryParameters, item.body
                && item.body['application/json']
                && item.body['application/json'].schema
                && item.body['application/json'].schema[0] || null);
            let checkOuts = Object.keys(item.responses || {}).map((key) => {
                let subItem = item.responses[key];
                let checkOut = subItem.body
                    && subItem.body['application/json']
                    && subItem.body['application/json'].schema
                    && subItem.body['application/json'].schema[0] || null;
                checkOut = checkOut && this.schemas[checkOut];
                return {key, checkOut};
            }).filter((x) => x != null);
            routers.push(new Router(item.method, uri, schema, checkOuts, item.description));
        });
        return routers;
    }

    mapResources(resources, parent) {
        let routers = [];
        resources.forEach((item) => {
            if (item.methods) {
                routers = routers.concat(this.mapMethods([parent, item.relativeUri].join(''), item.methods));
            }
            if (item.resources) {
                routers = routers.concat(this.mapResources(item.resources, [parent, item.relativeUri].join('')));
            }
        });
        return routers;
    }

    mapSchemas(schemas) {
        let _schemas = {};
        schemas.forEach((item) => {
            Object.keys(item).forEach((sub) => {
                let subItem = item[sub];
                _schemas[sub] = require(path.resolve(path.dirname(this.apiPath), subItem.schemaPath));
            })
        });
        return _schemas;
    }

    invoke(path, params, callback) {
        if ('function' === typeof(params)) {
            callback = params;
            params = {};
        }
        let flag = this.forEach.bind(this.routers)((item) => {
            return !!item.invoke(path, params, function (err, result) {
                callback(err, result, this.status);
            });
        });
        if (!flag) {
            callback(new Error(`${path} not found!`), null, 404);
        }
    }
}

Api.ApiError = ApiError;

Api.Cache = Cache;

module.exports = Api