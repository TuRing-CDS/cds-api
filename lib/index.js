/**
 * Created by Z on 2017-03-01.
 */
const raml1Parser = require('raml-1-parser');
const Router = require('./router');
const path = require('path');
class Api {
    constructor() {

    }

    load(apiPath) {
        this.apiPath = apiPath;
        this.raml = raml1Parser.loadApiSync(apiPath);
        this.apis = this.raml.toJSON();
        this.schemas = this.mapSchemas(this.apis.schemas);
        this.routers = this.mapResources(this.apis.resources || []);
    }

    mapMethods(uri, methods) {
        let routers = [];
        methods.forEach((item) => {
            console.log(item)
            routers.push(new Router(item.method, uri));
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
}

module.exports = Api