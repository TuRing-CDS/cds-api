/**
 * Created by Z on 2017-03-06.
 */

const ApiError = require('../../lib').ApiError;

module.exports.get = function(){
    throw new ApiError('错误，各种错误',303);
}