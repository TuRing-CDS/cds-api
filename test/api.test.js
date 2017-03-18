/**
 * Created by Z on 2017-03-18.
 */
const api = require('./');
const path = require('path');
const apiDirPath = path.join(__dirname, "./resources/apis/a.raml");
const expect = require('chai').expect;
api.load(apiDirPath);
