# Mann-Whitney U Test

> [!NOTE]
> This package is forked from original [mann-whitney-utest](https://github.com/lukem512/mann-whitney-utest) by Luke Mitchell to support typescript.

[![npm](https://img.shields.io/npm/l/@tainakanchu/mann-whitney-utest.svg)](https://www.npmjs.com/package/@tainakanchu/mann-whitney-utest) [![npm](https://img.shields.io/npm/v/@tainakanchu/mann-whitney-utest.svg)](https://www.npmjs.com/package/@tainakanchu/mann-whitney-utest) [![npm](https://img.shields.io/npm/dm/@tainakanchu/mann-whitney-utest.svg)](https://www.npmjs.com/package/@tainakanchu/mann-whitney-utest)

This is an NPM module that allows you to perform the Mann-Whitney U test on numeric samples. The Mann-Whitney U test is a nonparametric statistical test that does not assume a normal distribution.

To use it, simply install via NPM and include it in your project file.

```
	var mwu = require('mann-whitney-utest');
```

Then, to test an array of samples, use the `test` method.

```
	var samples = [ [30, 14, 6], [12, 15, 16] ];
	console.log(mwu.test(samples)); // [ 4, 5 ]
```

To test whether the result is significant, use the `significant` method. This tests the U-value against an approximate critical value.

```
	var u = mwu.test(samples);
	if (mwu.significant(u, samples)) {
		console.log('The data is significant!');
	} else {
		console.log('The data is not significant.');
	}
```

You can check your answers using the `check` method. This exploits a property of the Mann-Whitney test that ensures the sum of the U values does not exceed the product of the number of observations.

```
	var u = mwu.test(samples);
	if (mwu.check(u, samples)) {
		console.log('The values are correct');
	}
```
