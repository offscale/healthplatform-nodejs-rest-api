import * as faker from 'faker';

import { Artifact } from '../../../api/artifact/models';

export const artifact_mocks: {successes: Artifact[], failures: Array<{}>} = {
    failures: [
        {},
        { email: 'foo@bar.com ' },
        { password: 'foo ' },
        { email: 'foo@bar.com', password: 'foo', bad_prop: true }
    ],
    successes: Array(200)
        .fill(void 0)
        .map(() => {
            const artifact = new Artifact();
            artifact.location = encodeURIComponent(`${faker.internet.url()}/${Math.random().toString().slice(2)}.jpg`);
            artifact.contentType = 'image/jpg';
            return artifact;
        })
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(artifact_mocks.successes);
}
