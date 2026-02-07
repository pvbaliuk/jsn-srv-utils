import {resolve} from 'node:path';
import {ConfigLoader} from '../src';

describe('ConfigLoader', () => {
    let configLoader: ConfigLoader;
    beforeAll(() => {
        configLoader = ConfigLoader.instance();
    });

    describe('resolvePkgRootPath', () => {
        const cases = [
            {path: '%pkgroot', shouldBe: resolve(__dirname, '..')},
            {path: '%pkgroot/tests', shouldBe: __dirname},
            {path: '%pkgroot/tests/../src', shouldBe: resolve(__dirname, '..', 'src')}
        ]

        test.each(cases)(
            '.resolvePkgRootPath($path)', ({path, shouldBe}) => {
                expect(configLoader['resolvePkgRootPath'](path)).toBe(shouldBe);
            }
        )
    });

    describe('resolveIncludePath', () => {
        const cases = [
            {from: '/home/dev', to: './mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '/home/dev/configs', to: '../mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '/home/dev/configs', to: '/home/dev/mysql.yml', shouldBe: resolve('/home/dev/mysql.yml')},
            {from: '%pkgroot/configs', to: './mysql.yml', shouldBe: resolve(__dirname, '..', 'configs', 'mysql.yml')}
        ];

        test.each(cases)(
            '.resolveIncludePath($from, $to)', ({from, to, shouldBe}) => {
                const result = configLoader['resolveIncludePath'](from, to);
                expect(result).toBe(shouldBe);
            }
        )
    });
});
