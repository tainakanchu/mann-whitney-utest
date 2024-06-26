// Mann-Whitney U test
// Luke Mitchell, April 2016
// https://github.com/lukem512/mann-whitney-utest

import * as mwu from "../src/mann-whitney";

const tests = [
  {
    name: "Simple U test #1",
    expected: [19.5, 44.5],
    rejected: false,
    samples: [
      [30, 14, 6, 11, 88, 1, 3, 7],
      [12, 15, 16, 42, 9, 9, 30, 28],
    ],
  },

  {
    name: "Simple U test #2",
    expected: [48.5, 23.5],
    rejected: false,
    samples: [
      [1, 4, 9, 6, 4, 3, 5, 6, 4],
      [1, 5, 3, 2, 5, 4, 1, 5],
    ],
  },

  {
    name: "Sample count > 2",
    rejected: true,
    samples: [
      [30, 14, 6, 11, 88, 1, 3, 7],
      [12, 15, 16, 42, 9, 9, 30, 28],
      [1, 2, 3, 4, 5, 6, 7, 8],
    ],
  },

  {
    name: "Empty sample array",
    rejected: true,
    samples: [],
  },

  {
    name: "Empty samples",
    rejected: true,
    samples: [[], []],
  },

  {
    name: "Non-array sample (string)",
    rejected: true,
    samples: "hello",
  },

  {
    name: "Non-array sample (numeric)",
    rejected: true,
    samples: 30,
  },

  {
    name: "Non-array sample (boolean)",
    rejected: true,
    samples: true,
  },

  {
    name: "Non-array sample (object)",
    rejected: true,
    samples: { some: "json" },
  },

  {
    name: "Non-array sample (function)",
    rejected: true,
    samples: () => [],
  },

  {
    name: "Non-array sample (null)",
    rejected: true,
    samples: null,
  },
];

const returnCode = 0;

for (const t of tests) {
  try {
    const u = mwu.test(t.samples as [number[], number[]]);
    if (!mwu.check(u, t.samples as [number[], number[]])) throw Error("Check failed");
    if (!t.expected) throw Error("Unexpected results");

    for (let index = 0; index < u.length; index++) {
      if (t.expected[index] !== u[index])
        throw Error("Returned results did not match expected results");
    }
  } catch (err) {
    if (!t.rejected) {
      console.error(t.name, err);
      const _passed = 1;
    }
  }
}

process.exit(returnCode);
