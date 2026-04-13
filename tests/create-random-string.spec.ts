import {createRandomString} from '../src';

describe('createRandomString', () => {
    it('should generate a string of the specified even length', async () => {
        const result = await createRandomString(10);

        expect(result).toHaveLength(10);
        expect(typeof result).toBe('string');
        expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });

    it('should generate a string of the specified odd length', async () => {
        const result = await createRandomString(5);

        expect(result).toHaveLength(5);
    });

    it('should handle length 1 correctly', async () => {
        const result = await createRandomString(1);

        expect(result).toHaveLength(1);
    });

    it('should handle length 0 correctly', async () => {
        const result = await createRandomString(0);

        expect(result).toBe('');
    });

    it('should generate unique values (randomness check)', async () => {
        const str1 = await createRandomString(16);
        const str2 = await createRandomString(16);

        expect(str1).not.toBe(str2);
    });
});
