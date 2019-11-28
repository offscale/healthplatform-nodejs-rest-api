// tslint:disable-next-line:no-var-requires
import chai = require('chai');
import supertest, { Response } from 'supertest';
import { Server } from 'restify';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { CategoryEnum } from '../../../api/category_enum/models';
import * as category_enum_routes from '../../../api/category_enum/routes';
import * as category_enum_route from '../../../api/category_enum/route';
import { removeNullProperties } from '../../../utils';
import { testObjectValidation } from '../../shared_tests';

/* tslint:disable:no-var-requires */
const category_enum_schema = sanitiseSchema(require('./schema.json'), CategoryEnum._omit);

/* tslint:disable-next-line:no-var-requires */
chai.use(require('chai-json-schema-ajv'));

const expect: Chai.ExpectStatic = chai.expect;

export class CategoryEnumTestSDK {
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

    public get(category_enum_name: CategoryEnum['name']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (category_enum_name == null)
                return reject(new TypeError('`category_enum_name` argument to `get` must be defined'));

            expect(category_enum_route.get).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                        supertest(this.app)
                            .get(`/api/category_enum/${category_enum_name}`)
                            .set('Accept', 'application/json')
                            .set('X-Access-Token', this.access_token)
                            .expect('Content-Type', /json/)
                            .end((err, res: Response) => {
                                if (err != null) reject(supertestGetError(err, res));
                                else if (res.error) return reject(getError(res.error));

                                try {
                                    expect(res.status).to.be.equal(200);
                                    expect(res.body).to.be.an('object');
                                    expect(removeNullProperties(res.body)).to.be.jsonSchema(category_enum_schema);
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

    public post(category_enum: CategoryEnum): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (category_enum == null)
                return reject(new TypeError('`category_enum` argument to `post` must be defined'));

            expect(category_enum_routes.create).to.be.an.instanceOf(Function);
            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .post('/api/category_enum')
                        .send(category_enum)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .expect('Content-Type', /json/)
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));

                            try {
                                expect(res.status).to.be.equal(201);
                                expect(res.body).to.be.an('object');
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(category_enum_schema);
                            } catch (e) {
                                return reject(e as Chai.AssertionError);
                            }

                            return resolve(res);
                        })
                })
                .catch(reject);
        });
    }

    public update(category_enum_name: CategoryEnum['name'], category_enum: Partial<CategoryEnum>): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (category_enum == null)
                return reject(new TypeError('`category_enum` argument to `update` must be defined'));

            expect(category_enum_route.update).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() =>
                    supertest(this.app)
                        .put(`/api/category_enum/${category_enum_name}`)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .send(category_enum)
                        // .expect('Content-Type', /json/)
                        .then((res: Response) => {
                            if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.status).to.be.equal(200);
                                expect(res.body).to.be.an('object');
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(category_enum_schema);
                                Object.keys(category_enum).forEach(k => expect(category_enum[k]).to.be.eql(res.body[k]));
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

    public remove(category_enum_name: CategoryEnum['name']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (category_enum_name == null)
                return reject(new TypeError('`category_enum_name` argument to `update` must be defined'));

            expect(category_enum_route.remove).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .delete(`/api/category_enum/${category_enum_name}`)
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
                    expect(category_enum_routes.getAll).to.be.an.instanceOf(Function);

                    supertest(this.app)
                        .get('/api/category_enum')
                        .set('X-Access-Token', this.access_token)
                        .set('Accept', 'application/json')
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.body).to.be.an('object');
                                expect(res.body).to.have.property('category_enums');
                                expect(res.body.category_enums).to.be.an('array');
                                res.body.category_enums.forEach((category_enum: CategoryEnum) =>
                                    expect(removeNullProperties(category_enum)).to.be.jsonSchema(category_enum_schema)
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
