/**
 * Created by Z on 2017-03-01.
 */
const Api = require('..');
const path = require('path');
const api = new Api();

api.load(path.join(__dirname,'./apis/api.raml'));

console.log(api.routers)