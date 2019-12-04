import { Request } from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Artifact } from './models';
import { JsonSchema } from 'tv4';
import { IUserReq } from '../shared_interfaces';

export declare const schema: JsonSchema;
export declare type ArtifactBodyReq = Request & IOrmReq & {
    body?: Artifact;
    user_id?: string;
};
export declare const createArtifact: (req: ArtifactBodyReq) => Promise<Artifact>;
export declare const getArtifact: (req: (Request & IOrmReq)) => Promise<Artifact>;
export declare const getManyArtifact: (req: Request & IOrmReq) => Promise<Artifact[]>;
export declare const getNextArtifactByCategory: (req: Request & IOrmReq) => Promise<Artifact[]>;
export declare const updateArtifact: (req: ArtifactBodyReq) => Promise<Artifact>;
export declare const removeArtifact: (req: Request & IOrmReq & IUserReq) => Promise<void>;
