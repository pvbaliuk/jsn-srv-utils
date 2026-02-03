import {resolve} from 'node:path';
import {accessSync, constants} from 'node:fs';

let cachedRootPackageDirname: string|null = null;

/**
 * @returns {string}
 */
export function getRootPackageDirnameSync(): string{
    if(cachedRootPackageDirname !== null)
        return cachedRootPackageDirname;

    let path = resolve(__dirname, '..'),
        lastValidPath = path;

    while(true){
        const packageJsonPath = resolve(path, 'package.json');
        try{
            accessSync(packageJsonPath, constants.F_OK | constants.R_OK);
        }catch(e){
            break;
        }

        lastValidPath = path;
        path = resolve(path, '..');
    }

    cachedRootPackageDirname = lastValidPath;
    return lastValidPath;
}
