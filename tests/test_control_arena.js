/**
 * CONTROL-ARENA X — Automated Regression & Verification Test Suite
 * Tests A through L: Strict numerical & functional validation
 */

const assert = require('assert');
const http = require('http');
const pipeline = require('../web_app/control_arena_pipeline.js');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('======================================================================');
  console.log('  CONTROL-ARENA X: AUTOMATED REGRESSION & VERIFICATION SUITE');
  console.log('  Verifying Real Engineering Calculations Across Tests A -> L');
  console.log('======================================================================\n');

  let passedCount = 0;
  let totalCount = 12;

  // -------------------------------------------------------------------------
  // TEST A: Reference Sensitivity
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST A] Reference Sensitivity (r=1.0 vs r=2.5)... ');
    const sim1 = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      reference: 1.0,
      t_final: 2.0,
      dt: 0.01
    });
    const sim2 = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      reference: 2.5,
      t_final: 2.0,
      dt: 0.01
    });

    // Assert outputs are not constant or canned
    assert.notStrictEqual(sim1.output[sim1.output.length - 1], sim2.output[sim2.output.length - 1]);
    assert(Math.abs(sim1.output[sim1.output.length - 1] - 1.0) < 0.05, `Expected tracking of 1.0, got ${sim1.output[sim1.output.length - 1]}`);
    assert(Math.abs(sim2.output[sim2.output.length - 1] - 2.5) < 0.1, `Expected tracking of 2.5, got ${sim2.output[sim2.output.length - 1]}`);
    
    // Trajectory ratio must reflect reference ratio
    const ratio = sim2.output[sim2.output.length - 1] / sim1.output[sim1.output.length - 1];
    assert(Math.abs(ratio - 2.5) < 0.2, `Expected response ratio ~2.5, got ${ratio}`);

    console.log('PASS (Delta y_final = ' + (sim2.output[sim2.output.length - 1] - sim1.output[sim1.output.length - 1]).toFixed(3) + ')');
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST B: Plant Parameter Sensitivity
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST B] Plant Parameter Sensitivity (J=0.01 vs J=0.05)... ');
    const simFast = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      gains: { kp: 6.0, ki: 2.0, kd: 0.1 },
      reference: 1.0,
      plantParams: { J: 0.01 },
      t_final: 2.0,
      dt: 0.01
    });
    const simSlow = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      gains: { kp: 6.0, ki: 2.0, kd: 0.1 },
      reference: 1.0,
      plantParams: { J: 0.05 },
      t_final: 2.0,
      dt: 0.01
    });

    // Rise time with 5x higher inertia must be significantly larger
    assert(simSlow.metrics.riseTime > simFast.metrics.riseTime,
      `Expected riseTime(J=0.05) > riseTime(J=0.01), got ${simSlow.metrics.riseTime} vs ${simFast.metrics.riseTime}`);

    console.log(`PASS (Tr_fast=${simFast.metrics.riseTime}s < Tr_slow=${simSlow.metrics.riseTime}s)`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST C: Controller Execution (PID vs LQR vs SMC vs ADRC)
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST C] Controller Execution (PID vs LQR vs SMC)... ');
    const simPID = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      reference: 1.0,
      t_final: 1.5,
      dt: 0.01
    });
    const simLQR = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'lqr',
      reference: 1.0,
      t_final: 1.5,
      dt: 0.01
    });
    const simSMC = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'smc',
      reference: 1.0,
      t_final: 1.5,
      dt: 0.01
    });

    // Control laws must execute their separate algorithms and produce distinct control profiles
    assert(simPID.controllerKey === 'pid');
    assert(simLQR.controllerKey === 'lqr');
    assert(simSMC.controllerKey === 'smc');
    
    // Initial control effort difference between PID and LQR/SMC
    const u0_PID = simPID.controlCommand[0];
    const u0_LQR = simLQR.controlCommand[0];
    const u0_SMC = simSMC.controlCommand[0];
    assert.notStrictEqual(u0_PID, u0_LQR);
    assert(Array.isArray(simLQR.synthesizedGains.K), 'LQR must synthesize Riccati gain vector K');

    console.log(`PASS (PID u0=${u0_PID}, LQR u0=${u0_LQR}, SMC u0=${u0_SMC})`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST D: Disturbance Injection
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST D] Disturbance Injection (d=0 vs d=2.0)... ');
    const simNominal = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      reference: 1.0,
      disturbance: 0.0,
      t_final: 2.0,
      dt: 0.01
    });
    const simDisturbed = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      reference: 1.0,
      disturbance: 2.0,
      t_final: 2.0,
      dt: 0.01
    });

    // Disturbed system must exhibit higher control effort to reject disturbance
    assert(simDisturbed.metrics.controlEffort > simNominal.metrics.controlEffort,
      `Expected effort(d=2) > effort(d=0), got ${simDisturbed.metrics.controlEffort} vs ${simNominal.metrics.controlEffort}`);
    
    // Verify disturbance channel exists and was recorded in output structure
    assert(simDisturbed.disturbance.some(d => Math.abs(d) > 0.01));

    console.log(`PASS (Effort with d: ${simDisturbed.metrics.controlEffort} > Nominal: ${simNominal.metrics.controlEffort})`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST E: Initial Conditions
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST E] Initial Conditions (x0=[0,0] vs x0=[1.5, 0])... ');
    const simZero = pipeline.simulateRun({
      plant: 'mass_spring_damper',
      controller: 'pid',
      reference: 0.0,
      initialStates: [0, 0],
      t_final: 2.0,
      dt: 0.01
    });
    const simDisplaced = pipeline.simulateRun({
      plant: 'mass_spring_damper',
      controller: 'pid',
      reference: 0.0,
      initialStates: [1.5, 0],
      t_final: 2.0,
      dt: 0.01
    });

    assert.strictEqual(simZero.output[0], 0);
    assert.strictEqual(simDisplaced.output[0], 1.5);
    // Regulation brings both toward 0
    assert(Math.abs(simDisplaced.output[simDisplaced.output.length - 1]) < 0.1);

    console.log(`PASS (Initial output y(0) = ${simDisplaced.output[0]} -> regulates to ${simDisplaced.output[simDisplaced.output.length - 1]})`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST F: Actuator Saturation
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST F] Actuator Saturation (u_limit = 5.0)... ');
    const simSat = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      reference: 10.0, // High reference demanding excessive control effort
      t_final: 1.0,
      dt: 0.01,
      plantParams: { u_limit: 5.0 }
    });

    const maxApplied = Math.max(...simSat.appliedInput.map(Math.abs));
    assert(maxApplied <= 5.0001, `Applied control input exceeded limit: ${maxApplied} > 5.0`);
    assert(simSat.metrics.constraintViolations > 0, 'Constraint violations counter must detect saturation events');

    console.log(`PASS (Max |u_applied| = ${maxApplied.toFixed(3)} <= 5.0, Saturation events = ${simSat.metrics.constraintViolations})`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST G: Graph-Data Consistency
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST G] Graph-Data Consistency & Mathematical Precision... ');
    const sim = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'lqr',
      reference: 1.5,
      t_final: 2.0,
      dt: 0.01
    });

    const N = sim.time.length;
    assert.strictEqual(sim.reference.length, N);
    assert.strictEqual(sim.output.length, N);
    assert.strictEqual(sim.error.length, N);
    assert.strictEqual(sim.controlCommand.length, N);
    assert.strictEqual(sim.appliedInput.length, N);
    assert.strictEqual(sim.states.length, N);

    // Verify mathematical identity: e(t) = r(t) - y(t)
    for (let i = 0; i < N; i++) {
      const calcErr = sim.reference[i] - sim.output[i];
      assert(Math.abs(calcErr - sim.error[i]) < 1e-3, `Mismatch in error at index ${i}`);
      assert(isFinite(sim.output[i]), `Non-finite output at index ${i}`);
    }

    console.log(`PASS (All ${N} points verified: error = ref - output, 0 non-finite values)`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST H: 3D Synchronization
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST H] 3D State Synchronization... ');
    const sim = pipeline.simulateRun({
      plant: 'dc_motor',
      controller: 'pid',
      reference: 1.0,
      t_final: 1.0,
      dt: 0.01
    });

    // Check state matrix dimensionality
    assert(sim.states.length > 0);
    assert.strictEqual(sim.states[0].length, 2); // 2nd order DC motor [omega, i]
    
    // Output y must equal C * x
    sim.states.forEach((x_k, idx) => {
      // y = x1 (angular velocity)
      assert(Math.abs(x_k[0] - sim.output[idx]) < 1e-4, `3D state y != x0 at index ${idx}`);
    });

    console.log(`PASS (1:1 physical state vector alignment with 3D kinematic output)`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST I: AI Design & Simulation API Integration
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST I] AI Design & Simulation API (/api/simulate)... ');
    const res = await makeRequest('POST', '/api/simulate', {
      plant: 'quadrotor',
      controller: 'lqr',
      reference: 2.0,
      t_final: 2.0
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'SUCCESS');
    assert(res.data.runId.startsWith('RUN-'));
    assert(res.data.output.length > 50);
    assert.strictEqual(res.data.plant, 'UAV Quadrotor Attitude (Pitch Angle)');

    console.log(`PASS (API returned valid runId: ${res.data.runId}, ${res.data.output.length} points)`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST J: Failure & Robustness Handling
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST J] Failure Handling (invalid plant & NaN rejection)... ');
    const resBadPlant = await makeRequest('POST', '/api/simulate', {
      plant: 'non_existent_fake_plant',
      controller: 'pid'
    });
    // System must not crash and must return clean error
    assert(resBadPlant.status === 400 || (resBadPlant.data && resBadPlant.data.status === 'ERROR'));

    // Negative mass or zero inertia in pipeline must throw descriptive error
    let threw = false;
    try {
      pipeline.simulateRun({
        plant: 'dc_motor',
        controller: 'pid',
        plantParams: { J: -0.5 }
      });
    } catch (e) {
      threw = true;
      assert(e.message.includes('Invalid plant parameter'));
    }
    assert(threw, 'Pipeline must reject negative mass/inertia');

    console.log('PASS (Properly rejected invalid inputs with structured errors)');
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST K: Numerical Reproducibility
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST K] Numerical Reproducibility... ');
    const cfg = {
      plant: 'inverted_pendulum',
      controller: 'lqr',
      reference: 0.0,
      initialStates: [0.1, 0, 0, 0],
      t_final: 1.0,
      dt: 0.01
    };
    const run1 = pipeline.simulateRun(cfg);
    const run2 = pipeline.simulateRun(cfg);

    let maxDiff = 0;
    for (let i = 0; i < run1.output.length; i++) {
      const diff = Math.abs(run1.output[i] - run2.output[i]);
      if (diff > maxDiff) maxDiff = diff;
    }
    assert(maxDiff < 1e-12, `Deterministic runs deviated by ${maxDiff}`);

    console.log(`PASS (Identical results within machine precision: max dev = ${maxDiff})`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST L: Regression Check (Existing Working APIs)
  // -------------------------------------------------------------------------
  try {
    process.stdout.write('[TEST L] Regression Check (Existing APIs: /api/plants, /api/rl_predict)... ');
    const plantsRes = await makeRequest('GET', '/api/plants');
    const plantCount = Array.isArray(plantsRes.data.plants) ? plantsRes.data.plants.length : Object.keys(plantsRes.data.plants).length;
    assert(plantCount >= 5);

    const rlRes = await makeRequest('POST', '/api/rl_predict', {
      observations: [0.5, 0.1, 0.0, -0.2]
    });
    assert.strictEqual(rlRes.status, 200);
    assert.strictEqual(rlRes.data.status, 'SUCCESS');
    assert(typeof rlRes.data.action === 'number');

    console.log(`PASS (Existing APIs 100% operational, RL action=${rlRes.data.action})`);
    passedCount++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  console.log('\n======================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedCount} / ${totalCount} PASSED`);
  console.log('======================================================================');

  if (passedCount === totalCount) {
    console.log('  SUCCESS: ALL TESTS A THROUGH L PASSED WITH FULL MATHEMATICAL RIGOR.\n');
    process.exit(0);
  } else {
    console.error(`  ERROR: ${totalCount - passedCount} TESTS FAILED.\n`);
    process.exit(1);
  }
}

runAllTests().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
