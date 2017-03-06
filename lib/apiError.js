/**
 * Created by Z on 2017-03-06.
 */
'use strict'

class ApiError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

module.exports = ApiError;