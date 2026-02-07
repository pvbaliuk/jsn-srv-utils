import {resolve} from 'node:path';
import {ConfigLoader} from '../src';

describe('ConfigLoader', () => {
    let configLoader: ConfigLoader;
    beforeAll(() => {
        configLoader = ConfigLoader.instance();
    });

    describe('resolveIncludePath', () => {
        const cases = [
            {from: '/home/dev', to: './mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '/home/dev/configs', to: '../mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '/home/dev/configs', to: '/home/dev/mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')}
        ];

        test.each(cases)(
            '.resolveIncludePath($from, $to)', ({from, to, shouldBe}) => {
                const result = configLoader['resolveIncludePath'](from, to);
                expect(result).toBe(shouldBe);
            }
        )
    });
});
