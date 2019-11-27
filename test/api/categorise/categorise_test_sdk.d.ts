import { Response } from 'supertest';
import { Server } from 'restify';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Categorise } from '../../../api/categorise/models';
export declare class CategoriseTestSDK {
    app: Server;
    access_token?: AccessTokenType;
    constructor(app: Server);
    get(categorise_id: Categorise['id']): Promise<Response>;
    post(categorise: Categorise): Promise<Response>;
    update(categorise_id: Categorise['id'], categorise: Partial<Categorise>): Promise<Response>;
    remove(categorise: Categorise): Promise<Response>;
    get_all(): Promise<Response>;
}
