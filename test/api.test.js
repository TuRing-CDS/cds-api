/**
 * Created by Z on 2017-03-16.
 */
const api = require('./');

console.log(api.schemas.getType('user').validate({userName:'iameaaa',nickName:'iamex'}).getErrors())