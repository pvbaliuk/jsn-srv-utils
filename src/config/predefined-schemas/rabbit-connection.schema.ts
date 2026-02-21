import {z} from 'zod';
import {connectionSchema} from './connection.schema';

export const rabbitConnectionSchema = connectionSchema.extend({
    vhost: z.string().default('/')
});
