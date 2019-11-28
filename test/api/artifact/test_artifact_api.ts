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
import { Artifact } from '../../../api/artifact/models';
import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { closeApp, tearDownConnections, unregister_all } from '../../shared_tests';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { UserTestSDK } from '../user/user_test_sdk';
import { ArtifactTestSDK } from './artifact_test_sdk';
import { artifact_mocks } from './artifact_mocks';


const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    artifact: all_models_and_routes_as_mr['artifact']
};

process.env['NO_SAMPLE_DATA'] = 'true';

const _rng = [62, 74];
const user_mocks_subset: User[] = user_mocks.successes.slice(..._rng);
const mocks: Artifact[] = artifact_mocks.successes.slice(..._rng);
const tapp_name = `test::${basename(__dirname)}`;
const connection_name = `${tapp_name}::${path.basename(__filename).replace(/\./g, '-')}`;
const logger = createLogger({ name: tapp_name });

describe('Artifact::routes', () => {
    let sdk: ArtifactTestSDK;
    let auth_sdk: AuthTestSDK;
    let user_sdk: UserTestSDK;
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

                    sdk = new ArtifactTestSDK(_app);
                    auth_sdk = new AuthTestSDK(_app);
                    user_sdk = new UserTestSDK(_app);

                    return cb(void 0);
                }
            ],
            done
        )
    );

    after(tearDownConnections);
    after(done => closeApp(app)(done));


    describe('/api/artifact', () => {
        before('register_all', done => map(user_mocks_subset, (user, cb) =>
                user_sdk
                    .register(user)
                    .then(res => {
                        user.access_token = res!.header['x-access-token'];

                        sdk.access_token = user.access_token!;

                        return cb(void 0);
                    })
                    .catch(cb),
            done)
        );
        after('Remove all Artifact objects', (done) =>
            each(mocks,
                (artifact, cb) =>
                    artifact.location == null ?
                        cb(void 0)
                        : sdk
                            .remove(artifact.location)
                            .then(() => cb(void 0))
                            .catch(cb),
                done)
        );

        after('unregister all Users', async () =>
            await unregister_all(auth_sdk, user_mocks_subset)
        );

        it('POST should create Artifact object', async () =>
            mocks[0] = (await sdk.post(mocks[0])).body
        );

        it('GET should retrieve Artifact object', async () => {
            mocks[1] = (await sdk.post(mocks[1])).body;
            await sdk.get(mocks[1].location);
        });

        it('PUT should update Artifact object', async () => {
            mocks[2] = (await sdk.post(mocks[2])).body;
            const updated = (await sdk.update(mocks[2].location, { location: 'foobar' })).body;
            expect(mocks[2].location).to.be.not.eql(updated.location);
            ['location', 'updatedAt'].forEach(k => mocks[2][k] = updated[k]);
            expect(mocks[2]).to.deep.eq(updated);
        });

        it('GET /api/artifact should get all Artifact objects', async () =>
            await sdk.getAll()
        );

        it('DELETE should remove Artifact object', async () => {
            mocks[3] = (await sdk.post(mocks[3])).body;
            await sdk.remove(mocks[3].location);
        });
    });
});
