// Mann-Whitney U test
// Luke Mitchell, April 2016
// https://github.com/lukem512/mann-whitney-utest

// The object key used to store the observation value.
const __key = "val";

// Rank the list.
// Inspired by https://gist.github.com/gungorbudak/1c3989cc26b9567c6e50
const rank = (list) => {
  // First, sort in ascending order
  list.sort((a, b) => a[__key] - b[__key]);

  // Second, add the rank to the objects
  const rankedList = list.map((item, index) => {
    item.rank = index + 1;
    return item;
  });

  // Third, use median values for groups with the same rank
  for (let i = 0; i < rankedList.length; ) /* nothing */ {
    let count = 1;
    let total = rankedList[i].rank;

    for (
      let j = 0;
      rankedList[i + j + 1] && rankedList[i + j][__key] === rankedList[i + j + 1][__key];
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
const sampleRank = (rankedList, observations) => {
  // Clone the array
  const __observations = observations.slice(0);

  // Compute the rank
  let rank = 0;
  for (const observation of rankedList) {
    const index = __observations.indexOf(observation[__key]);
    if (index > -1) {
      // Add the rank to the sum
      rank += observation.rank;

      // Remove the observation from the list
      __observations.splice(index, 1);
    }
  }

  return rank;
};

// Compute the U value of a sample,
// given the rank and the list of observations
// for that sample.
const uValue = (rank, observations) => {
  const k = observations.length;
  return rank - (k * (k + 1)) / 2;
};

// Check the U values are valid.
// This utilises a property of the Mann-Whitney U test
// that ensures the sum of the U values equals the product
// of the number of observations.
export const check = (u, samples) => u[0] + u[1] === samples[0].length * samples[1].length;

// Approximate the crticial value for the samples.
// This is necessary when the sample sizes are greater than 20
// as the U tables are limited to 20x20.
// https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test#Normal_approximation_and_tie_correction
export const criticalValue = (u, samples) => {
  const uVal = Math.min(u[0], u[1]);
  const prod = samples[0].length * samples[1].length;
  const n = samples[0].length + samples[1].length;
  const mean = prod / 2;

  // Count the ranks
  const counts = {};
  for (const sample of samples) {
    for (const o of sample) {
      if (!counts[o]) counts[o] = 1;
      else counts[o]++;
    }
  }

  // Find any tied ranks
  const ties = Object.keys(counts)
    .filter((key) => counts[key] > 1)
    .map((tie) => counts[tie]);
  const k = ties.length;

  // Compute correction
  let correction = 0;
  for (let i = 0; i < k; i++) {
    correction += (ties[i] ** 3 - ties[i]) / (n * (n - 1));
  }

  // Compute standard deviation using correction for ties
  const stddev = Math.sqrt((prod / 12) * (n + 1 - correction));

  // Approximate the critical value
  const z = Math.abs((uVal - mean) / stddev);
  return z;
};

// Test the result for significance.
// A result is significant if the lesser U-value is
// less than the critical value.
export const significant = (u, samples) => Math.min(u[0], u[1]) < criticalValue(u, samples);

// Perform te Mann-Whitney U test on an array of samples.
// The input should be of the form [[a, b, c], [e, f, g]]
// where {a, b, ..., g} are numeric values forming two
// samples.
export const test = (samples) => {
  // Perform validation
  if (!Array.isArray(samples)) throw Error("Samples must be an array");
  if (samples.length !== 2) throw Error("Samples must contain exactly two samples");

  for (let i = 0; i < 2; i++) {
    if (!samples[i] || samples[i].length === 0) throw Error("Samples cannot be empty");
    if (!Array.isArray(samples[i])) throw Error(`Sample ${i} must be an array`);
  }

  // Rank the entire list of observations
  const all = samples[0].concat(samples[1]);

  const unranked = all.map((val) => {
    const result = {};
    result[__key] = val;
    return result;
  });

  const ranked = rank(unranked);

  // Compute the rank of each sample
  const ranks: number[] = []; // Initialize ranks array with empty arrays for each sample
  for (let i = 0; i < 2; i++) {
    ranks[i] = sampleRank(ranked, samples[i]);
  }

  // Compute the U values
  const us: number[] = [];
  for (let i = 0; i < 2; i++) {
    us[i] = uValue(ranks[i], samples[i]);
  }

  // An optimisation is to use a property of the U test
  // to calculate the U value of sample 1 based on the value
  // of sample 0
  // let u[1] = (samples[0].length * samples[1].length) - u[0];

  // Return the array of U values
  return us;
};
