// tslint:disable-next-line:no-var-requires
import chai = require('chai');
import supertest, { Response } from 'supertest';
import { Server } from 'restify';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { Artifact } from '../../../api/artifact/models';
import * as artifact_routes from '../../../api/artifact/routes';
import * as artifact_route from '../../../api/artifact/route';
import { removeNullProperties } from '../../../utils';
import { testObjectValidation } from '../../shared_tests';

/* tslint:disable:no-var-requires */
const artifact_schema = sanitiseSchema(require('./schema.json'), Artifact._omit);

/* tslint:disable-next-line:no-var-requires */
chai.use(require('chai-json-schema-ajv'));

const expect: Chai.ExpectStatic = chai.expect;

export class ArtifactTestSDK {
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

    public get(artifact_location: Artifact['location']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (artifact_location == null)
                return reject(new TypeError('`artifact_location` argument to `get` must be defined'));

            expect(artifact_route.get).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                        supertest(this.app)
                            .get(`/api/artifact/${artifact_location}`)
                            .set('Accept', 'application/json')
                            .set('X-Access-Token', this.access_token)
                            .expect('Content-Type', /json/)
                            .end((err, res: Response) => {
                                if (err != null) reject(supertestGetError(err, res));
                                else if (res.error) return reject(getError(res.error));

                                try {
                                    expect(res.status).to.be.equal(200);
                                    expect(res.body).to.be.an('object');
                                    expect(removeNullProperties(res.body)).to.be.jsonSchema(artifact_schema);
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

    public post(artifact: Artifact): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (artifact == null)
                return reject(new TypeError('`artifact` argument to `post` must be defined'));

            expect(artifact_routes.create).to.be.an.instanceOf(Function);
            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .post('/api/artifact')
                        .send(artifact)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .expect('Content-Type', /json/)
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));

                            try {
                                expect(res.status).to.be.equal(201);
                                expect(res.body).to.be.an('object');
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(artifact_schema);
                            } catch (e) {
                                return reject(e as Chai.AssertionError);
                            }

                            return resolve(res);
                        })
                })
                .catch(reject);
        });
    }

    public update(artifact_location: Artifact['location'], artifact: Partial<Artifact>): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (artifact == null)
                return reject(new TypeError('`artifact` argument to `update` must be defined'));

            expect(artifact_route.update).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() =>
                    supertest(this.app)
                        .put(`/api/artifact/${artifact_location}`)
                        .set('Accept', 'application/json')
                        .set('X-Access-Token', this.access_token)
                        .send(artifact)
                        // .expect('Content-Type', /json/)
                        .then((res: Response) => {
                            if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.status).to.be.equal(200);
                                expect(res.body).to.be.an('object');
                                expect(removeNullProperties(res.body)).to.be.jsonSchema(artifact_schema);
                                Object.keys(artifact).forEach(k => expect(artifact[k]).to.be.eql(res.body[k]));
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

    public remove(artifact_location: Artifact['location']): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (artifact_location == null)
                return reject(new TypeError('`artifact_location` argument to `update` must be defined'));

            expect(artifact_route.remove).to.be.an.instanceOf(Function);

            testObjectValidation(this)
                .then(() => {
                    supertest(this.app)
                        .delete(`/api/artifact/${artifact_location}`)
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
                    expect(artifact_routes.getAll).to.be.an.instanceOf(Function);

                    supertest(this.app)
                        .get('/api/artifact')
                        .set('X-Access-Token', this.access_token)
                        .set('Accept', 'application/json')
                        .end((err, res: Response) => {
                            if (err != null) return reject(supertestGetError(err, res));
                            else if (res.error) return reject(getError(res.error));
                            try {
                                expect(res.body).to.be.an('object');
                                expect(res.body).to.have.property('artifacts');
                                expect(res.body.artifacts).to.be.an('array');
                                res.body.artifacts.forEach((artifact: Artifact) =>
                                    expect(removeNullProperties(artifact)).to.be.jsonSchema(artifact_schema)
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
