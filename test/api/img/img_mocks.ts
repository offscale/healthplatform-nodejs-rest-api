import * as faker from 'faker';

import { Img } from '../../../api/img/models';

export const img_mocks: {successes: Img[], failures: Array<{}>} = {
    failures: [
        {},
        { email: 'foo@bar.com ' },
        { password: 'foo ' },
        { email: 'foo@bar.com', password: 'foo', bad_prop: true }
    ],
    successes: Array(200)
        .fill(void 0)
        .map(() => {
            const img = new Img();
            img.location = `${faker.internet.url()}/${Math.random().toString().slice(2)}.jpg`;
            return img;
        })
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(img_mocks.successes);
}
