import { Categorise } from '../../../api/categorise/models';
import { User } from '../../../api/user/models';
import { Artifact } from '../../../api/artifact/models';
export declare const categorise_mocks: (users: User[], artifacts: Artifact[]) => {
    successes: Categorise[];
    failures: Array<{}>;
};
