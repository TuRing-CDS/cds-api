/**
 * Created by Z on 2017-03-18.
 */
const path = require('path');
const expect = require('chai').expect;
const Router = require('../dist/routers').Router;
const getRouter = new Router('GET', '/home/:user', path.join(__dirname, './resources/routers/user'));
const postRouter = new Router('POST', '/home/:user', path.join(__dirname, './resources/routers/user'));

describe('Router\'s functions test', () => {
    it('getRouter.invoke("GET","/home") \'s fail', () => {
        return getRouter.invoke('GET', '/home', {}).then((response) => {
            expect(response.status).to.be.equal(404);
            expect(response.error.message).to.be.equal('GET /home Not Found');
        });
    });
    it('getRouter.invoke("GET","/home/10000") \'s success', () => {
        return getRouter.invoke('GET', '/home/10000').then((response) => {
            expect(response.body).to.be.equal('body');
            expect(response.status).to.be.equal(200);
            expect(response.error).to.be.equal(null);
        })
    });
    it('postRouter.invoke("POST","/home/10000") \'s success', () => {
        return postRouter.invoke('POST', '/home/10000').then((response) => {
            expect(response.body).to.be.deep.equal({'post': 'body'})
            expect(response.status).to.be.equal(200);
            expect(response.error).to.be.equal(null);
        })
    });
})
