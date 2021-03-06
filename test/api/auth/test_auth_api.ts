import { AsyncResultCallback, waterfall } from 'async';
import { createLogger } from 'bunyan';
import * as path from 'path';
import { basename } from 'path';
import { Server } from 'restify';

import { model_route_to_map } from '@offscale/nodejs-utils';
import { IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';

import { AccessToken } from '../../../api/auth/models';
import { User } from '../../../api/user/models';
import { _orms_out } from '../../../config';
import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { user_mocks } from '../user/user_mocks';
import { closeApp, tearDownConnections, unregister_all } from '../../shared_tests';
import { AuthTestSDK } from './auth_test_sdk';
import { TApp } from '@offscale/routes-merger/interfaces';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth']
};

process.env['NO_SAMPLE_DATA'] = 'true';

const _rng = [0, 12];
const mocks: User[] = user_mocks.successes.slice(..._rng);

const tapp_name = `test::${basename(__dirname)}`;
const connection_name = `${tapp_name}::${path.basename(__filename).replace(/\./g, '-')}`;

const logger = createLogger({ name: tapp_name });

describe('Auth::routes', () => {
    let sdk: AuthTestSDK;

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
                    _orms_out.orms_out = orms_out;

                    sdk = new AuthTestSDK(_app);

                    return cb(void 0);
                },
            ], done
        )
    );

    after('unregister all Users', async () =>
        await unregister_all(sdk, mocks)
    );

    after('tearDownConnections', tearDownConnections);
    after('closeApp', done => closeApp(sdk!.app)(done));

    describe('/api/auth', () => {
        before(async () => await unregister_all(sdk, mocks));
        after(async () => await unregister_all(sdk, mocks));

        it('POST should login user', async () => await sdk.register_login(mocks[1]));

        it('DELETE should logout user', async () => {
            const user_mock = mocks[2];
            await sdk.register_login(user_mock);
            await sdk.unregister_all([user_mock]);
        });
    });
});
