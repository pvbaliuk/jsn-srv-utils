import {dirname, resolve} from 'node:path';

type UseTsconfigPathsOptions = {
    basePath?: string;
    tsconfigPath: string;
}

/**
 * @param {UseTsconfigPathsOptions} options
 */
export function useTsconfigPaths({basePath, tsconfigPath}: UseTsconfigPathsOptions): void{
    let moduleAlias: any|null = null;
    try{
        require('module-alias/register');
        moduleAlias = require('module-alias');
    }catch(e){
        throw new Error('module-alias package should be installed to use the function');
    }

    const tsconfig = require(resolve(tsconfigPath)),
        tsconfigDirPathname = dirname(tsconfigPath),
        paths: Record<string, string> = {};

    if(!basePath && !tsconfig?.compilerOptions?.baseUrl)
        throw new TypeError('Either basePath option should be provided or tsconfig.json should contain compilerOptions.baseUrl property');

    const baseUrl = tsconfig?.compilerOptions?.baseUrl
        ? resolve(tsconfig.compilerOptions.baseUrl)
        : resolve(basePath);

    Object.entries((tsconfig?.compilerOptions?.paths ?? {}) as Record<string, string[]>)
        .forEach(([moduleName, pathArray]) => {
            if(pathArray.length === 0)
                return;

            paths[moduleName] = resolve(tsconfigDirPathname, baseUrl, pathArray[0]);
        });

    moduleAlias.addAliases(paths);
}
