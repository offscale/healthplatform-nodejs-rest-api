import { Categorise } from '../../../api/categorise/models';
import { User } from '../../../api/user/models';
export declare const categorise_mocks: (users: User[]) => {
    successes: Categorise[];
    failures: Array<{}>;
};
