/**
 * Created by Z on 2016-12-03.
 */
const Schema = require("../../lib").Schema;
module.exports = function (ns) {
    ns("GET /api", new Schema()
        .param('username',Schema.types.String))
}