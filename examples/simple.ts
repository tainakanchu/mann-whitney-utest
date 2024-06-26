// Mann-Whitney U test
// Luke Mitchell, April 2016
// https://github.com/lukem512/mann-whitney-utest

import * as mwu from "../src/mann-whitney";

const samples: mwu.SamplesPair = [
  [30, 14, 6],
  [12, 15, 16],
];
const u = mwu.test(samples);

if (!mwu.check(u, samples)) {
  console.error("Something went wrong!");
} else {
  console.log("U values", u);

  const criticalValue = mwu.criticalValue(u, samples);
  console.log("The critical value is", criticalValue);

  if (mwu.significant(u, samples)) {
    console.log("The data is significant!");
  } else {
    console.log("The data is not significant.");
  }
}
