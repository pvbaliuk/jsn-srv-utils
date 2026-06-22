import {dirname, resolve, sep} from 'node:path';
import {readFileSync} from 'node:fs';
import {z, ZodError} from 'zod';
import {parse} from 'yaml';
import {type ErrorResult} from '@jsnw/common-utils';
import {ResolvedConfig} from './config-loader.types';
import {fileExistsSync} from '../file-exists';
import {getRootPackageDirnameSync} from '../getRootPackageDirname';

const PKG_ROOT_REGEX = /^%pkgroot(?:[\/\\]|$)/i;
const ENV_VAR_REGEX = /^%env:(?<var_name>[A-Za-z0-9_]+)(?:[\/\\]|$)/i;

export class ConfigLoader {

    private static _instance: ConfigLoader;

    /**
     * @returns {ConfigLoader}
     */
    public static instance(): ConfigLoader{
        if(!ConfigLoader._instance)
            ConfigLoader._instance = new ConfigLoader();

        return ConfigLoader._instance;
    }

    /**
     * @template {z.ZodObject} S
     * @template {object} P
     * @param {string} path You can use %pkgroot prefix for automatic project root resolution by AppConfigLoader.
     * Also, you can use %env:ENV_VARIABLE to resolve config path based on environment variable
     * Example 1: %pkgroot/config.yml
     * Example 2: %env:CONFIG_PATH/config.yml
     * @param {S} schema
     * @param {P} [addProps]
     * @returns {ResolvedConfig<S, P>}
     */
    public static loadConfig<
        S extends z.ZodObject,
        P extends object|undefined = undefined
    >(path: string, schema: S, addProps?: P): ResolvedConfig<S, P>{
        const loader = ConfigLoader.instance();
        const [yaml, loadError] = loader.loadYamlFile(path);
        if(loadError){
            console.error(loadError.message);
            process.exit(1);
        }

        const [processedYaml, directiveErrors] = loader.processDirectives(dirname(loader.resolveFilePath(path)), yaml);
        if(directiveErrors && directiveErrors.length > 0){
            for(const err of directiveErrors)
                console.error(`directive error: ${err.message}`);

            process.exit(1);
        }

        const [validatedYaml, validateError] = loader.validateYaml(processedYaml, schema);
        if(validateError){
            console.error(validateError.message);
            process.exit(1);
        }

        //@ts-expect-error
        validatedYaml['isDev'] = (
            process?.env?.APP_CONTEXT
            ?? process?.env?.APPLICATION_CONTEXT
            ?? process?.env?.NODE_ENV
            ?? ''
        ).toLowerCase() !== 'production';

        return {
            ...validatedYaml,
            ...(addProps ?? {})
        } as ResolvedConfig<S, P>;
    }

    private constructor() {}

    /**
     * @param {string} path
     * @returns {ErrorResult<any, Error>}
     * @protected
     */
    protected loadYamlFile(path: string): ErrorResult<any, Error>{
        path = this.resolveFilePath(path);
        if(!fileExistsSync(path))
            return [null, new Error(`YAML file does not exists at path: ${path}`)];

        let data: string = undefined!,
            parsedYml: any = undefined!;

        try{
            data = readFileSync(path, 'utf-8');
        }catch(e){
            return [null, new Error(`Failed to read config file at path: ${path}`)];
        }

        try{
            parsedYml = parse(data, {prettyErrors: true});
        }catch(e){
            return [null, new Error(`Failed to parse YAML file at path: ${path}`)];
        }

        return [parsedYml, null];
    }

    /**
     * @template {z.ZodTypeAny} T
     * @param data
     * @param {T} schema
     * @returns {ErrorResult<output<T>, Error>}
     * @protected
     */
    protected validateYaml<T extends z.ZodTypeAny>(data: any, schema: T): ErrorResult<z.infer<T>, Error>{
        const {data: parsed, error, success} = schema.safeParse(data);
        if(!success){
            if(error && error instanceof ZodError)
                return [null, new Error(`Failed to validate yaml (#1). Error message: ${z.prettifyError(error)}`)];

            return [null, new Error(`Failed to validate yaml (#2)`)];
        }

        return [parsed, null];
    }

    /**
     * @param {string} mainYamlDirname
     * @param yaml
     * @returns {ErrorResult<any, Error[]>}
     * @protected
     */
    protected processDirectives(mainYamlDirname: string, yaml: any): ErrorResult<any, Error[]>{
        if(typeof yaml !== 'object')
            return yaml;

        const nodesToVisit: any[] = [yaml],
            errors: Error[] = [];

        for(let i = 0; i < nodesToVisit.length; i++){
            const node = nodesToVisit[i];
            if(typeof node !== 'object' || Array.isArray(node))
                continue;

            const nodeFields = Object.keys(node);
            for(const field of nodeFields){
                if(field === '$include'){
                    const $includePaths: string[] = [];
                    if(typeof node['$include'] === 'string'){
                        $includePaths.push(node['$include']);
                    }else if(Array.isArray(node['$include'])){
                        $includePaths.push(...(
                            node['$include']
                                .filter(v =>
                                    v && typeof v === 'string' && v.trim() !== ''
                                )
                        ));
                    }

                    delete node['$include'];

                    for(const path of $includePaths){
                        const [loadedYaml, loadError] = this.loadYamlFile(this.resolveIncludePath(mainYamlDirname, path));
                        if(loadError) {
                            errors.push(loadError)
                        }else{
                            for(const [k, v] of Object.entries(loadedYaml))
                                node[k] = v;
                        }
                    }
                }else{
                    if(typeof node[field] === 'string' && /^\s*\$[A-Z0-9_]+$/.test(node[field]))
                        node[field] = process.env?.[node[field].trim().slice(1)] ?? '';
                }
            }

            for(const k of Object.keys(node)){
                if(Object.hasOwn(node, k) && typeof node[k] === 'object' && !Array.isArray(node[k]))
                    nodesToVisit.push(node[k]);
            }
        }

        return [yaml, errors];
    }

    //region Utils

    private resolveFilePath(path: string): string{
        const initialPath = path;
        while(ENV_VAR_REGEX.test(path)){
            const m = path.match(ENV_VAR_REGEX);
            if(m.groups?.['var_name']){
                if(process.env?.[m.groups['var_name']]){
                    path = path.replace(ENV_VAR_REGEX, process.env[m.groups['var_name']].replace(/[\/\\]+$/, '') + sep);
                }else{
                    throw new Error(`Failed to resolve path: "${initialPath}"`);
                }
            }
        }

        if(PKG_ROOT_REGEX.test(path))
            path = path.replace(PKG_ROOT_REGEX, getRootPackageDirnameSync() + sep);

        return resolve(path);
    }

    /**
     * @param {string} fromDirname
     * @param {string} toPath
     * @returns {string}
     * @private
     */
    private resolveIncludePath(fromDirname: string, toPath: string): string{
        return resolve(this.resolveFilePath(fromDirname), toPath);
    }

    //endregion

}
