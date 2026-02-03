import {z} from 'zod';
import {connectionSchema} from './connection.schema';
import {timeStringSchema} from './timestring.schema';

export const mongodbConnectionSchema = connectionSchema.extend({
    db: z.string().nonempty(),
    authDb: z.string().optional(),
    connectTimeout: timeStringSchema.default(5_000)
}).transform(v => ({
    ...v,
    authDb: v.authDb || v.db,
    dsn: `mongodb://${v.host}:${v.port}/${v.db}`
}));
