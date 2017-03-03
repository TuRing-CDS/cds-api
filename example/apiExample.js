/**
 * Created by iZhui on 2017/2/28.
 */

const path = require('path');

const fs = require('fs');

const yaml = require('js-yaml');

const content = yaml.safeLoad(fs.readFileSync(path.join(__dirname,'./apis/api.yaml')));

// console.log(content)

const METHODS = new Set(['GET','POST','DELETE','PUT']);


class Api{
    constructor(){

    }

    load(content){
        this.content = content;
        Object.keys(content).forEach((key)=>{
            let item = content[key];
            console.log(this.registe(key,item).s);
        })
    }

    registe(uri,item){
        if(METHODS.has(uri.toUpperCase())){
            return { method: uri.toUpperCase(), controller: item.controller , input: item.input, output: item.output}
        }else if('object'===typeof(item) && !!item) {
            let result = { path: uri, s: {} };
            Object.keys(item).forEach((key)=>{
                let subItem = item[key];
                result.s[key] = this.registe(uri,subItem);
            });
            return result
        }else{
            let result = {};
            result[uri] = item;
            return result;
        }
    }
}

const api = new Api();

api.load(content);

