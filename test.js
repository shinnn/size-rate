'use strict';

const SizeRate = require('.');
const test = require('tape');

test('SizeRate', t => {
  const sizeRate = new SizeRate({max: 123456});

  t.equal(
    sizeRate.format(),
    '  0.00 KB / 123.46 kB',
    'should output size rate via `format` method.'
  );

  sizeRate.set(214.5);

  t.equal(
    sizeRate.format(),
    '  0.21 kB / 123.46 kB',
    'should update a numerator via `set` method.'
  );

  t.equal(
    sizeRate.format(99999),
    '100.00 kB / 123.46 kB',
    'should accept an argument of `format` method.'
  );

  t.equal(
    new SizeRate({max: 0, round: 0}).format(0),
    '0 B / 0 B',
    'should support zero.'
  );

  t.equal(
    new SizeRate({max: 219021120, base: 2, round: 3}).format(191897743),
    '183.008 MiB / 208.875 MiB',
    'should support options for `filesize` module.'
  );

  t.throws(
    () => new SizeRate(),
    /TypeError.*Expected an object to specify SizeRate options, but got undefined\./,
    'should throw an error when the constructor receives no argument.'
  );

  t.throws(
    () => new SizeRate([]),
    /TypeError.*Expected an object to specify SizeRate options, but got \[] \(array\)\./,
    'should throw an error when the constructor receives an invalid value.'
  );

  t.throws(
    () => new SizeRate({}),
    /TypeError.*Expected `max` option to be a non-negative number, but got undefined\./,
    'should throw an error when the constructor doesn\'t receive `max` option.'
  );

  t.throws(
    () => new SizeRate({max: new WeakMap()}),
    /TypeError.*Expected `max` option to be a non-negative number, but got WeakMap {}\./,
    'should throw an error when `max` option is not a number.'
  );

  t.throws(
    () => new SizeRate({max: -1}),
    /RangeError.*Expected `max` option to be a non-negative number, but got a negative value -1\./,
    'should throw an error when `max` option is negative.'
  );

  t.throws(
    () => new SizeRate({max: Infinity}),
    /RangeError.*Expected `max` option to be a non-negative finite number, but got Infinity\./,
    'should throw an error when `max` option is infinite.'
  );

  t.throws(
    () => new SizeRate({max: Number.MAX_SAFE_INTEGER + 1}),
    /RangeError.*Expected `max` option to be a non-negative safe number, but got a too large number\./,
    'should throw an error when `max` option is larger than the max safe integer.'
  );

  t.throws(
    () => new SizeRate({max: 0.1, fullform: true}),
    /Error.*`fullform` option is not supported, but true \(boolean\) was provided\./,
    'should throw an error when it takes unsupported options.'
  );

  t.throws(
    () => new SizeRate({max: 123.45}).set(123.46),
    /RangeError.*Expected a number no larger than the max bytes \(123\.45\), but got 123\.46\./,
    'should throw an error when `set` method receives a number larger than the max value.'
  );

  t.end();
});

