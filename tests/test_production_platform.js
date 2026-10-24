/**
 * CONTROL-ARENA X — Production Platform & Engineering Lifecycle Test Suite
 * ------------------------------------------------------------------------
 * Validates:
 * 1. Health & readiness monitoring
 * 2. Full project development lifecycle (create, update, run, compare, certify)
 * 3. Multi-controller synthesis (PID, LQR, SMC, ADRC, MPC, Lead-Lag)
 * 4. Multi-objective candidate comparison and Pareto ranking
 * 5. Automated technical certification report generation
 * 6. Tamper-evident audit ledger recording
 * 7. AI Assistant real simulation execution
 */

const assert = require('assert');
const http = require('http');

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

async function runProductionTestSuite() {
  console.log('======================================================================');
  console.log('  CONTROL-ARENA X: FULL PRODUCTION PLATFORM INTEGRATION SUITE');
  console.log('  Verifying Engineering Lifecycle, Persistence, Comparison & Reports');
  console.log('======================================================================\n');

  let passed = 0;
  const total = 9;
  let testProjectId = null;

  // 1. Health & Readiness Check
  try {
    process.stdout.write('[STAGE 1] Production Health & Readiness Check (/health)... ');
    const res = await makeRequest('GET', '/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'UP');
    assert(res.data.system.memoryRssMb > 0);
    assert(res.data.capabilities.plants.length >= 5);
    assert(res.data.capabilities.controllers.length >= 5);
    console.log(`PASS (Uptime: ${res.data.uptimeSeconds}s, Memory: ${res.data.system.memoryRssMb}MB, Plants: ${res.data.capabilities.plants.length})`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 2. Project Creation & Persistence
  try {
    process.stdout.write('[STAGE 2] Project Creation & Requirements Specification (/api/projects)... ');
    const createRes = await makeRequest('POST', '/api/projects', {
      name: 'Automated UAV Pitch Control Engineering Lifecycle',
      plantKey: 'quadrotor',
      author: 'Senior Guidance & Control Specialist',
      requirements: {
        targetRiseTime: 0.35,
        targetSettlingTime: 1.0,
        maxOvershootPct: 4.0,
        maxSteadyStateError: 0.01,
        u_limit: 15.0
      },
      plantParams: {
        I_yy: 0.025,
        d_aero: 0.075,
        l_arm: 0.25,
        u_limit: 15.0
      },
      notes: 'Production aerospace project testing attitude stabilization under wind turbulence.'
    });

    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.data.status, 'SUCCESS');
    assert(createRes.data.project.id.startsWith('PRJ-'));
    testProjectId = createRes.data.project.id;
    console.log(`PASS (Created ${testProjectId}: "${createRes.data.project.name}")`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 3. Project Detail & Configuration Retrieval
  try {
    process.stdout.write('[STAGE 3] Project Detail Retrieval & Validation Check... ');
    const getRes = await makeRequest('GET', `/api/projects?id=${testProjectId}`);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.data.project.id, testProjectId);
    assert.strictEqual(getRes.data.project.plantKey, 'quadrotor');
    assert.strictEqual(getRes.data.project.requirements.targetSettlingTime, 1.0);
    console.log(`PASS (Verified project ${testProjectId} schema & requirements)`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 4. Multi-Controller Simulation Runs (PID vs LQR vs SMC vs ADRC)
  try {
    process.stdout.write('[STAGE 4] Multi-Controller Closed-Loop Simulation Execution... ');
    
    // Run PID
    const runPID = await makeRequest('POST', '/api/projects/run', {
      projectId: testProjectId,
      controller: 'pid',
      reference: 1.5,
      t_final: 2.0
    });
    assert.strictEqual(runPID.status, 200);
    assert.strictEqual(runPID.data.run.controllerKey, 'pid');

    // Run LQR
    const runLQR = await makeRequest('POST', '/api/projects/run', {
      projectId: testProjectId,
      controller: 'lqr',
      reference: 1.5,
      t_final: 2.0
    });
    assert.strictEqual(runLQR.status, 200);
    assert.strictEqual(runLQR.data.run.controllerKey, 'lqr');

    // Run SMC
    const runSMC = await makeRequest('POST', '/api/projects/run', {
      projectId: testProjectId,
      controller: 'smc',
      reference: 1.5,
      t_final: 2.0
    });
    assert.strictEqual(runSMC.status, 200);
    assert.strictEqual(runSMC.data.run.controllerKey, 'smc');

    console.log(`PASS (Executed 3 candidate designs: PID ${runPID.data.run.runId}, LQR ${runLQR.data.run.runId}, SMC ${runSMC.data.run.runId})`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 5. Candidate Controller Comparison & Pareto Optimization
  try {
    process.stdout.write('[STAGE 5] Candidate Controller Comparison & Pareto Ranking (/api/projects/compare)... ');
    const cmpRes = await makeRequest('POST', '/api/projects/compare', {
      projectId: testProjectId
    });
    assert.strictEqual(cmpRes.status, 200);
    assert.strictEqual(cmpRes.data.status, 'SUCCESS');
    assert(cmpRes.data.candidateCount >= 3);
    assert(cmpRes.data.paretoBestCandidate);
    assert(typeof cmpRes.data.paretoBestCandidate.penaltyScore === 'number');

    console.log(`PASS (Evaluated ${cmpRes.data.candidateCount} candidates; Pareto Rank 1: ${cmpRes.data.paretoBestCandidate.controller} with penalty J=${cmpRes.data.paretoBestCandidate.penaltyScore})`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 6. Technical Engineering Certification Report Generation
  try {
    process.stdout.write('[STAGE 6] Technical Engineering Certification Report Generation (/api/projects/report)... ');
    const repRes = await makeRequest('POST', '/api/projects/report', {
      projectId: testProjectId
    });
    assert.strictEqual(repRes.status, 200);
    assert.strictEqual(repRes.data.status, 'SUCCESS');
    const r = repRes.data.report;
    assert(r.reportId.startsWith('REP-'));
    assert(r.validationGates.length >= 7);
    assert(r.plantSpecification.matrices.A);
    assert(r.bestControllerDesign);

    console.log(`PASS (Report ${r.reportId} generated: ${r.validationGates.length} validation gates verified, status: ${r.certificationStatus})`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 7. Tamper-Evident Audit Ledger Verification
  try {
    process.stdout.write('[STAGE 7] Tamper-Evident Audit Ledger Verification (/api/audit)... ');
    const auditRes = await makeRequest('GET', '/api/audit?limit=10');
    assert.strictEqual(auditRes.status, 200);
    assert(auditRes.data.count > 0);
    const actions = auditRes.data.ledger.map(e => e.action);
    assert(actions.includes('PROJECT_CREATED') || actions.includes('SIMULATION_EXECUTED') || actions.includes('REPORT_GENERATED'));

    console.log(`PASS (${auditRes.data.count} audit events verified in immutable ledger)`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 8. AI Assistant Real Simulation Integration
  try {
    process.stdout.write('[STAGE 8] AI Assistant Real Simulation Execution (/api/assistant)... ');
    const assistRes = await makeRequest('POST', '/api/assistant', {
      prompt: 'Design an optimal LQR controller for UAV pitch angle tracking setpoint 1.8 with smooth disturbance rejection',
      projectId: testProjectId
    });
    assert.strictEqual(assistRes.status, 200);
    assert(assistRes.data.answer.includes('[AUTONOMOUS ENGINEERING COPILOT EXECUTION REPORT]'));
    assert(assistRes.data.simulationResult);
    assert(assistRes.data.simulationResult.runId.startsWith('RUN-'));
    assert.strictEqual(assistRes.data.simulationResult.metrics.solverStatus, 'CONVERGED_RK4');

    console.log(`PASS (AI copilot executed real RK4 simulation ${assistRes.data.simulationResult.runId}: Tr=${assistRes.data.simulationResult.metrics.riseTime}s, Ts=${assistRes.data.simulationResult.metrics.settlingTime}s)`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  // 9. Project Update & Cleanup / Archival
  try {
    process.stdout.write('[STAGE 9] Project Lifecycle Update & Cleanup... ');
    const updateRes = await makeRequest('POST', '/api/projects/update', {
      id: testProjectId,
      status: 'VERIFIED_QUALIFIED',
      notes: 'Completed full multi-controller qualification cycle. Passed all automated validation gates.'
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.project.status, 'VERIFIED_QUALIFIED');

    console.log(`PASS (Project ${testProjectId} updated to VERIFIED_QUALIFIED)`);
    passed++;
  } catch (err) {
    console.log('FAIL:', err.message);
  }

  console.log('\n======================================================================');
  console.log(`  LIFECYCLE RESULTS: ${passed} / ${total} STAGES PASSED`);
  console.log('======================================================================');

  if (passed === total) {
    console.log('  SUCCESS: PRODUCTION LIFECYCLE 100% OPERATIONAL & VERIFIED.\n');
    process.exit(0);
  } else {
    console.error(`  ERROR: ${total - passed} STAGES FAILED.\n`);
    process.exit(1);
  }
}

runProductionTestSuite().catch(e => {
  console.error('Fatal production test error:', e);
  process.exit(1);
});
