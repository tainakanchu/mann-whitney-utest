// Mann-Whitney U test
// Luke Mitchell, April 2016
// https://github.com/lukem512/mann-whitney-utest

type RankedValue = {
  val: number;
  rank: number;
};

/**
 * The pair of U values `[u0, u1]` returned by {@link test}, one per sample.
 */
export type UValues = readonly [u0: number, u1: number];

/**
 * Exactly two samples of numeric observations. The input arrays are never mutated.
 */
export type SamplesPair = readonly [readonly number[], readonly number[]];

// Rank the list.
// Inspired by https://gist.github.com/gungorbudak/1c3989cc26b9567c6e50
const rank = (list: { val: number }[]): RankedValue[] => {
  // First, sort in ascending order
  list.sort((a, b) => a.val - b.val);

  // Second, add the rank to the objects
  const rankedList = list.map((item, index) => {
    return {
      ...item,
      rank: index + 1,
    };
  });

  // Third, use median values for groups with the same rank
  for (let i = 0; i < rankedList.length;) /* nothing */ {
    let count = 1;
    let total = rankedList[i].rank;

    for (
      let j = 0;
      rankedList[i + j + 1] && rankedList[i + j].val === rankedList[i + j + 1].val;
      j++
    ) {
      total += rankedList[i + j + 1].rank;
      count++;
    }

    const rank = total / count;

    for (let k = 0; k < count; k++) {
      rankedList[i + k].rank = rank;
    }

    i = i + count;
  }

  return rankedList;
};

// Compute the rank of a sample, given a ranked
// list and a list of observations for that sample.
const sampleRank = (rankedList: RankedValue[], observations: readonly number[]): number => {
  // Clone the array
  const remaining = observations.slice(0);

  // Compute the rank
  let rank = 0;
  for (const observation of rankedList) {
    const index = remaining.indexOf(observation.val);
    if (index > -1) {
      // Add the rank to the sum
      rank += observation.rank;

      // Remove the observation from the list
      remaining.splice(index, 1);
    }
  }

  return rank;
};

// Compute the U value of a sample,
// given the rank and the list of observations
// for that sample.
const uValue = (rank: number, observations: readonly number[]): number => {
  const k = observations.length;
  return rank - (k * (k + 1)) / 2;
};

/**
 * Check the U values are valid.
 *
 * This utilises a property of the Mann-Whitney U test that ensures the sum of
 * the U values equals the product of the number of observations.
 *
 * @param u The U values, as returned by {@link test}.
 * @param samples The samples the U values were computed from.
 * @returns `true` if `u0 + u1 === n0 * n1`.
 */
export const check = (u: UValues, samples: SamplesPair): boolean =>
  u[0] + u[1] === samples[0].length * samples[1].length;

/**
 * Approximate the critical value for the samples using the normal
 * approximation with tie correction.
 *
 * This is necessary when the sample sizes are greater than 20 as the U tables
 * are limited to 20x20.
 * https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test#Normal_approximation_and_tie_correction
 *
 * Note that the returned number is the absolute z-score (|z|) of the normal
 * approximation for the smaller U value, not a critical value of the U
 * distribution.
 *
 * @param u The U values, as returned by {@link test}.
 * @param samples The samples the U values were computed from.
 * @returns The |z| score of the normal approximation.
 */
export const criticalValue = (u: UValues, samples: SamplesPair): number => {
  const uVal = Math.min(u[0], u[1]);
  const prod = samples[0].length * samples[1].length;
  const n = samples[0].length + samples[1].length;
  const mean = prod / 2;

  // Count the occurrences of each value
  const counts = new Map<number, number>();
  for (const sample of samples) {
    for (const o of sample) {
      counts.set(o, (counts.get(o) ?? 0) + 1);
    }
  }

  // Compute correction for any tied ranks
  let correction = 0;
  for (const count of counts.values()) {
    if (count > 1) correction += (count ** 3 - count) / (n * (n - 1));
  }

  // Compute standard deviation using correction for ties
  const stddev = Math.sqrt((prod / 12) * (n + 1 - correction));

  // Approximate the critical value
  return Math.abs((uVal - mean) / stddev);
};

/**
 * Test the result for significance.
 *
 * Returns `true` if the lesser U value is less than {@link criticalValue}.
 *
 * @remarks
 * Warning: this compares the smaller U value against a z-score, which is not a
 * valid significance test and can give statistically incorrect answers. Do not
 * rely on it. This is to be fixed in a future major version.
 *
 * @param u The U values, as returned by {@link test}.
 * @param samples The samples the U values were computed from.
 */
export const significant = (u: UValues, samples: SamplesPair): boolean =>
  Math.min(u[0], u[1]) < criticalValue(u, samples);

/**
 * Perform the Mann-Whitney U test on a pair of samples.
 *
 * The input should be of the form `[[a, b, c], [e, f, g]]` where `{a, b, ..., g}`
 * are numeric values forming two samples. The input is not mutated.
 *
 * @param samples Exactly two non-empty samples.
 * @returns The U values `[u0, u1]`, one per sample.
 * @throws If `samples` is not an array of exactly two non-empty arrays.
 */
export const test = (samples: SamplesPair): UValues => {
  // Perform validation
  if (!Array.isArray(samples)) throw Error("Samples must be an array");
  if (samples.length !== 2) throw Error("Samples must contain exactly two samples");

  for (let i = 0; i < 2; i++) {
    if (!Array.isArray(samples[i])) throw Error(`Sample ${i} must be an array`);
    if (samples[i].length === 0) throw Error("Samples cannot be empty");
  }

  // Rank the entire list of observations
  const all = samples[0].concat(samples[1]);

  const ranked = rank(all.map((val) => ({ val })));

  // Compute the U value of each sample
  const u0 = uValue(sampleRank(ranked, samples[0]), samples[0]);
  const u1 = uValue(sampleRank(ranked, samples[1]), samples[1]);

  // An optimisation is to use a property of the U test
  // to calculate the U value of sample 1 based on the value
  // of sample 0: u1 = n0 * n1 - u0

  return [u0, u1];
};
