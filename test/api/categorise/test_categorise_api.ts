import { map, waterfall } from 'async';
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


const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    categorise: all_models_and_routes_as_mr['categorise']
};

process.env['NO_SAMPLE_DATA'] = 'true';

const user_mocks_subset: User[] = user_mocks.successes.slice(24, 36);
const mocks: Categorise[] = categorise_mocks.successes.slice(24, 36);
const tapp_name = `test::${basename(__dirname)}`;
const connection_name = `${tapp_name}::${path.basename(__filename).replace(/\./g, '-')}`;
const logger = createLogger({ name: tapp_name });

describe('Categorise::routes', () => {
    let sdk: CategoriseTestSDK;
    let auth_sdk: AuthTestSDK;
    let user_sdk: UserTestSDK;
    let app: Server;

    before(done =>
        console.info('waterfall') as any || waterfall([
            tearDownConnections,
            cb => typeof AccessToken.reset() === 'undefined' && cb(void 0),
            cb => {
                console.info('Before `setupOrmApp`');
                return cb(void 0);
            },
            cb => setupOrmApp(model_route_to_map(models_and_routes), { logger, connection_name },
                { skip_start_app: true, app_name: tapp_name, logger },
                cb
            ),
            (_app: Server, orms_out: IOrmsOut, cb) => {
                console.info('(_app: Server, orms_out: IOrmsOut, cb)');
                app = _app;
                _orms_out.orms_out = orms_out;

                console.info('set orms');

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
            console.info('register_all inner') as any || user_sdk.register(user)
                .then(res => {
                    user.access_token = res!.header['x-access-token'];

                    console.info('Preparing to set ac');

                    sdk.access_token = user.access_token;

                    return cb(void 0);
                })
                .catch(cb),
            done)
        );
        after(async () => {
            for (const categorise of mocks)
                try {
                    await sdk.remove(categorise);
                } catch {
                    // ignore
                }
            await unregister_all(auth_sdk, user_mocks_subset)
        });

        it('POST should create Categorise object', async () =>
            await sdk.post(mocks[0])
        );

        it('GET should retrieve Categorise object', async () => {
            mocks[1] = (await sdk.post(mocks[1])).body;
            await sdk.get(mocks[1].id);
        });

        it('PUT should update Categorise object', async () => {
            const create_response = await sdk.post(mocks[2]);
            const response = await sdk.update(create_response.body.id, { category: 'Sir' });
            mocks[2] = (await sdk.get(response.body.id)).body;
            expect(create_response.body.category).to.be.not.eql(response.body.category);
            expect(create_response.body.id).to.be.eql(response.body.id);
            expect(create_response.body).to.deep.eq(mocks[2]);
        });

        it('GET /api/categorise should get all Categorise objects', async () =>
            await sdk.get_all()
        );

        it('DELETE should remove Categorise object', async () => {
            mocks[3] = (await sdk.post(mocks[3])).body;
            await sdk.remove(mocks[3]);
        });
    });
});
