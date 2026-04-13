import {randomBytes} from 'node:crypto';

/**
 * @param {number} length The length of the string
 * @return {Promise<string>}
 */
export function createRandomString(length: number): Promise<string>{
    if(length <= 0)
        return Promise.resolve('');

    return new Promise<string>((resolve, reject) => {
        const bytesLength = Math.ceil(length / 2);
        randomBytes(bytesLength, (err, buff) => {
            if(err)
                return reject(err);

            const hexString = buff.toString('hex').slice(0, length);
            return resolve(hexString);
        });
    });
}
