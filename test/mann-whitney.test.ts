import { describe, expect, expectTypeOf, it } from "vitest";
import {
  check,
  criticalValue,
  type ReadonlySamplesPair,
  type SamplesPair,
  significant,
  test,
  type UValues,
} from "../src/mann-whitney";

describe("test()", () => {
  it.each<{ name: string; samples: SamplesPair; expected: UValues }>([
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

  it("returns UValues and accepts `as const` input (types)", () => {
    const samples = [
      [30, 14, 6],
      [12, 15, 16],
    ] as const;
    const u = test(samples);
    expectTypeOf(u).toEqualTypeOf<UValues>();
    expectTypeOf(test).returns.toEqualTypeOf<UValues>();
    expectTypeOf(samples).toExtend<ReadonlySamplesPair>();
    expect(u).toEqual([4, 5]);
  });

  it("stays type-compatible with 1.1.0 (number[] in, number[] out)", () => {
    const samples: SamplesPair = [
      [30, 14, 6],
      [12, 15, 16],
    ];
    const u: number[] = test(samples);
    expectTypeOf(check).toBeCallableWith(u, samples);
    expectTypeOf(criticalValue).toBeCallableWith(u, samples);
    expectTypeOf(significant).toBeCallableWith(u, samples);
    expect(check(u, samples)).toBe(true);
  });

  it("does not mutate the input samples", () => {
    const a = [30, 14, 6];
    const b = [12, 15, 16];
    test([a, b]);
    expect(a).toEqual([30, 14, 6]);
    expect(b).toEqual([12, 15, 16]);
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

  it.each<{ samples: unknown; message: string }>([
    { samples: [null, [1]], message: "Samples cannot be empty" },
    { samples: [[1], "ab"], message: "Sample 1 must be an array" },
  ])("keeps 1.1.0 error messages: $message", ({ samples, message }) => {
    expect(() => test(samples as never)).toThrow(message);
  });
});
