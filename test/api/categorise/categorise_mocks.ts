import * as faker from 'faker';
import { Categorise } from '../../../api/categorise/models';

export const categorise_mocks: {successes: Categorise[], failures: Array<{}>} = {
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

            categorise.category = faker.name.jobDescriptor();

            return categorise;
        })
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(categorise_mocks.successes);
}
