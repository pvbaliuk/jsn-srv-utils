import {dirname, relative, resolve} from 'node:path';

/**
 * @param {string} fromPath
 * @param {string} tsconfigPath
 */
export function useTsconfigPaths(fromPath: string, tsconfigPath: string): void{
    let moduleAlias: any|null = null;
    try{
        require('module-alias/register');
        moduleAlias = require('module-alias');
    }catch(e){
        throw new Error('module-alias package should be installed to use the function');
    }

    const tsconfig = require(tsconfigPath),
        tsconfigDirPathname = dirname(tsconfigPath),
        paths: Record<string, string> = {};

    Object.entries((tsconfig?.compilerOptions?.paths ?? {}) as Record<string, string[]>)
        .forEach(([moduleName, pathArray]) => {
            if(pathArray.length === 0)
                return;

            paths[moduleName] = resolve(tsconfigDirPathname, relative(tsconfigDirPathname, fromPath), pathArray[0]);
        });

    moduleAlias.addAliases(paths);
}
