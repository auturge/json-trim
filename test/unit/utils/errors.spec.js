const { AnyRandom } = require('@auturge/testing');
const { expect } = require('chai');
const { throwError, throwException, wrapError, EXIT_CODES } = require('../../../src/lib/utils/errors');

describe('wrapError', () => {

    it(`wrapError - throws an error with the given message`, () => {

        const message = AnyRandom.string();

        const error = wrapError(message);

        expect(error.message).to.equal(message);
        expect(error.inner).to.equal(null);
        expect(error.exitCode).to.equal(EXIT_CODES.INTERNAL_ERROR);
    });

    it(`wrapError - throws an error with the given message and inner error`, () => {

        const message1 = AnyRandom.string();
        const message2 = AnyRandom.string();
        const innerError = new TypeError(message2);

        const error = wrapError(message1, innerError);

        expect(error.message).to.equal(message1);
        expect(error.inner).to.equal(innerError);
        expect(error.exitCode).to.equal(EXIT_CODES.INTERNAL_ERROR);
    });

    it(`wrapError - throws an error with the given message and exit code`, () => {

        const message = AnyRandom.string();
        const code = AnyRandom.enum(EXIT_CODES);

        const error = wrapError(message, null, code);

        expect(error.message).to.equal(message);
        expect(error.inner).to.equal(null);
        expect(error.exitCode).to.equal(code);
    });

    it(`wrapError - throws an error with the given error, inner error, and exit code`, () => {

        const message1 = AnyRandom.string();
        const message2 = AnyRandom.string();
        const code = AnyRandom.enum(EXIT_CODES);
        const innerError = new TypeError(message2);

        const error = wrapError(message1, innerError, code);

        expect(error.message).to.equal(message1);
        expect(error.inner).to.equal(innerError);
        expect(error.exitCode).to.equal(code);
    });
});

describe('throwError', () => {

    it(`throwError - throws an error with the given message`, () => {

        const message = AnyRandom.string();

        const assertion = expect(() => {
            throwError(message);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message);
        expect(error.inner).to.equal(null);
        expect(error.exitCode).to.equal(EXIT_CODES.INTERNAL_ERROR);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.false;
    });

    it(`throwError - throws an error with the given message and inner error`, () => {

        const message1 = AnyRandom.string();
        const message2 = AnyRandom.string();
        const innerError = new TypeError(message2);

        const assertion = expect(() => {
            throwError(message1, innerError);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message1);
        expect(error.inner).to.equal(innerError);
        expect(error.exitCode).to.equal(EXIT_CODES.INTERNAL_ERROR);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.false;
    });

    it(`throwError - throws an error with the given message and exit code`, () => {

        const message = AnyRandom.string();
        const code = AnyRandom.enum(EXIT_CODES);

        const assertion = expect(() => {
            throwError(message, null, code);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message);
        expect(error.inner).to.equal(null);
        expect(error.exitCode).to.equal(code);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.false;
    });

    it(`throwError - throws an error with the given error, inner error, and exit code`, () => {

        const message1 = AnyRandom.string();
        const message2 = AnyRandom.string();
        const code = AnyRandom.enum(EXIT_CODES);
        const innerError = new TypeError(message2);

        const assertion = expect(() => {
            throwError(message1, innerError, code);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message1);
        expect(error.inner).to.equal(innerError);
        expect(error.exitCode).to.equal(code);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.false;
    });
});

describe('throwException', () => {

    it(`throwException - throws an error with the given message`, () => {

        const message = AnyRandom.string();

        const assertion = expect(() => {
            throwException(message);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message);
        expect(error.inner).to.equal(null);
        expect(error.exitCode).to.equal(EXIT_CODES.INTERNAL_ERROR);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.true;
    });

    it(`throwException - throws an error with the given message and inner error`, () => {

        const message1 = AnyRandom.string();
        const message2 = AnyRandom.string();
        const innerError = new TypeError(message2);

        const assertion = expect(() => {
            throwException(message1, innerError);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message1);
        expect(error.inner).to.equal(innerError);
        expect(error.exitCode).to.equal(EXIT_CODES.INTERNAL_ERROR);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.true;
    });

    it(`throwException - throws an error with the given message and exit code`, () => {

        const message = AnyRandom.string();
        const code = AnyRandom.enum(EXIT_CODES);

        const assertion = expect(() => {
            throwException(message, null, code);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message);
        expect(error.inner).to.equal(null);
        expect(error.exitCode).to.equal(code);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.true;
    });

    it(`throwException - throws an error with the given error, inner error, and exit code`, () => {

        const message1 = AnyRandom.string();
        const message2 = AnyRandom.string();
        const code = AnyRandom.enum(EXIT_CODES);
        const innerError = new TypeError(message2);

        const assertion = expect(() => {
            throwException(message1, innerError, code);
        }).to.throw();

        const error = assertion.__flags.object;
        expect(error.message).to.equal(message1);
        expect(error.inner).to.equal(innerError);
        expect(error.exitCode).to.equal(code);
        expect(error.internal).to.be.true;
        expect(error.exceptional).to.be.true;
    });
});
