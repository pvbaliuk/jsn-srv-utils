import {z} from 'zod';
import {connectionSchema} from './connection.schema';

export const mysqlConnectionSchema = connectionSchema.extend({
    dbname: z.string().nonempty()
});
