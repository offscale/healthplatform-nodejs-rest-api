import { Categorise } from '../../../api/categorise/models';
import { User } from '../../../api/user/models';
import { Artifact } from '../../../api/artifact/models';
import { CategoryEnum } from '../../../api/category_enum/models';
export declare const categorise_mocks: (users: User[], artifacts: Artifact[], categoryEnums: CategoryEnum[]) => {
    successes: Categorise[];
    failures: Array<{}>;
};
