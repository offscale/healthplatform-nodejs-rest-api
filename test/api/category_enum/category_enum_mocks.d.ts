import { CategoryEnum } from '../../../api/category_enum/models';
import { User } from '../../../api/user/models';

export declare const category_enum_mocks: (users: User[]) => {
    successes: CategoryEnum[];
    failures: Array<{}>;
};
