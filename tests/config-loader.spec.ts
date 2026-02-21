import {resolve} from 'node:path';
import {ConfigLoader} from '../src';

describe('ConfigLoader', () => {
    let configLoader: ConfigLoader;
    beforeAll(() => {
        process.env.TEST_CONFIG_PATH = '/home/dev/config-test';
        configLoader = ConfigLoader.instance();
    });

    describe('resolveFilePath', () => {
        const cases = [
            {path: '%pkgroot', shouldBe: resolve(__dirname, '..')},
            {path: '%pkgroot/tests', shouldBe: __dirname},
            {path: '%pkgroot/tests/../src', shouldBe: resolve(__dirname, '..', 'src')},
            {path: '%env:TEST_CONFIG_PATH/tests', shouldBe: resolve('/home/dev/config-test/tests')}
        ]

        test.each(cases)(
            '.resolveFilePath($path)', ({path, shouldBe}) => {
                expect(configLoader['resolveFilePath'](path)).toBe(shouldBe);
            }
        )
    });

    describe('resolveIncludePath', () => {
        const cases = [
            {from: '/home/dev', to: './mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '/home/dev/configs', to: '../mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '/home/dev/configs', to: '/home/dev/mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '%pkgroot/configs', to: './mysql.yml', shouldBe: resolve(__dirname, '..', 'configs', 'mysql.yml')},
            {from: '%env:TEST_CONFIG_PATH/tests', to: './mysql.yml', shouldBe: resolve('/home/dev/config-test/tests/mysql.yml')}
        ];

        test.each(cases)(
            '.resolveIncludePath($from, $to)', ({from, to, shouldBe}) => {
                const result = configLoader['resolveIncludePath'](from, to);
                expect(result).toBe(shouldBe);
            }
        )
    });
});
