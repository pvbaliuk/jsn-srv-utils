import {access} from 'node:fs/promises';
import {accessSync, constants} from 'node:fs';

/**
 * @param {string} path
 * @param {number} [mode]
 * @returns {boolean}
 */
export async function fileExists(path: string, mode: number = constants.F_OK | constants.R_OK): Promise<boolean>{
    try{
        await access(path, mode);
        return true;
    }catch(e){
        return false;
    }
}

/**
 * @param {string} path
 * @param {number} [mode]
 * @returns {boolean}
 */
export function fileExistsSync(path: string, mode: number = constants.F_OK | constants.R_OK): boolean{
    try{
        accessSync(path, mode);
        return true;
    }catch(e){
        return false;
    }
}
