/**
 * Created by Z on 2017-03-16.
 */

import {parse, tokensToRegExp, PathRegExp}  from 'path-to-regexp';
import {IParsedType} from 'raml-typesystem';
import * as path from 'path';

interface IController {
    path: string;
    method: string;
}

export class Router {
    method: string;
    uri: string;
    controller: IController;
    regexp: PathRegExp;
    path: string;
    keys: Array<string>;
    check: IParsedType;

    constructor(method: string, uri: string, check: IParsedType) {
        method = method.toUpperCase();
        this.path = `${method} ${uri}`;
        this.method = method;
        this.uri = uri;
        this.check = check;
        this.controller = {
            path: uri.split('/').map((x: string) => {
                return x.indexOf(':') == -1 ? x : `${x.replace(':', '')}`
            }).join('/'),
            method
        };
        this.regexp = tokensToRegExp(parse(this.path));
        this.keys = this.regexp.keys.map((item) => {
            return String(item.name);
        });
    }

    invoke(method: string, uri: string, params: any = {}, cb: Function) {
        method = method.toUpperCase();
        let match = this.regexp.exec(`${method} ${uri}`);
        if (!!match) {
            let controller: any = null;
            let status: any = {status: 200};
            let callback: Function = function () {
                cb.apply(status, arguments);
                return true;
            }
            let tempParams: any = {};
            let values: Array<string> = match.splice(1, this.keys.length);
            let _cb: Function = function (fn: Function, params: any) {
                try {
                    return fn.bind(status)(params);
                } catch (ex) {
                    return Promise.reject(ex);
                }
            }
            try {
                controller = require(path.join(path.dirname(require.main.filename), './controller', this.controller.path));
            } catch (ex) {
                status.status = 404;
                return callback(ex);
            }
            if (controller) {
                if (!(this.controller.method in controller)) {
                    status.status = 404;
                    return callback(new Error(`${this.controller.method} not in ${this.controller.path}`));
                }
                this.keys.forEach((key, index) => {
                    tempParams[key] = values[index];
                });
                Object.assign(params,tempParams);
            }
        }
        return !!match;
    }
}