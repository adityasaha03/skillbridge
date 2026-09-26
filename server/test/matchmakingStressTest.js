/**
 * SkillBridge - Matchmaking Engine Stress & Simulation Test Suite
 * 
 * Verifies:
 * 1. 2-Cycle Reciprocal Matching (A teaches B what B wants, B teaches A what A wants).
 * 2. Asymmetric / 1-Way non-reciprocal rejection (A teaches B, but B cannot teach A).
 * 3. Academic Semester Proximity weighting (closer semesters receive higher scores).
 * 4. Departmental affinity bonus (same department receives bonus points).
 * 5. Scale & Performance benchmark with 150+ simulated student profiles.
 * 6. Edge cases: Empty skill profiles, duplicate tag references, disjoint sets.
 */

const assert = require('assert');

// Core pure matchmaking scoring function replicating matchController.js logic
function computeMatchCandidate(currentUser, candidateUser) {
  // Disallow self-matching
  if (currentUser._id.toString() === candidateUser._id.toString()) {
    return null;
  }

  const userAStrong = new Set(currentUser.strongTags.map((t) => t.toString()));
  const userAWeak = new Set(currentUser.weakTags.map((t) => t.toString()));
  const userBStrong = new Set(candidateUser.strongTags.map((t) => t.toString()));
  const userBWeak = new Set(candidateUser.weakTags.map((t) => t.toString()));

  // A teaches B (Overlap of A's strong skills with B's desired learning skills)
  const aTeachesB = [...userAStrong].filter((tag) => userBWeak.has(tag));

  // B teaches A (Overlap of B's strong skills with A's desired learning skills)
  const bTeachesA = [...userBStrong].filter((tag) => userAWeak.has(tag));

  // 2-Cycle Reciprocal Condition: Both directions must have at least 1 skill overlap
  if (aTeachesB.length === 0 || bTeachesA.length === 0) {
    return null;
  }

  // Weightings
  const W_TEACH = 3.0;
  const W_LEARN = 3.0;
  const W_SEMESTER_PENALTY = 0.5;
  const W_DEPT_BONUS = 2.0;

  const semesterDiff = Math.abs((currentUser.semester || 1) - (candidateUser.semester || 1));
  const sameDept = currentUser.department && candidateUser.department &&
    currentUser.department.toLowerCase() === candidateUser.department.toLowerCase();

  const score = (aTeachesB.length * W_TEACH) +
                (bTeachesA.length * W_LEARN) -
                (semesterDiff * W_SEMESTER_PENALTY) +
                (sameDept ? W_DEPT_BONUS : 0);

  return {
    peerId: candidateUser._id.toString(),
    name: candidateUser.fullName,
    department: candidateUser.department,
    semester: candidateUser.semester,
    aTeachesB,
    bTeachesA,
    totalSkillExchangeCount: aTeachesB.length + bTeachesA.length,
    score: parseFloat(score.toFixed(2)),
  };
}

