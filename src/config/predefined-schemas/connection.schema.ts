import {z} from 'zod';

export const connectionSchema = z.object({
    host: z.string().nonempty(),
    port: z.coerce.number().min(1).max(65535),
    user: z.string(),
    pass: z.string()
});
