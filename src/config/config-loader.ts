import {sep} from 'node:path';
import {readFileSync} from 'node:fs';
import {z, ZodError} from 'zod';
import {parse} from 'yaml';
import {ResolvedConfig} from './config-loader.types';
import {getRootPackageDirnameSync} from '../getRootPackageDirname';

const PKG_ROOT_REGEX = /^%pkgroot[\/\\]/i;

export abstract class ConfigLoader {

    /**
     * @template {z.ZodObject} S
     * @template {object} P
     * @param {string} path You can use %pkgroot prefix for automatic project root resolution by AppConfigLoader.
     * Example: %pkgroot/config.yml
     * @param {S} schema
     * @param {P} addProps
     * @returns {ResolvedConfig<S>}
     */
    public static loadAndValidate<
        S extends z.ZodObject,
        P extends object|undefined = undefined
    >(path: string, schema: S, addProps?: P): ResolvedConfig<S, P>{
        if(PKG_ROOT_REGEX.test(path))
            path = path.replace(PKG_ROOT_REGEX, getRootPackageDirnameSync() + sep);

        let data: string = undefined!;
        let parsedYaml: any = undefined!;

        try{
            data = readFileSync(path, 'utf-8');
        }catch(e){
            console.error(`Failed to read config file at path: ${path}\nError: ${e?.message ?? '-'}; syscall: ${e?.syscall ?? '-'}`);
            process.exit(1);
        }

        try{
            parsedYaml = parse(data, {prettyErrors: true});
        }catch(e){
            console.error(`Failed to parse YAML file at path: ${path}\nError: ${e?.message ?? '-'}`);
            process.exit(1);
        }

        const extendedSchema = schema.transform(v => ({
            isDev: (
                process?.env?.APP_CONTEXT
                ?? process?.env?.APPLICATION_CONTEXT
                ?? process?.env?.NODE_ENV
                ?? ''
            ).toLowerCase() !== 'production',
            ...v
        }));

        const {data: config, error, success} = extendedSchema.safeParse(parsedYaml);
        if(!success){
            if(error && error instanceof ZodError){
                console.error(`Failed to validate config file at path ${path}. Error: ${z.prettifyError(error)}`);
                process.exit(1);
            }

            console.error(`Failed to parse config file at path ${path}`);
            process.exit(1);
        }

        return {
            ...config,
            ...(addProps ? {} : addProps)
        } as ResolvedConfig<S, P>;
    }

}
