/**
 * Created by Z on 2017-03-18.
 */

import {parse, tokensToRegExp, PathRegExp, Key} from 'path-to-regexp';
import * as path from 'path';
/**
 * 返回结果
 */
interface Response {
    isMatch: boolean;
    status: number;
    body: any;
    error?: Error;
}
/**
 * 路由器
 */
export class Router {
    /**
     * 请求方法
     */
    private method: string;
    /**
     * 路径
     */
    private uri: string;
    /**
     * 路径
     */
    private path: string;
    /**
     * 表达式
     */
    private regexp: PathRegExp;
    /**
     * 路径参数列表
     */
    private keys: string[];
    /**
     * 控制器路径
     */
    private controllerPath: string;

    /**
     * 构造方法
     * @param method
     * @param uri
     * @param controllerPath
     */
    constructor(method: string, uri: string, controllerPath: string) {
        this.method = method.toUpperCase();
        this.uri = uri;
        this.path = `${this.method} ${this.uri}`;
        this.regexp = tokensToRegExp(parse(this.path));
        this.keys = this.regexp.keys.map((item: Key) => {
            return String(item.name);
        });
        this.controllerPath = controllerPath || path.join(require.main.filename, uri.split('/').map((x: string) => {
                return x.indexOf(':') == -1 ? x : `${x.replace(':', '')}`
            }).join('/'));
    }

    /**
     * 调用方法
     * @param method    GET,PUT,POST,DELETE
     * @param uri       /users,/users/10000,/users/10000/photo ....
     * @param params    { query or body }
     * @returns {Promise<Response>}
     */
    async invoke(method: string, uri: string, params: any = {}): Promise<Response> {
        method = method.toUpperCase();
        //是否匹配成功
        let match = this.regexp.exec(`${method} ${uri}`);
        //路由
        let controller: any = null;
        //临时参数，主要用于匹配uri参数
        let tempParams: any = {};
        //得到uri参数列表，剔除第一个匹配成功的value
        //返回值
        let response: Response = {
            isMatch: !!match,
            status: 404,
            body: null,
            error: null
        };
        //是否匹配成功
        if (!!match) {
            let values: string[] = match.splice(1, this.keys.length);
            try {
                //加载controller控制器
                controller = require(this.controllerPath);
                //当前请求方法是否存在于 controller 控制器中
                if (controller && method.toLowerCase() in controller) {
                    //状态更改为200
                    //在用户Logic中，可以更改为其他状态码
                    response.status = 200;
                    //请求参数获取
                    this.keys.forEach((key: string, index: number) => {
                        tempParams[key] = values[index];
                    });
                    //参数合并
                    Object.assign(params, tempParams);
                    try {
                        //等待返回结果~
                        let methodFn: Function = controller[method.toLowerCase()] as Function;
                        //获取fn类型
                        let methodType: string = Object.prototype.toString.call(methodFn);
                        if ('[object AsyncFunction]' === methodType) {
                            //如果是 asyncFunction
                            response.body = await methodFn.bind(response)(params);
                        } else if ('[object Function]' === methodType) {
                            //如果是 normalFunction
                            response.body = methodFn.bind(response)(params);
                        } else {
                            //其他 类型的~~不管不顾了
                            response.body = methodFn;
                        }
                    } catch (ex) {
                        //捕获异常
                        //如果状态码没有改变，则默认给他一个 500
                        response.status = response.status == 200 ? 500 : response.status;
                        response.error = ex;
                    }
                } else {
                    response.status = 404;
                    response.error = new Error(`${method} not in ${this.uri}`);
                }
            } catch (ex) {
                //加载控制器，控制器不存在，抛出异常
                response.status = 404;
                response.error = ex;
            }
        } else {
            response.error = new Error(`${method} ${uri} Not Found`);
        }
        return response;
    }
}