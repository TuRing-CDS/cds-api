/**
 * Created by Z on 2016-12-03.
 */
'use strict';
const path = require('path');

var Api = require("../lib")

let api = new Api();

api.load(path.join(__dirname,"./api"));

console.log(api)