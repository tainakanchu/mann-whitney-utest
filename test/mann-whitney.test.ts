import { describe, expect, it } from "vitest";
import { check, test, type SamplesPair } from "../src/mann-whitney";

describe("test()", () => {
  it.each<{ name: string; samples: SamplesPair; expected: number[] }>([
    {
      name: "Simple U test #1",
      expected: [19.5, 44.5],
      samples: [
        [30, 14, 6, 11, 88, 1, 3, 7],
        [12, 15, 16, 42, 9, 9, 30, 28],
      ],
    },
    {
      name: "Simple U test #2",
      expected: [48.5, 23.5],
      samples: [
        [1, 4, 9, 6, 4, 3, 5, 6, 4],
        [1, 5, 3, 2, 5, 4, 1, 5],
      ],
    },
    {
      name: "README example",
      expected: [4, 5],
      samples: [
        [30, 14, 6],
        [12, 15, 16],
      ],
    },
  ])("$name", ({ samples, expected }) => {
    const u = test(samples);
    expect(u).toEqual(expected);
    expect(check(u, samples)).toBe(true);
  });

  it.each<{ name: string; samples: unknown }>([
    {
      name: "Sample count > 2",
      samples: [
        [30, 14, 6, 11, 88, 1, 3, 7],
        [12, 15, 16, 42, 9, 9, 30, 28],
        [1, 2, 3, 4, 5, 6, 7, 8],
      ],
    },
    { name: "Empty sample array", samples: [] },
    { name: "Empty samples", samples: [[], []] },
    { name: "Non-array sample (string)", samples: "hello" },
    { name: "Non-array sample (numeric)", samples: 30 },
    { name: "Non-array sample (boolean)", samples: true },
    { name: "Non-array sample (object)", samples: { some: "json" } },
    { name: "Non-array sample (function)", samples: () => [] },
    { name: "Non-array sample (null)", samples: null },
  ])("rejects: $name", ({ samples }) => {
    expect(() => test(samples as never)).toThrow();
  });
});