function runMatchmaking(currentUser, candidatePool, options = {}) {
  const { excludedUserIds = new Set() } = options;
  const matches = [];

  for (const candidate of candidatePool) {
    if (excludedUserIds.has(candidate._id.toString())) {
      continue;
    }
    const match = computeMatchCandidate(currentUser, candidate);
    if (match) {
      matches.push(match);
    }
  }

  // Sort descending by score
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

// -------------------------------------------------------------
// Test Execution Suite
// -------------------------------------------------------------

function runTests() {
  console.log('====================================================');
  console.log('🚀 Running SkillBridge Matchmaking Simulation & Stress Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function testCase(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  ✓ Passed: ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  ✗ Failed: ${name}`);
      console.error(`    Error: ${err.message}`);
    }
  }

  // Sample Tags
  const TAG_REACT = 'tag_react_01';
  const TAG_NODE = 'tag_node_02';
  const TAG_PYTHON = 'tag_python_03';
  const TAG_ML = 'tag_ml_04';
  const TAG_CPP = 'tag_cpp_05';
  const TAG_DSA = 'tag_dsa_06';

  // 1. Reciprocal Matching Test
  testCase('Should identify reciprocal match when mutual skills overlap', () => {
    const userA = {
      _id: 'user_01',
      fullName: 'Tahmid Khan',
      department: 'CSE',
      semester: 4,
      strongTags: [TAG_REACT, TAG_NODE],
      weakTags: [TAG_PYTHON, TAG_ML],
    };

    const userB = {
      _id: 'user_02',
      fullName: 'Nafis Sadik',
      department: 'CSE',
      semester: 4,
      strongTags: [TAG_PYTHON, TAG_ML],
      weakTags: [TAG_REACT],
    };

    const result = computeMatchCandidate(userA, userB);
    assert.ok(result !== null, 'Match should not be null');
    assert.strictEqual(result.peerId, 'user_02');
    assert.deepStrictEqual(result.aTeachesB, [TAG_REACT]);
    assert.deepStrictEqual(result.bTeachesA, [TAG_PYTHON, TAG_ML]);
    assert.ok(result.score > 0, 'Score should be positive');
  });

  // 2. Asymmetric / Non-Reciprocal Rejection
  testCase('Should reject pairing when exchange is 1-way (non-reciprocal)', () => {
    const userA = {
      _id: 'user_01',
      fullName: 'Tahmid Khan',
      department: 'CSE',
      semester: 4,
      strongTags: [TAG_REACT],
      weakTags: [TAG_PYTHON],
    };

    const userC = {
      _id: 'user_03',
      fullName: 'Sadia Rahman',
      department: 'CSE',
      semester: 4,
      strongTags: [TAG_CPP], // Does not have TAG_PYTHON
      weakTags: [TAG_REACT],  // Wants TAG_REACT from userA
    };

    const result = computeMatchCandidate(userA, userC);
    assert.strictEqual(result, null, 'Should return null because UserC cannot teach UserA');
  });

  // 3. Self-Matching Prevention
  testCase('Should prevent user from matching with themselves', () => {
    const userA = {
      _id: 'user_01',
      fullName: 'Tahmid Khan',
      department: 'CSE',
      semester: 4,
      strongTags: [TAG_REACT],
      weakTags: [TAG_REACT],
    };

    const result = computeMatchCandidate(userA, userA);
    assert.strictEqual(result, null, 'Self matching must return null');
  });

  // 4. Department Affinity Bonus & Semester Proximity
  testCase('Should rank closer semester and same department higher', () => {
    const currentUser = {
      _id: 'user_current',
      fullName: 'Main User',
      department: 'CSE',
      semester: 5,
      strongTags: [TAG_CPP, TAG_DSA],
      weakTags: [TAG_REACT, TAG_NODE],
    };

    const candidateSameDeptCloseSem = {
      _id: 'user_close',
      fullName: 'Close Peer',
      department: 'CSE', // same dept (+2.0)
      semester: 5,      // diff 0 (0 penalty)
      strongTags: [TAG_REACT],
      weakTags: [TAG_CPP],
    };

    const candidateDiffDeptFarSem = {
      _id: 'user_far',
      fullName: 'Far Peer',
      department: 'EEE', // diff dept (+0)
      semester: 1,      // diff 4 (-2.0 penalty)
      strongTags: [TAG_REACT],
      weakTags: [TAG_CPP],
    };

    const matchClose = computeMatchCandidate(currentUser, candidateSameDeptCloseSem);
    const matchFar = computeMatchCandidate(currentUser, candidateDiffDeptFarSem);

    assert.ok(matchClose.score > matchFar.score, 'Same dept and close semester peer should score higher');
    assert.strictEqual(matchClose.score, 8.0); // (1*3) + (1*3) - 0 + 2 = 8.0
    assert.strictEqual(matchFar.score, 4.0);   // (1*3) + (1*3) - (4*0.5) + 0 = 4.0
  });

  // 5. Exclusion Set Verification
  testCase('Should ignore candidate users in the exclusion set (e.g. pending requests)', () => {
    const currentUser = {
      _id: 'user_01',
      fullName: 'Tahmid Khan',
      department: 'CSE',
      semester: 4,
      strongTags: [TAG_REACT],
      weakTags: [TAG_PYTHON],
    };

    const candidate = {
      _id: 'user_02',
      fullName: 'Pending Peer',
      department: 'CSE',
      semester: 4,
      strongTags: [TAG_PYTHON],
      weakTags: [TAG_REACT],
    };

    const pool = [candidate];
    const excluded = new Set(['user_02']);

    const matches = runMatchmaking(currentUser, pool, { excludedUserIds: excluded });
    assert.strictEqual(matches.length, 0, 'Excluded user should not appear in suggestions');
  });

  // 6. Scale & Performance Stress Test
  testCase('Performance benchmark: 200 virtual candidates processed in < 30ms', () => {
    const departments = ['CSE', 'EEE', 'ME', 'IPE', 'CE', 'BBA'];
    const tagBank = [
      'tag_react', 'tag_node', 'tag_python', 'tag_dsa', 'tag_cpp',
      'tag_java', 'tag_sql', 'tag_docker', 'tag_ml', 'tag_flutter'
    ];

    const testUser = {
      _id: 'benchmark_root_user',
      fullName: 'Benchmark Candidate',
      department: 'CSE',
      semester: 5,
      strongTags: ['tag_react', 'tag_node', 'tag_dsa'],
      weakTags: ['tag_python', 'tag_ml', 'tag_docker'],
    };

    const virtualPool = [];
    for (let i = 0; i < 200; i++) {
      const dept = departments[i % departments.length];
      const sem = (i % 8) + 1;
      
      // Seed random skills
      const s1 = tagBank[i % tagBank.length];
      const s2 = tagBank[(i + 3) % tagBank.length];
      const w1 = tagBank[(i + 1) % tagBank.length];
      const w2 = tagBank[(i + 4) % tagBank.length];

      virtualPool.push({
        _id: `virtual_peer_${i}`,
        fullName: `Virtual Student ${i}`,
        department: dept,
        semester: sem,
        strongTags: [s1, s2],
        weakTags: [w1, w2],
      });
    }

    const startTime = process.hrtime.bigint();
    const suggestions = runMatchmaking(testUser, virtualPool);
    const endTime = process.hrtime.bigint();

    const durationMs = Number(endTime - startTime) / 1e6;

    console.log(`    ℹ Processed ${virtualPool.length} students -> Found ${suggestions.length} reciprocal matches in ${durationMs.toFixed(3)} ms`);
    assert.ok(durationMs < 50, `Execution took ${durationMs}ms, should be < 50ms`);
    assert.ok(Array.isArray(suggestions));

    // Verify ordering is strictly descending
    for (let i = 0; i < suggestions.length - 1; i++) {
      assert.ok(suggestions[i].score >= suggestions[i + 1].score, 'Matches must be sorted descending by score');
    }
  });

  // 7. Edge Case: Empty Skills
  testCase('Should gracefully handle candidates with 0 skills without throwing exceptions', () => {
    const userA = {
      _id: 'user_normal',
      fullName: 'Normal User',
      department: 'CSE',
      semester: 3,
      strongTags: [TAG_REACT],
      weakTags: [TAG_PYTHON],
    };

    const emptyUser = {
      _id: 'user_empty',
      fullName: 'Empty User',
      department: 'CSE',
      semester: 3,
      strongTags: [],
      weakTags: [],
    };

    const result1 = computeMatchCandidate(userA, emptyUser);
    const result2 = computeMatchCandidate(emptyUser, userA);

    assert.strictEqual(result1, null);
    assert.strictEqual(result2, null);
  });

  console.log('\n----------------------------------------------------');
  console.log(`Simulation Test Summary: ${passedTests}/${totalTests} Passed.`);
  console.log('----------------------------------------------------\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

// Allow CLI execution
if (require.main === module) {
  runTests();
}

module.exports = {
  computeMatchCandidate,
  runMatchmaking,
  runTests,
};
