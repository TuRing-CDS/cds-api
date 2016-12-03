/**
 * Created by Z on 2016-12-03.
 */
class Schema {
    constructor() {
        this.params = {};
    }

    param(name, options) {
        this.params[name] = options;
    }

    invoke(params, callback) {
        for (let key in this.params) {
            let item = this.params[key];
            if (item.isRequired) {
                if (params[item]==undefined){
                    callback()
                }
            }
        }
    }

    exec(fn) {
        this.fn = fn;
        return this;
    }
}

module.exports = Schema;