/**
 * Created by Z on 2017-03-16.
 */

export function forEachExt(callback: Function): Boolean {
    for (let i: number = 0, len: number = this.length; i < len; i++) {
        if (!!callback(this[i], i)) return true;
    }
    return false;
}