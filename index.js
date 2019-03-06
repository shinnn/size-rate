'use strict';

const filesize = require('filesize');
const inspectWithKind = require('inspect-with-kind');

const formatter = Symbol('formatter');
const round = Symbol('round');
const spacer = Symbol('spacer');
const setWithoutArgumentLengthValidation = Symbol('setWithoutArgumentLengthValidation');

const unsupportedOptions = new Set([
	'exponent',
	'fullform',
	'fullforms',
	'output'
]);

function validateNumber(num, name) {
	let error;

	if (typeof num !== 'number') {
		error = new TypeError(`Expected ${name} to be a non-negative number, but got ${
			inspectWithKind(num)
		}.`);
	} else if (num < 0) {
		error = new RangeError(`Expected ${name} to be a non-negative number, but got a negative value ${num}.`);
	} else if (!Number.isFinite(num)) {
		error = new RangeError(`Expected ${name} to be a non-negative finite number, but got ${num}.`);
	} else if (num > Number.MAX_SAFE_INTEGER) {
		error = new RangeError(`Expected ${name} to be a non-negative safe number, but got a too large number.`);
	}

	if (!error) {
		return;
	}

	Error.captureStackTrace(error, validateNumber);
	throw error;
}

module.exports = class SizeRate {
	constructor(...args) {
		const argLen = args.length;

		if (argLen !== 1) {
			throw new RangeError(`Expected 1 argument (<Object>), but got ${
				argLen === 0 ? 'no' : argLen
			} arguments.`);
		}

		if (!args[0] || typeof args[0] !== 'object' || Array.isArray(args[0])) {
			throw new TypeError(`Expected an object to specify SizeRate options, but got ${
				inspectWithKind(args[0])
			}.`);
		}

		for (const unsupportedOption of unsupportedOptions) {
			const val = args[0][unsupportedOption];

			if (val !== undefined) {
				throw new Error(`\`${unsupportedOption}\` option is not supported, but ${
					inspectWithKind(val)
				} was provided.`);
			}
		}

		const options = {
			base: 10,
			round: 2,
			spacer: ' ',
			standard: 'iec',
			...args[0],
			output: 'array'
		};

		validateNumber(options.max, '`max` option');

		Object.defineProperty(this, round, {value: options.round});
		Object.defineProperty(this, spacer, {value: options.spacer});

		const [value, symbol] = filesize(options.max, options);
		this.denominator = `${value.toFixed(options.round)}${options.spacer}${symbol}`;

		Object.defineProperty(this, formatter, {
			value: filesize.partial(Object.assign(options, {
				exponent: filesize(options.max, {...options, output: 'exponent'})
			}))
		});

		Object.defineProperty(this, 'max', {
			enumerable: true,
			value: options.max
		});

		this.bytes = 0;
	}

	set(...args) {
		const argLen = args.length;

		if (argLen !== 1) {
			throw new RangeError(`Expected 1 argument (<number>), but got ${
				argLen === 0 ? 'no' : argLen
			} arguments.`);
		}

		const [num] = args;

		validateNumber(num, 'an argument of `set` method');
		this[setWithoutArgumentLengthValidation](num);
	}

	format(...args) {
		const argLen = args.length;

		if (argLen > 1) {
			throw new RangeError(`Expected 0 or 1 argument (<number>), but got ${argLen} arguments.`);
		}

		if (argLen === 1) {
			validateNumber(args[0], 'an argument of `format` method');
			this[setWithoutArgumentLengthValidation](args[0]);
		}

		const result = this[formatter](this.bytes);
		const str = `${result[0].toFixed(this[round])}${this[spacer]}${result[1]}`;
		return `${' '.repeat(this.denominator.length - str.length)}${str} / ${this.denominator}`;
	}
};

function internalSet(num) {
	if (num > this.max) {
		const error = new RangeError(`Expected a number no larger than the max bytes (${
			this.max
		}), but got ${num}.`);

		Error.captureStackTrace(error, internalSet);
		throw error;
	}

	this.bytes = num;
}

Object.defineProperty(module.exports.prototype, setWithoutArgumentLengthValidation, {
	value: internalSet
});
