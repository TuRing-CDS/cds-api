/**
 * Created by Z on 2016-12-03.
 */
"use strict"
const Ns = require("cds-namespace");
class Api {
    constructor() {
        this.ns = new Ns();
    }

    load(path) {
        this.ns.import(path);
    }

}

Api.Code = require("./code")

Api.Schema = require("./schema")

module.exports = Api;