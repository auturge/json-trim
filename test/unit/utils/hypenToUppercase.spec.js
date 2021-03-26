const src = "../../../src/lib";

const { assert } = require('chai');

const { hyphenToUpperCase } = require(src + '/utils/hyphenToUppercase');

describe('hyphenToUpperCase', () => {

    [
        { key: 'null', value: null },
        { key: 'undefined', value: undefined },
        { key: 'empty string', value: "" }
    ].forEach(({ key, value }) => {
        it(`hyphenToUpperCase - returns the argument if it is ${ key }`, () => {
            var result = hyphenToUpperCase(value);

            assert.equal(result, value);
        });
    });

    it('hyphenToUpperCase - converts a hyphenated-name to camelCase', () => {
        var hyphenated = "item-name-one";
        var expected = "itemNameOne";

        var result = hyphenToUpperCase(hyphenated);

        assert.equal(result, expected);
    });
});
