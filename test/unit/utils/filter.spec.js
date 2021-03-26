const src = "../../../src/lib";
const testObjects = "../../objects";

const { assert, expect } = require('chai');

const filter = require(src + '/utils/filter');

describe('filter', () => {

    // // If the config has a trimlist, then trim out any entries that exist in the trimlist
    // // if it doesn't, then assume you mean to "keep them all"
    // if (config.trimlist && config.trimlist.length) {
    //     keylist = filter(word => !config.trimlist.includes(word), keylist);
    //     delete config.trimlist;
    // }

    it(`filter - throws an error if the func argument isn't a function`, () => {

        const wordlist = [ 'good', 'nice', 'happy', 'bad', 'evil', 'right', 'wrong' ];
        const trimlist = [ 'bad', 'evil', 'wrong' ];

        assert.throws(() => {
            filter(wordlist, trimlist);
        });
    });

    [
        { key: 'null', value: null },
        { key: 'undefined', value: undefined }
    ].forEach(({ key, value }) => {
        it(`filter - throws an error if the array argument is ${ key }`, () => {

            const array = value;
            const func = word => !trimlist.includes(word);

            assert.throws(() => {
                filter(func, array);
            });
        });
    });

    it('filter - filters an array using a function', () => {

        const array = [ 'good', 'nice', 'happy', 'bad', 'evil', 'right', 'wrong' ];
        const trimlist = [ 'bad', 'evil', 'wrong' ];
        const func = word => !trimlist.includes(word);
        const expected = [ 'good', 'nice', 'happy', 'right' ];

        const result = filter(func, array);

        expect(result).to.have.same.members(expected);
    });

    it(`filter - doesn't blow up if the function returns false`, () => {

        const array = [ 'good', 'nice', 'happy', 'bad', 'evil', 'right', 'wrong' ];
        const trimlist = [ 'chicken', 'soup' ];
        const func = word => !trimlist.includes(word);

        const result = filter(func, array);

        expect(result).to.have.same.members(array);
    });

    it(`filter - doesn't blow up if the array is missing members`, () => {
        const array = new Array(4);
        array[ 0 ] = 'Alice';
        array[ 1 ] = 'Bob';
        array[ 3 ] = 'Denise';
        const trimlist = [ 'chicken', 'soup' ];
        const expected = [ array[ 0 ], array[ 1 ], array[ 3 ] ];
        const func = word => !trimlist.includes(word);

        const result = filter(func, array);

        expect(result).to.have.same.members(expected);
    });
})
