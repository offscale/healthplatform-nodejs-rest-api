import * as faker from 'faker';
import { Categorise } from '../../../api/categorise/models';
import { User } from '../../../api/user/models';
import { user_mocks } from '../user/user_mocks';

export const categorise_mocks: (users: User[]) => {successes: Categorise[], failures: Array<{}>} =
    (users: User[]) => ({
            failures: [
                {},
                { email: 'foo@bar.com ' },
                { password: 'foo ' },
                { email: 'foo@bar.com', password: 'foo', bad_prop: true }
            ],
            successes: Array(200)
                .fill(void 0)
                .map((_, idx) => {
                    const categorise = new Categorise();

                    categorise.id = idx;
                    categorise.username = users[(idx % 3)].email;
                    categorise.category = faker.name.jobDescriptor();

                    return categorise;
                })
        }
    );

if (require.main === module) {
    const user_mocks_subset: User[] = user_mocks.successes.slice(24, 36);
    /* tslint:disable:no-console */
    console.info(categorise_mocks(user_mocks_subset).successes);
}
