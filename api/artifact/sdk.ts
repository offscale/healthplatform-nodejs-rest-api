import { Request } from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { Artifact } from './models';
import { JsonSchema } from 'tv4';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';

/* tslint:disable:no-var-requires */
export const schema: JsonSchema = require('../../test/api/artifact/schema');

export type ArtifactBodyReq = Request & IOrmReq & {body?: Artifact, user_id?: string};

const handleArtifact = (resolve: (artifact: Artifact) => void,
                        reject: (error: Error) => void) => (artifact?: Artifact) =>
    artifact == null ?
        reject(new NotFoundError('Artifact'))
        : resolve(artifact);

export const createArtifact = (req: ArtifactBodyReq) => new Promise<Artifact>((resolve, reject) => {
    if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    const artifact = new Artifact();
    Object
        .keys(req.body)
        // @ts-ignore
        .forEach(k => artifact[k] = req.body[k]);

    req.getOrm().typeorm!.connection
        .createQueryBuilder()
        .insert()
        .into(Artifact)
        .values([artifact])
        .execute()
        .then(() => {
            req.params.location = artifact.location;
            return getArtifact(req)
                .then(resolve)
                .catch(reject);
        })
        .catch(e => reject(fmtError(e)));
});

export const getArtifact: (req: (Request & IOrmReq)) => Promise<Artifact> = (req: Request & IOrmReq) =>
    new Promise<Artifact>((resolve, reject) =>
        req.params.location == null ?
            reject(new NotFoundError('req.params.location'))
            : console.info(req.params.attempts, 'req.params.location:', req.params.location, ';') as any || req.getOrm().typeorm!.connection
            .getRepository(Artifact)
            .findOne({ where: { location: req.params.location } })
            .then((artifact?: Artifact) => {
                if (artifact == null) {
                    req.params.location = encodeURIComponent(req.params.location);
                    if (req.params.hasOwnProperty('attempts')) {
                        req.params.attempts++;
                        if (req.params.attempts > 1)
                            return reject(new NotFoundError('Artifact'));
                    } else
                        req.params.attempts = 0;

                    console.info('req.params.attempts:', req.params.attempts, ';');

                    return getArtifact(req)
                        .then((_artifact?: Artifact) => _artifact == null ?
                            reject(new NotFoundError('Artifact'))
                            : resolve(_artifact))
                        .catch(reject);
                }
                return resolve(artifact);
            })
            .catch(e => reject(fmtError(e)))
    );

export const getManyArtifact = (req: Request & IOrmReq) => new Promise<Artifact[]>((resolve, reject) =>
    req.getOrm().typeorm!.connection
        .getRepository(Artifact)
        .find({
            order: {
                updatedAt: 'ASC'
            }
        })
        .then((artifacts?: Artifact[]) =>
            resolve(artifacts == null ? [] : artifacts)
        )
        .catch(e => reject(fmtError(e)))
);

export const getUnCategorisedArtifacts = (req: Request & IOrmReq) => new Promise<Artifact[]>((resolve, reject) =>
    req.getOrm().typeorm!.connection
        .getRepository(Artifact)
        .query(`SELECT *
                      FROM artifact_tbl artifact
                      WHERE artifact.location NOT IN (
                              SELECT categorise."artifactLocation"
                              FROM categorise_tbl categorise
                      )`)
        .then((result?: Artifact[]) => {
            if (result == null) return resolve([]);
            const parsed_result: Artifact[] = result.map(r => {
                const artifact = new Artifact();
                Object
                    .keys(r)
                    // @ts-ignore
                    .forEach(k => artifact[k] = r[k]);
                return artifact;
            });
            console.info('getUnCategorisedArtifacts:', parsed_result, ';');
            return resolve(parsed_result);
        })
        .catch(e => reject(fmtError(e)))
);

export const upsertArtifact = (req: ArtifactBodyReq) => new Promise<Artifact>((resolve, reject) => {
    const ArtifactR = req.getOrm().typeorm!.connection
        .getRepository(Artifact);

    if (req.params.location == null)
        return reject(new NotFoundError('req.params.location'));
    else if (req.body == null)
        return reject(new NotFoundError('req.body == null'));

    ArtifactR.findOne({ where: { location: req.params.location } })
        .then((artifact?: Artifact) => {
            if (artifact == null) return createArtifact(req);
            Object
                .keys(artifact)
                .filter(o => artifact[o] != null)
                // @ts-ignore
                .forEach(k => req.body[k] = artifact[k]);

            ArtifactR
                .createQueryBuilder()
                .update(Artifact)
                .set(req.body)
                .where('location = :location', { location: req.params.location })
                .execute()
                .then(() => getArtifact(req))
                .catch(e => reject(fmtError(e)));
        })
        .catch(e => reject(fmtError(e)));
});

export const removeArtifact = (req: Request & IOrmReq & {user_id?: string}) => new Promise<void>((resolve, reject) => {
    const ArtifactR = req.getOrm().typeorm!.connection
        .getRepository(Artifact);

    if (req.params.location == null)
        return reject(new NotFoundError('req.params.location'));

    ArtifactR
        .findOne({ where: { location: req.params.location } })
        .then((artifact?: Artifact) => {
            if (artifact == null) {
                return resolve(void 0);
                // TODO: Add an `else if` here to only allow removed if admin
            } else
                req.getOrm().typeorm!.connection
                    .createQueryBuilder()
                    .delete()
                    .from(Artifact)
                    .where('location = :location', { location: req.params.location })
                    .execute()
                    .then(() => resolve(void 0))
                    .catch(e => reject(fmtError(e)));
        })
        .catch(e => reject(fmtError(e)));
});
