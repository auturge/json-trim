const { assert } = require('chai');
const { AnyRandom } = require('@auturge/testing');
const { isFunction } = require('../../../src/lib/utils/isFunction');

describe('isFunction', () => {

    it('isFunction - returns true when the argument is a function', () => {
        const toCheck = () => { return "robble!"; }

        const result = isFunction(toCheck);

        assert.isTrue(result);
    });

    it('isFunction - returns false when the argument is a boolean', () => {
        const toCheck = true;

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });

    it('isFunction - returns false when the argument is a string', () => {
        const toCheck = "[object Function]";

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });


    it('isFunction - returns false when the argument is a BigInt', () => {
        const toCheck = 1234567890123456789012345678901234567890n;

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });


    it('isFunction - returns false when the argument is a number', () => {
        const toCheck = AnyRandom.int();

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });

    it('isFunction - returns false when the argument is null', () => {
        const toCheck = null;

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });

    it('isFunction - returns false when the argument is undefined', () => {
        const toCheck = undefined;

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });

    it('isFunction - returns false when the argument is a Symbol', () => {
        const toCheck = Symbol("function");

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });

    it('isFunction - returns false when the argument is an object', () => {
        const toCheck = Math;

        const result = isFunction(toCheck);

        assert.isFalse(result);
    });
});
