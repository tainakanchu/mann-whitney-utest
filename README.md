# Mann-Whitney U Test

> [!NOTE]
> This package is forked from original [mann-whitney-utest](https://github.com/lukem512/mann-whitney-utest) by Luke Mitchell to support typescript.

[![npm](https://img.shields.io/npm/l/@tainakanchu/mann-whitney-utest.svg)](https://www.npmjs.com/package/@tainakanchu/mann-whitney-utest) [![npm](https://img.shields.io/npm/v/@tainakanchu/mann-whitney-utest.svg)](https://www.npmjs.com/package/@tainakanchu/mann-whitney-utest) [![npm](https://img.shields.io/npm/dm/@tainakanchu/mann-whitney-utest.svg)](https://www.npmjs.com/package/@tainakanchu/mann-whitney-utest)

This is an NPM module that allows you to perform the Mann-Whitney U test on numeric samples. The Mann-Whitney U test is a nonparametric statistical test that does not assume a normal distribution.

## Installation

```sh
npm install @tainakanchu/mann-whitney-utest
```

## Usage

TypeScript / ESM:

```ts
import { test, check } from "@tainakanchu/mann-whitney-utest";

const samples = [
  [30, 14, 6],
  [12, 15, 16],
] as const;
const u = test(samples);
console.log(u); // [ 4, 5 ]
```

CommonJS:

```js
const mwu = require("@tainakanchu/mann-whitney-utest");

console.log(
  mwu.test([
    [30, 14, 6],
    [12, 15, 16],
  ]),
); // [ 4, 5 ]
```

You can check your answers using the `check` method. This exploits a property of the Mann-Whitney test that ensures the sum of the U values equals the product of the number of observations.

```ts
const u = test(samples);
if (check(u, samples)) {
  console.log("The values are correct");
}
```

## Significance

> [!WARNING]
> `significant()` (and `criticalValue()`, on which it is based) is known to be statistically incorrect: it compares the smaller U value with a z-score of the normal approximation, which is not a valid significance test. Do not rely on it. It is planned to be fixed in a future major version ([#5](https://github.com/tainakanchu/mann-whitney-utest/issues/5)).

```ts
import { significant } from "@tainakanchu/mann-whitney-utest";

significant(u, samples); // not reliable, see the warning above
```
