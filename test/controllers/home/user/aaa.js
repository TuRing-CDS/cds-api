/**
 * Created by iZhui on 2017/3/13.
 */

const cdsRequest = require('cds-hot').cdsRequire

module.exports.get = async function(){
    return cdsRequest('./logic/demo');
}