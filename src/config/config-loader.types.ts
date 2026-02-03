import {z} from 'zod';

export type ResolvedConfig<
    T extends z.ZodObject,
    P extends object|undefined = undefined
> = z.output<T> & {
    isDev: boolean;
} & (
    P extends undefined
        ? {}
        : P
    );
