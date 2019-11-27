// tslint:disable-next-line:no-var-requires
import chai = require('chai');
import supertest, { Response } from 'supertest';
import { Server } from 'restify';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { Img } from '../../../api/img/models';
import * as img_routes from '../../../api/img/routes';
import * as img_route from '../../../api/img/route';
import { removeNullProperties } from '../../../utils';
import { testObjectValidation } from '../../shared_tests';

/* tslint:disable:no-var-requires */
const img_schema = sanitiseSchema(require('./schema.json'), Img._omit);

/* tslint:disable-next-line:no-var-requires */
chai.use(require('chai-json-schema-ajv'));

const expect: Chai.ExpectStatic = chai.expect;

export class ImgTestSDK {
    constructor(public app: Server) {
    }

    private _access_token?: AccessTokenType;

    public get access_token(): AccessTokenType {
        if (this._access_token == null)
            throw new TypeError('`access_token` argument must be defined');
        return this._access_token;
    };

    public set access_token(new_access_token: AccessTokenType) {
        this._access_token = new_access_token;
    }

    public get(img_id: Img['id']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (img_id == null)
                return reject(new TypeError('`img_id` argument to `get` must be defined'));

            expect(img_route.get).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                        supertest(this.app)
                            .get(`/api/img/${img_id}`)
                            .set('Accept', 'application/json')
                            .set('X-Access-Token', this.access_token)
                            .expect('Content-Type', /json/)
                            .end((err, res: Response) => {
                                if (err != null) reject(supertestGetError(err, res));
                                else if (res.error) return reject(getError(res.error));

                                try {
                                    expect(res.status).to.be.equal(200);
                                    expect(res.body).to.be.an('object');
                                    expect(removeNullProperties(res.body)).to.be.jsonSchema(img_schema);
                                } catch (e) {
                                    return reject(e as Chai.AssertionError);
                                }
                                return resolve(res);
                            })
                    }
                )
                .catch(reject)
        });
    }

    public post(img: Img): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (img == null)
                return reject(new TypeError('`img` argument to `post` must be defined'));

            expect(img_routes.create).to.be.an.instanceOf(Function);
            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .post('/api/img')
                        .send(img)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .expect('Content-Type', /json/)
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));

                            try {
                                expect(res.status).to.be.equal(201);
                                expect(res.body).to.be.an('object');
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(img_schema);
                            } catch (e) {
                                return reject(e as Chai.AssertionError);
                            }

                            return resolve(res);
                        })
                })
                .catch(reject);
        });
    }

    public update(img_id: Img['id'], img: Partial<Img>): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (img == null)
                return reject(new TypeError('`img` argument to `update` must be defined'));

            expect(img_route.update).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() =>
                    supertest(this.app)
                        .put(`/api/img/${img_id}`)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .send(img)
                        // .expect('Content-Type', /json/)
                        .then((res: Response) => {
                            if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.status).to.be.equal(200);
                                expect(res.body).to.be.an('object');
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(img_schema);
                                Object.keys(img).forEach(k => expect(img[k]).to.be.eql(res.body[k]));
                            } catch (e) {
                                return reject(e as Chai.AssertionError);
                            }
                            return resolve(res);
                        })
                        .catch(err => reject(supertestGetError(err)))
                )
                .catch(reject)
        });
    }

    public remove(img_id: Img['id']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (img_id == null)
                return reject(new TypeError('`img_id` argument to `update` must be defined'));

            expect(img_route.remove).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .delete(`/api/img/${img_id}`)
                        .set('X-Access-Token', this.access_token)
                        // .expect('Content-Type', /json/)
                        .end((err, res: Response) => {
                            if (err != null) reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));

                            try {
                                expect(res.status).to.be.equal(204);
                            } catch (e) {
                                return reject(e as Chai.AssertionError);
                            }
                            return resolve(res);
                        })
                })
                .catch(reject)
        });
    }

    public getAll(): Promise<Response> {
        return new Promise<Response>((resolve, reject) =>
            testObjectValidation(this)
                .then(() => {
                    expect(img_routes.getAll).to.be.an.instanceOf(Function);

                    supertest(this.app)
                        .get('/api/img')
                        .set('X-Access-Token', this.access_token)
                        .set('Accept', 'application/json')
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.body).to.be.an('object');
                                expect(res.body).to.have.property('imgs');
                                expect(res.body.imgs).to.be.an('array');
                                res.body.imgs.map(img =>
                                    expect(removeNullProperties(img)).to.be.jsonSchema(img_schema)
                                );
                            } catch (e) {
                                return reject(e as Chai.AssertionError);
                            }
                            return resolve(res);
                        });
                })
                .catch(reject)
        );
    }
}
