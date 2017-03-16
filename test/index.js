/**
 * Created by Z on 2017-03-16.
 */
const Api = require('../').Api;

const api = new Api();

const path = require('path');

api.load(path.join(__dirname, "./apis/public.raml"));

module.exports = api;