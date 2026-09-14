const { findReciprocalMatches } = require('../src/controllers/matchController');

console.log('\n--- Running Unit Tests for Reciprocal Matchmaking Algorithm ---\n');

let passed = 0;
let failed = 0;

const assert = (condition, message) => {
  if (condition) {
    console.log(` \x1b[32m✔ PASS\x1b[0m: ${message}`);
    passed++;
  } else {
    console.error(` \x1b[31m✖ FAIL\x1b[0m: ${message}`);
    failed++;
  }
};

const tagC = { _id: 'tag_cpp', name: 'C++' };
const tagGraph = { _id: 'tag_graph', name: 'C++ Graph Algorithms' };
const tagReact = { _id: 'tag_react', name: 'React UI' };
const tagPython = { _id: 'tag_python', name: 'Python' };
const tagDS = { _id: 'tag_ds', name: 'Data Structures' };
const tagAlgo = { _id: 'tag_algo', name: 'Algorithms' };

// Scenario 1: Perfect reciprocal cycle of length 2
// User A: strong = [tagGraph, tagC], weak = [tagReact]
// User B: strong = [tagReact], weak = [tagGraph]
const userA = {
  _id: 'user_a',
  fullName: 'User A',
  strongTags: [tagGraph, tagC],
  weakTags: [tagReact],
};

const userB = {
  _id: 'user_b',
  fullName: 'User B',
  strongTags: [tagReact],
  weakTags: [tagGraph],
};

const result1 = findReciprocalMatches(userA, [userB]);
assert(result1.length === 1, 'Reciprocal match found for 2-cycle complementary pairs');
assert(result1[0].bTeachesA[0]._id === 'tag_react', 'B teaches A identified as React UI');
assert(result1[0].aTeachesB[0]._id === 'tag_graph', 'A teaches B identified as C++ Graph Algorithms');

// Scenario 2: One-way match only (B teaches A, but A has nothing B wants)
// User C: strong = [tagReact], weak = [tagPython] (A only has C++ / Graph, not Python)
const userC = {
  _id: 'user_c',
  fullName: 'User C (One way tutor)',
  strongTags: [tagReact],
  weakTags: [tagPython],
};

const result2 = findReciprocalMatches(userA, [userC]);
assert(result2.length === 0, 'One-way match is rejected (requires strict 2-cycle academic reciprocity)');

// Scenario 3: One-way match only (A can teach D, but D has nothing A wants)
// User D: strong = [tagPython], weak = [tagC]
const userD = {
  _id: 'user_d',
  fullName: 'User D (One way learner)',
  strongTags: [tagPython],
  weakTags: [tagC],
};

const result3 = findReciprocalMatches(userA, [userD]);
assert(result3.length === 0, 'One-way learning is rejected (requires reciprocal return value)');

// Scenario 4: Multiple matching skills in both directions
const userE = {
  _id: 'user_e',
  fullName: 'User E (Multi-skill match)',
  strongTags: [tagReact, tagDS],
  weakTags: [tagGraph, tagC],
};

const userA_multi = {
  _id: 'user_a',
  fullName: 'User A',
  strongTags: [tagGraph, tagC],
  weakTags: [tagReact, tagDS],
};

const result4 = findReciprocalMatches(userA_multi, [userE]);
assert(result4.length === 1, 'Multi-skill reciprocal match detected');
assert(result4[0].bTeachesA.length === 2, 'Both React UI and Data Structures identified for B teaches A');
assert(result4[0].aTeachesB.length === 2, 'Both Graph and C++ identified for A teaches B');

// Scenario 5: Self match must be ignored
const result5 = findReciprocalMatches(userA, [userA]);
assert(result5.length === 0, 'Self-match is rejected');

// Scenario 6: User with empty tags
const emptyUser = {
  _id: 'user_empty',
  strongTags: [],
  weakTags: [],
};
const result6 = findReciprocalMatches(emptyUser, [userB]);
assert(result6.length === 0, 'Empty tags return empty matches list');

console.log(`\n==================================================`);
console.log(` Algorithm Test Results: ${passed} passed, ${failed} failed`);
console.log(`==================================================\n`);

if (failed > 0) {
  process.exit(1);
}
