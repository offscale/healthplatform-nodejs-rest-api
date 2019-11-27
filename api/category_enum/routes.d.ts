import * as restify from 'restify';
import { JsonSchema } from 'tv4';
export declare const schema: JsonSchema;
export declare const create: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const read: (app: restify.Server, namespace?: string) => boolean | restify.Route;
