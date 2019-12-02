import { AsyncResultCallback, each, map, waterfall } from 'async';
import { createLogger } from 'bunyan';
import * as path from 'path';
import { basename } from 'path';
import { Server } from 'restify';
import { expect } from 'chai';

import { model_route_to_map } from '@offscale/nodejs-utils';
import { IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';
import { TApp } from '@offscale/routes-merger/interfaces';

import { _orms_out } from '../../../config';
import { User } from '../../../api/user/models';
import { AccessToken } from '../../../api/auth/models';
import { Categorise } from '../../../api/categorise/models';
import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { closeApp, tearDownConnections, unregister_all } from '../../shared_tests';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { UserTestSDK } from '../user/user_test_sdk';
import { CategoriseTestSDK } from './categorise_test_sdk';
import { categorise_mocks } from './categorise_mocks';
import { artifact_mocks } from '../artifact/artifact_mocks';
import { ArtifactTestSDK } from '../artifact/artifact_test_sdk';
import { Artifact } from '../../../api/artifact/models';


const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    artifact: all_models_and_routes_as_mr['artifact'],
    categorise: all_models_and_routes_as_mr['categorise']
};

process.env['NO_SAMPLE_DATA'] = 'true';

const _rng = [74, 86];
const user_mocks_subset: User[] = user_mocks.successes.slice(..._rng);
const one_user_many: User[] = Array(user_mocks_subset.length).fill(user_mocks_subset[0]);
const artifact_mocks_subset: Artifact[] = artifact_mocks.successes.slice(..._rng);
const mocks: Categorise[] = categorise_mocks(one_user_many, artifact_mocks_subset).successes;

const tapp_name = `test::${basename(__dirname)}`;
const connection_name = `${tapp_name}::${path.basename(__filename).replace(/\./g, '-')}`;
const logger = createLogger({ name: tapp_name });

describe('Categorise::routes', () => {
    let sdk: CategoriseTestSDK;
    let auth_sdk: AuthTestSDK;
    let user_sdk: UserTestSDK;
    let artifact_sdk: ArtifactTestSDK;
    let app: Server;

    before(done =>
        waterfall([
                tearDownConnections,
                (cb: AsyncResultCallback<void>) => typeof AccessToken.reset() === 'undefined' && cb(void 0),
                (cb: (error: Error, _app?: TApp, orms_out?: IOrmsOut) => void) =>
                    setupOrmApp(model_route_to_map(models_and_routes), { connection_name, logger },
                        { skip_start_app: true, app_name: tapp_name, logger },
                        cb
                    ),
                (_app: Server, orms_out: IOrmsOut, cb: AsyncResultCallback<void>) => {
                    app = _app;
                    _orms_out.orms_out = orms_out;

                    sdk = new CategoriseTestSDK(_app);
                    auth_sdk = new AuthTestSDK(_app);
                    user_sdk = new UserTestSDK(_app);
                    artifact_sdk = new ArtifactTestSDK(_app);

                    return cb(void 0);
                }
            ],
            done
        )
    );

    after(tearDownConnections);
    after(done => closeApp(app)(done));


    describe('/api/categorise', () => {
        before('register_all', done => map(user_mocks_subset, (user, cb) =>
                user_sdk
                    .register(user)
                    .then(res => {
                        user.access_token = res!.header['x-access-token'];

                        sdk.access_token = artifact_sdk.access_token = user.access_token!;

                        return cb(void 0);
                    })
                    .catch(cb),
            done)
        );

        before('create all Artifact objects', (done: Mocha.Done) => each(
            Object.keys(artifact_mocks_subset).map(i => +i), (idx, cb) =>
                artifact_sdk
                    .post(artifact_mocks_subset[idx])
                    .then(created_artifact_response => {
                        artifact_mocks_subset[idx] = mocks[
                            idx].artifactLocation = created_artifact_response.body.location;
                        return cb(void 0);
                    })
                    .catch(cb),
            done)
        );

        after('remove all Categorise objects', (done) =>
            each(mocks,
                (categorise, cb) =>
                    categorise.id == null ?
                        cb(void 0)
                        : sdk
                            .remove(categorise.id)
                            .then(() => cb(void 0))
                            .catch(cb),
                done));

        after('remove all Artifact objects', (done) =>
            each(artifact_mocks_subset,
                (artifact, cb) =>
                    artifact.createdAt == null ?
                        cb(void 0)
                        : artifact_sdk
                            .remove(artifact.location)
                            .then(() => cb(void 0))
                            .catch(cb),
                done));

        after('unregister all Users', async () =>
            await unregister_all(auth_sdk, user_mocks_subset)
        );

        it('POST should create Categorise object', async () =>
            mocks[0] = (await sdk.post(mocks[0])).body
        );

        it('GET should retrieve Categorise object', async () => {
            mocks[1] = (await sdk.post(mocks[1])).body;
            await sdk.get(mocks[1].id);
        });

        it('PUT should update Categorise object', async () => {
            const created = (await sdk.post(mocks[2])).body;
            const updated = (await sdk.update(created.id, { category: 'Sir' })).body;
            mocks[2] = (await sdk.get(updated.id)).body;
            expect(created.category).to.be.not.eql(updated.category);
            expect(created.id).to.be.eql(updated.id);
            ['category', 'updatedAt'].forEach(k => created[k] = mocks[2][k]);
            expect(created).to.deep.eq(mocks[2]);
        });

        it('GET /api/categorise should get all Categorise objects', async () =>
            await sdk.getAll()
        );

        it('DELETE should remove Categorise object', async () => {
            mocks[3] = (await sdk.post(mocks[3])).body;
            await sdk.remove(mocks[3].id);
        });
    });
});
