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
            return require(path);
        }
        return this.resetCache(path)
    }

    resetCache(path) {
        let array = [];
        if ('.js' === Path.extname(path)) {
            array.push(path);
        } else {
            array.push([path, 'js'].join('.'));
            array.push(Path.join(path, 'index.js'));
        }
        for (let i = 0, len = array.length; i < len; i++) {
            let item = array[i];
            if (fs.existsSync(item)) {
                let stat = fs.statSync(item);
                if (stat.mtime.getTime() !== this.caches[path]) {
                    delete require.cache[item];
                }
                this.caches[path] = stat.mtime.getTime()
            }
        }
        return require(path);
    }
}

module.exports = Cache;