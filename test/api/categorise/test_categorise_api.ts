import { AsyncResultCallback, each, map, waterfall } from 'async';
import { createLogger } from 'bunyan';
import * as path from 'path';
import { basename } from 'path';
import { Server } from 'restify';
import { expect } from 'chai';

import { model_route_to_map } from '@offscale/nodejs-utils';
import { IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';

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
import { TApp } from '@offscale/routes-merger/interfaces';


const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    categorise: all_models_and_routes_as_mr['categorise']
};

process.env['NO_SAMPLE_DATA'] = 'true';

const _rng = [74, 86];
const user_mocks_subset: User[] = user_mocks.successes.slice(..._rng);
const mocks: Categorise[] = categorise_mocks(
    Array(_rng[1] - _rng[0])
        .fill(user_mocks_subset[0]))
    .successes.slice(..._rng);
const tapp_name = `test::${basename(__dirname)}`;
const connection_name = `${tapp_name}::${path.basename(__filename).replace(/\./g, '-')}`;
const logger = createLogger({ name: tapp_name });

describe('Categorise::routes', () => {
    let sdk: CategoriseTestSDK;
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

                    sdk = new CategoriseTestSDK(_app);
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


    describe('/api/categorise', () => {
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
        after((done) =>
            each(mocks,
                (categorise, cb) =>
                    categorise.id == null ?
                        cb(void 0)
                        : sdk
                            .remove(categorise.id)
                            .then(() => cb(void 0))
                            .catch(cb),
                (err) => {
                    if (err != null) return done(err);
                    unregister_all(auth_sdk, user_mocks_subset)
                        .then(() => done(void 0))
                        .catch(done)
                })
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
