/**
 * Created by Z on 2017-03-01.
 */
'use strict'
const raml1Parser = require('raml-1-parser');
const Router = require('./router');
const path = require('path');
const Template = require('./template');
const fs = require('fs');
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

    mapMethods(uri, methods) {
        let routers = [];
        methods.forEach((item) => {
            let schema = item.body
                && item.body['application/json']
                && item.body['application/json'].schema
                && item.body['application/json'].schema[0] || null;
            schema = schema && this.schemas[schema];
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

    mapResources(resources) {
        let routers = [];
        resources.forEach((item) => {
            if (item.methods) {
                routers = routers.concat(this.mapMethods(item.absoluteUri, item.methods));
            }
            if (item.resources) {
                routers = routers.concat(this.mapResources(item.resources));
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

    developController(templateContent) {
        this.routers.forEach((item) => {
            let template = new Template(templateContent, item);
            template.writeFile(item.controller.path);
        });
    }

    removeController(controllersPath){
        let emptyDir = function(dirUrl){
            let files = fs.readdirSync(dirUrl);
            files.forEach((file)=>{
                let tmpPath = path.join(dirUrl,file);
                let stats = fs.statSync(tmpPath);
                if(stats.isDirectory()){
                    emptyDir(tmpPath)
                    fs.rmdirSync(tmpPath);
                }else{
                    fs.unlinkSync(tmpPath);
                }
            })
        }

        emptyDir(controllersPath);
    }
}

module.exports = Api