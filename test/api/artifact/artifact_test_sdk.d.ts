import { Response } from 'supertest';
import { Server } from 'restify';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Artifact } from '../../../api/artifact/models';

export declare class ArtifactTestSDK {
    app: Server;
    constructor(app: Server);
    private _access_token?;
    get access_token(): AccessTokenType;
    set access_token(new_access_token: AccessTokenType);
    get(artifactLocation: Artifact['location']): Promise<Response>;
    post(artifact: Artifact): Promise<Response>;
    update(artifactLocation: Artifact['location'], artifact: Partial<Artifact>): Promise<Response>;
    remove(artifactLocation: Artifact['location']): Promise<Response>;
    getAll(): Promise<Response>;
}
