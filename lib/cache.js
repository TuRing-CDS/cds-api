/**
 * Created by Z on 2017-03-14.
 */
const fs = require('fs');
const Path = require('path');
const async = require('async');
class Cache {
    constructor(isCache) {
        this.caches = {};
        this.isCache = isCache === undefined ? !!process.env.ISCACHE : isCache;
    }

    import(path) {
        if (!this.isCache) {
            return Promise.resolve(require(path));
        }
        return this.resetCache(path)
    }

    resetCache(path) {
        return new Promise((resolve, reject) => {
            let array = [];
            if ('.js' === Path.extname(path)) {
                array.push(path);
            } else {
                array.push([path, 'js'].join('.'));
                array.push(Path.join(path, 'index.js'));
            }
            async.map(array, (item, callback) => {
                fs.exists(item, (exists) => {
                    if (exists) {
                        return fs.stat(item, (err, stat) => {
                            callback(err, {path: item, stat: stat});
                        });
                    }
                    callback(null, {path: item, stat: null});
                })
            }, (err, list) => {
                (list || []).forEach((item) => {
                    if (!item)return;
                    if (!item.stat) return;
                    if (item.stat.mtime.getTime() !== this.caches[path]) {
                        delete require.cache[item.path]
                    }
                    this.caches[path] = item.stat.mtime.getTime();
                });
                try {
                    resolve(require(path));
                } catch (ex) {
                    reject(ex);
                }
            });
        });
    }
}

module.exports = Cache;