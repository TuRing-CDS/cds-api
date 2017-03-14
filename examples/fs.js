/**
 * Created by Z on 2017-03-14.
 */
const fs = require('fs');
const path = require('path');

const stat = fs.statSync(path.join(__dirname,'./index.js'));

console.log(stat.mtime.getTime())

console.log(require.cache)