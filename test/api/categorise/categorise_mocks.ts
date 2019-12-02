import * as faker from 'faker';

import { Categorise } from '../../../api/categorise/models';
import { User } from '../../../api/user/models';
import { Artifact } from '../../../api/artifact/models';
import { user_mocks } from '../user/user_mocks';
import { artifact_mocks } from '../artifact/artifact_mocks';


export const categorise_mocks: (users: User[],
                                artifacts: Artifact[]) => {successes: Categorise[], failures: Array<{}>} =
    (users: User[], artifacts: Artifact[]) => ({
            failures: [
                {},
                { email: 'foo@bar.com ' },
                { password: 'foo ' },
                { email: 'foo@bar.com', password: 'foo', bad_prop: true }
            ],
            successes: Array(users.length)
                .fill(void 0)
                .map((_, idx) => {
                    const categorise = new Categorise();

                    categorise.category = `${faker.name.jobDescriptor()}_${Math.random()}`;
                    categorise.username = users[idx].email;
                    categorise.artifactLocation = artifacts[idx].location;

                    return categorise;
                })
        }
    );

if (require.main === module) {
    const _rng = [24, 36];
    /* tslint:disable:no-console */
    console.info(
        categorise_mocks(user_mocks.successes, artifact_mocks.successes)
            .successes.slice(..._rng)
    );
}
