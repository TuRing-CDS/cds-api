/**
 * Created by Z on 2017-03-14.
 */
const fs = require('fs');
const Path = require('path');
class Cache {
    constructor(isCache) {
        this.caches = {};
        this.isCache = isCache === undefined ? !!process.env.ISCACHE : isCache;
    }

    import(path) {
        if (!this.isCache) {
            return Promise.resolve(require(path));
        }
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stat) => {
                if (err) {
                    return reject(err);
                }
                resolve(stat);
            })
        }).then((stat) => {
            return this.resetCache(stat, path);
        })
    }

    resetCache(stat, path) {
        let array = [];
        if ('.js' === Path.extname(path)) {
            array.push(path);
        } else {
            array.push([path, 'js'].join('.'));
            array.push(Path.join(path, 'index.js'));
        }
        for (let i = 0, len = array.length; i < len; i++) {
            if (require.cache[array[i]] && this.caches[path] !== stat.mtime.getTime()) {
                delete require.cache[array[i]];
            }
        }
        this.caches[path] = stat.mtime.getTime();
        return require(path)
    }
}

module.exports = Cache;