// tslint:disable-next-line:no-var-requires
import chai = require('chai');
import supertest, { Response } from 'supertest';
import { Server } from 'restify';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { Categorise } from '../../../api/categorise/models';
import * as categorise_routes from '../../../api/categorise/routes';
import * as categorise_route from '../../../api/categorise/route';
import { removeNullProperties } from '../../../utils';
import { testObjectValidation } from '../../shared_tests';
import { Artifact } from '../../../api/artifact/models';

/* tslint:disable:no-var-requires */
const categorise_schema = sanitiseSchema(require('./../categorise/schema.json'), Categorise._omit);

/* tslint:disable-next-line:no-var-requires */
chai.use(require('chai-json-schema-ajv'));

const expect: Chai.ExpectStatic = chai.expect;

const removeArtifact = (categorise: {[key: string]: any} /*& {artifact: Artifact}*/): typeof categorise =>
    categorise.hasOwnProperty('artifact') &&
    delete (categorise as unknown as Categorise & {artifact?: Artifact}).artifact &&
    categorise ||
    categorise;

export class CategoriseTestSDK {
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

    private static parseOutArtifactLocation(res: supertest.Response) {
        res.body.artifactLocation = (res.body.artifactLocation as Artifact).location;
    }

    public get(categorise_id: Categorise['id']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (categorise_id == null)
                return reject(new TypeError('`categorise_id` argument to `get` must be defined'));

            expect(categorise_route.get).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                        supertest(this.app)
                            .get(`/api/categorise/${categorise_id}`)
                            .set('Accept', 'application/json')
                            .set('X-Access-Token', this.access_token)
                            .expect('Content-Type', /json/)
                            .end((err, res: Response) => {
                                if (err != null) reject(supertestGetError(err, res));
                                else if (res.error) return reject(getError(res.error));

                                try {
                                    expect(res.status).to.be.equal(200);
                                    expect(res.body).to.be.an('object');
                                    CategoriseTestSDK.parseOutArtifactLocation(res);
                                    expect(removeArtifact(removeNullProperties(res.body))).to.be.jsonSchema(categorise_schema);
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

    public post(categorise: Categorise): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (categorise == null)
                return reject(new TypeError('`categorise` argument to `post` must be defined'));

            expect(categorise_routes.create).to.be.an.instanceOf(Function);
            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .post('/api/categorise')
                        .send(categorise)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .expect('Content-Type', /json/)
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));

                            try {
                                expect(res.status).to.be.equal(201);
                                expect(res.body).to.be.an('object');
                                CategoriseTestSDK.parseOutArtifactLocation(res);
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(categorise_schema);
                            } catch (e) {
                                return reject(e as Chai.AssertionError);
                            }

                            return resolve(res);
                        })
                })
                .catch(reject);
        });
    }

    public update(categorise_id: Categorise['id'], categorise: Partial<Categorise>): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (categorise == null)
                return reject(new TypeError('`categorise` argument to `update` must be defined'));

            expect(categorise_route.update).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() =>
                    supertest(this.app)
                        .put(`/api/categorise/${categorise_id}`)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .send(categorise)
                        // .expect('Content-Type', /json/)
                        .then((res: Response) => {
                            if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.status).to.be.equal(200);
                                expect(res.body).to.be.an('object');
                                CategoriseTestSDK.parseOutArtifactLocation(res);
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(categorise_schema);
                                Object.keys(categorise).forEach(k => expect(categorise[k]).to.be.eql(res.body[k]));
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

    public remove(categorise_id: Categorise['id']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (categorise_id == null)
                return reject(new TypeError('`categorise_id` argument to `update` must be defined'));

            expect(categorise_route.remove).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .delete(`/api/categorise/${categorise_id}`)
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
                    expect(categorise_routes.getAll).to.be.an.instanceOf(Function);

                    supertest(this.app)
                        .get('/api/categorise')
                        .set('X-Access-Token', this.access_token)
                        .set('Accept', 'application/json')
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.body).to.be.an('object');
                                expect(res.body).to.have.property('categorises');
                                expect(res.body.categorises).to.be.an('array');
                                res.body.categorises.map((categorise: Categorise) =>
                                    expect(removeNullProperties(categorise)).to.be.jsonSchema(categorise_schema)
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
