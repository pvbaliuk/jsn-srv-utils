import {z} from 'zod';
import {connectionSchema} from './connection.schema';

export const redisConnectionSchema = connectionSchema.extend({
    db: z.number().min(0).default(0),
    keyPrefix: z.string().default('')
});
