import { faker } from '@faker-js/faker';
import { CategoryEnum } from '../../../api/category_enum/models';
import { User } from '../../../api/user/models';
import { user_mocks } from '../user/user_mocks';

export const category_enum_mocks: (users: User[]) => {successes: CategoryEnum[], failures: Array<{}>} =
    (users: User[]) => ({
            failures: [
                {},
                { email: 'foo@bar.com ' },
                { password: 'foo ' },
                { email: 'foo@bar.com', password: 'foo', bad_prop: true }
            ],
            successes: Array(200)
                .fill(void 0)
                .map(() => {
                    const category_enum = new CategoryEnum();
                    category_enum.name = [faker.commerce.department(), Math.random().toString()].join('_');
                    category_enum.enumeration = [
                        faker.name.jobDescriptor(),
                        faker.name.jobDescriptor(),
                        faker.name.jobDescriptor()
                    ];
                    return category_enum;
                })
        }
    );

if (require.main === module) {
    const user_mocks_subset: User[] = user_mocks.successes.slice(24, 36);
    /* tslint:disable:no-console */
    console.info(category_enum_mocks(user_mocks_subset).successes);
}
