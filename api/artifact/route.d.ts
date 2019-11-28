import * as restify from 'restify';
export declare const get: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const update: (app: restify.Server, namespace?: string) => boolean | restify.Route;
export declare const remove: (app: restify.Server, namespace?: string) => boolean | restify.Route;
