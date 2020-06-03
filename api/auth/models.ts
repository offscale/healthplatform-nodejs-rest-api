import { Redis } from 'ioredis';
import { RestError } from 'restify-errors';
import { v4 as uuid_v4 } from 'uuid';

import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { AuthError, GenericError } from '@offscale/custom-restify-errors';

type LogoutArg = {user_id: string; access_token?: never} | {user_id?: never; access_token: AccessTokenType};

let accessToken: AccessToken | undefined;

export class AccessToken {
    constructor(private redis: Redis) {}

    public static reset() {
        accessToken = undefined;
        if (global.hasOwnProperty('accessToken'))
            delete (global as NodeJS.Global & typeof globalThis & {accessToken: AccessToken | undefined})['accessToken'];
    }

    public static get(cursor: Redis): AccessToken {
        if (typeof accessToken === 'undefined' || typeof accessToken.redis === 'undefined')
            accessToken = new AccessToken(cursor);
        return accessToken;
    }

    public findOne(access_token: AccessTokenType): Promise<string> {
        return new Promise<string>((resolve, reject) =>
            this.redis
                .get(access_token)
                .then((user_id: string | null) => {
                    if (user_id == null) return reject(new AuthError('Nothing associated with that access token'));
                    return resolve(user_id);
                })
                .catch(reject)
        );
    }

    public deleteOne(access_token: AccessTokenType): Promise<number> {
        return this.redis.del(access_token);
    }

    public logout(arg: LogoutArg, callback: (err?: Error | RestError) => void) {
        if (arg.user_id)
            // TODO: Rewrite this in Lua [maybe?]
            this.redis
                .smembers(arg.user_id)
                .then((access_tokens: string[]) => {
                    const pipeline = this.redis.pipeline();
                    for (const at of access_tokens)
                        pipeline.del(at);
                    pipeline
                        .exec()
                        .then(() => callback(void 0))
                        .catch(errors =>
                            callback(new GenericError({
                                statusCode: 400,
                                name: 'LogoutErrors',
                                message: JSON.stringify(errors)
                            }))
                        );
                })
                .catch(callback);
        else if (arg.access_token)
            this.redis
                .get(arg.access_token)
                .then((user_id: string | null) =>
                    user_id == null ?
                        callback(new GenericError({
                            statusCode: 410,
                            name: 'AlreadyDone',
                            message: 'User already logged out'
                        }))
                        : this.logout({ user_id }, callback)
                )
                .catch(callback);
        else return callback(new GenericError({
                statusCode: 400,
                name: 'ConstraintError',
                message: 'Can\'t logout without user_id or access token'
            }));
    }

    public add(user_id: string, roles: string, scope: 'access'): Promise<AccessTokenType> {
        return new Promise<AccessTokenType>((resolve, reject) => {
            const new_key: AccessTokenType = `${roles}::${scope}::${uuid_v4()}`;
            this.redis.multi()
                .set(new_key, user_id)
                .sadd(user_id, new_key)
                .exec()
                .then(() => resolve(new_key))
                .catch(reject);
        });
    }
}
