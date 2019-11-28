import { InsertResult } from 'typeorm';
export declare const nullArrayPropertyToNull: (obj: {
    [key: string]: any;
}) => {
    [key: string]: any;
};
export declare const removeNullProperties: (obj: {
    [key: string]: any;
}) => {
    [key: string]: any;
};
export declare const emptyTypeOrmResponse: (obj: Partial<InsertResult>) => boolean;
export declare const removePropsFromObj: (obj: {
    [key: string]: any;
}, props: string[]) => {
    [key: string]: any;
};
