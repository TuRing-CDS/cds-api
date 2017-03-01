/**
 * Created by Z on 2017-03-01.
 */
class Router {
    constructor(method, uri, schema) {
        this.path = `${method.toUpperCase()} ${uri}`;
        this.schema = schema;
    }
}

module.exports = Router;