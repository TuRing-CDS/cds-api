/**
 * Created by Z on 2017-03-18.
 */
const path = require('path');
const expect = require('chai').expect;
const Router = require('../dist/routers').Router;
const getRouter = new Router('GET', '/home/:user', path.join(__dirname, './resources/routers/user'));
const postRouter = new Router('POST', '/home/:user', path.join(__dirname, './resources/routers/user'));

describe('Router\'s functions test', () => {
    it('getRouter.invoke("GET","/home") \'s status is 404', () => {
        return getRouter.invoke('GET', '/home', {}).then((response) => {
            expect(response.status).to.be.equal(404);
        });
    });
    it('getRouter.invoke("GET","/home/10000") \'s status is 200', () => {
        return getRouter.invoke('GET', '/home/10000').then((response) => {
            expect(response.status).to.be.equal(200);
        })
    });
    it('postRouter.invoke("POST","/home/10000") \'s status is 200', () => {
        return postRouter.invoke('POST', '/home/10000').then((response) => {
            expect(response.status).to.be.equal(200);
        })
    });
})
