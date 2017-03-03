/**
 * Created by Z on 2017-03-01.
 */
'use strict'
const Api = require('..');
const path = require('path');
const api = new Api();
const fs = require('fs');
const template = fs.readFileSync(path.join(__dirname, 'template', 'api.ejs')).toString();
api.load(path.join(__dirname, './apis/api.raml'));

// api.removeController(path.join(__dirname,'controllers'));

// api.developController(template);

api.invoke('GET /home', {aaa: 'aaaa', id: '023', uname: 'iamee'}, (err, result, code) => {
    console.log(code)
    if (err) {
        console.error("==>", err);
    }
    if (result) {
        console.log(result);
    }
})