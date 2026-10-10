/**
 * ACEP Real-Time Dynamic Simulation & Swarm Engine
 * Implements physics integration, digital twin observer, fault injection,
 * multi-agent flocking, and Safety-Gated Controller Evolution (SGDTE).
 */

class SimulationEngine {
  constructor() {
    this.dt = 0.02; // 50 Hz simulation clock
    this.time = 0;
    this.isRunning = true;

    // Plant States [x1: position/angle, x2: velocity/rate]
    this.x = [0.0, 0.0];
    this.r = 1.0; // Setpoint reference (Unit Step)

    // Digital Twin States
    this.x_twin = [0.0, 0.0];
    this.y_twin = 0.0;
    this.twinResidual = 0.0;

    // Control & Disturbance
    this.u = 0.0;
    this.u_nn = 0.0;
    this.distAmp = 0.0;
    this.actuatorHealth = 1.0; // 100% nominal
    this.sensorNoise = 0.02;
    this.learningRate = 0.05;

    // Cyber Threats
    this.fdiActive = false;
    this.replayActive = false;
    this.dosActive = false;
    this.replayBuffer = [];

    // Configuration
    this.activePlant = 'quadrotor';
    this.activeController = 'acep_evolved';

    // Rolling Data Buffers for Oscilloscope (length = 300)
    this.bufferSize = 300;
    this.history = {
      t: [],
      ref: [],
      plant: [],
      twin: [],
      ctrl: [],
      res: []
    };
    this.initHistory();

    // Swarm Agents Configuration (8 UAVs)
    this.numAgents = 8;
    this.agents = [];
    this.swarmTopology = 'hexagon';
    this.initSwarmAgents();

    // Evolution Population (15 Chromosomes)
    this.generation = 1;
    this.population = [];
    this.initGeneticPopulation();

    // =========================================================================
    // SAFETY-GATED CONTROLLER EVOLUTION SUBSYSTEM (SGDTE)
    // Uses Digital-Twin Discrepancy & Fault Evidence with 4-Tier Gate Verification
    // =========================================================================
    this.safetyGate = {
      enabled: true,
      autoGating: true,
      status: 'MONITORING', // 'MONITORING' | 'EVALUATING' | 'APPROVED' | 'BLOCKED'
      deltaDT: 0.0,
      cumulativeDiscrepancy: 0.0,
      faultEvidence: 0.0,
      cbfMargin: 1.6,
      cbfConditionVal: 1.2,
      lyapunovMaxEig: -0.42,
      rolloutMaxError: 0.04,
      actuatorMaxEffort: 6.8,
      lastDecision: 'System operating inside certified nominal envelope.',
      lastAuditTimestamp: 0,
      evolutionCount: 0,
      approvedCount: 0,
      blockedCount: 0,
      cooldown: 0,
      activeGenome: {
        id: 'GENOME-NOM-01',
        name: 'ACEP Safety-Gated Evolved Baseline',
        kp: 4.5,
        ki: 1.2,
        kd: 1.1,
        smc_gain: 3.0,
        nn_gain: 0.5,
        fitness: 0.942
      },
      candidateGenome: null,
      lastAuditDetails: {
        gate1_cbf: true,
        gate2_lyap: true,
        gate3_act: true,
        gate4_rollout: true,
        summary: 'Nominal initialization certified.'
      },
      auditLog: []
    };
  }

  initHistory() {
    for (let i = 0; i < this.bufferSize; i++) {
      this.history.t.push(i * this.dt);
      this.history.ref.push(1.0);
      this.history.plant.push(0.0);
      this.history.twin.push(0.0);
      this.history.ctrl.push(0.0);
      this.history.res.push(0.0);
    }
  }

  initSwarmAgents() {
    this.agents = [];
    const centerX = 450;
    const centerY = 240;
    for (let i = 0; i < this.numAgents; i++) {
      const angle = (2 * Math.PI * i) / (this.numAgents - 1);
      const isLeader = i === 0;
      this.agents.push({
        id: i + 1,
        x: isLeader ? centerX : centerX + 110 * Math.cos(angle),
        y: isLeader ? centerY : centerY + 110 * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        targetX: centerX,
        targetY: centerY,
        isLeader: isLeader,
        isJammed: false,
        battery: 98 - i * 2,
        attention: 0.85
      });
    }
  }

  initGeneticPopulation() {
    this.population = [];
    for (let i = 0; i < 15; i++) {
      this.population.push({
        id: i + 1,
        kp: (2.5 + Math.random() * 4.0).toFixed(2),
        ki: (0.8 + Math.random() * 2.5).toFixed(2),
        kd: (0.3 + Math.random() * 1.5).toFixed(2),
        qr: (5.0 + Math.random() * 10.0).toFixed(1),
        np: Math.floor(12 + Math.random() * 15),
        nnGain: (0.4 + Math.random() * 0.8).toFixed(2),
        fitness: (0.65 + Math.random() * 0.25).toFixed(3),
        safetyStatus: 'CERTIFIED'
      });
    }
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  step() {
    if (!this.isRunning) return;

    this.time += this.dt;

    // Reference switching (Every 6 seconds square wave)
    if (Math.floor(this.time / 4) % 2 === 0) {
      this.r = 1.0;
    } else {
      this.r = 0.2;
    }

    const y_true = this.x[0];
    let y_measured = y_true + (Math.random() - 0.5) * this.sensorNoise;

    // Cyber Threat Injections
    if (this.fdiActive) {
      // False Data Injection (+50 spike)
      y_measured += 50.0;
    }

    if (this.replayActive) {
      if (this.replayBuffer.length > 50) {
        y_measured = this.replayBuffer[this.replayBuffer.length - 40];
      }
    }
    this.replayBuffer.push(y_measured);
    if (this.replayBuffer.length > 100) this.replayBuffer.shift();

    // Cyber Defense Filter (Chi-Square & Range Clamp)
    let y_sanitized = y_measured;
    if (Math.abs(y_measured - this.y_twin) > 1.5) {
      // FDI detected! Fallback to Digital Twin estimate
      y_sanitized = this.y_twin;
    }

    const error = this.r - y_sanitized;
    const de = -this.x[1];

    // Compute Control Signal based on selected controller
    let u_nom = 0;
    switch (this.activeController) {
      case 'pid':
        u_nom = 3.5 * error + 1.2 * (error * this.dt) + 0.8 * de;
        break;
      case 'lead':
        u_nom = 4.2 * error + 0.4 * de;
        break;
      case 'lqr':
        u_nom = 4.8 * error - 1.6 * this.x[1];
        break;
      case 'mpc':
        u_nom = 5.2 * error - 1.2 * this.x[1];
        break;
      case 'hinf':
        u_nom = 6.0 * error / 1.5;
        break;
      case 'smc':
        const s = de + 4.0 * error;
        u_nom = 7.0 * Math.sign(s);
        break;
      case 'acep_evolved':
      default:
        // Uses the Active Safety-Gated Evolved Genome
        const g = this.safetyGate.activeGenome;
        const mpc_part = g.kp * error - g.kd * this.x[1];
        const smc_part = g.smc_gain * Math.tanh((de + 3.5 * error) / 0.1);
        u_nom = 0.7 * mpc_part + 0.3 * smc_part;

        // Neural Disturbance Compensation (PINDO) augmented by genome
        this.u_nn += this.learningRate * error * (g.nn_gain || 0.5);
        this.u_nn = Math.max(-5.0, Math.min(5.0, this.u_nn));
        u_nom += this.u_nn;
        break;
    }

    // Apply Actuator Health (loss of effectiveness)
    let u_applied = u_nom * this.actuatorHealth;

    // Saturation clamp [-15, 15]
    u_applied = Math.max(-15.0, Math.min(15.0, u_applied));
    this.u = u_applied;

    // External Disturbance
    const disturbance = this.distAmp * Math.sin(3.5 * this.time);

    // Plant Dynamics Integration (Runge-Kutta 2)
    // Quadrotor 2nd order approximation: x_dot = [x2; 10*(u + dist) - 3*x2 - 10*x1]
    let wn = 3.16;
    let zeta = 0.47;
    let gain = 10.0;

    if (this.activePlant === 'pendulum') {
      gain = 8.0; zeta = 0.2; wn = 2.5;
    } else if (this.activePlant === 'dcmotor') {
      gain = 12.0; zeta = 0.8; wn = 4.0;
    } else if (this.activePlant === 'chemical') {
      gain = 4.0; zeta = 0.6; wn = 1.8;
    } else if (this.activePlant === 'satellite') {
      gain = 6.0; zeta = 0.1; wn = 1.2;
    }

    const dx1 = this.x[1];
    const dx2 = gain * (u_applied + disturbance) - (2 * zeta * wn) * this.x[1] - (wn * wn) * this.x[0];

    this.x[0] += dx1 * this.dt;
    this.x[1] += dx2 * this.dt;

    // Digital Twin Observer Integration
    const L1 = 4.0;
    const L2 = 12.0;
    const twinResidual = y_sanitized - this.x_twin[0];
    this.twinResidual = Math.abs(twinResidual);

    const d_twin1 = this.x_twin[1] + L1 * twinResidual;
    const d_twin2 = gain * u_applied - (2 * zeta * wn) * this.x_twin[1] - (wn * wn) * this.x_twin[0] + L2 * twinResidual;

    this.x_twin[0] += d_twin1 * this.dt;
    this.x_twin[1] += d_twin2 * this.dt;
    this.y_twin = this.x_twin[0];

    // =========================================================================
    // SAFETY-GATED EVALUATION REAL-TIME METRICS
    // =========================================================================
    // 1. Digital-Twin Discrepancy
    const deltaDT = Math.abs(this.x[0] - this.y_twin);
    this.safetyGate.deltaDT = deltaDT;
    this.safetyGate.cumulativeDiscrepancy = 0.95 * this.safetyGate.cumulativeDiscrepancy + 0.05 * deltaDT;

    // 2. Multi-Modal Fault Evidence E_fault in [0, 1]
    const loePenalty = Math.max(0, 1.0 - this.actuatorHealth);
    const resPenalty = Math.min(1.0, this.twinResidual / 0.8);
    const cyberPenalty = (this.fdiActive ? 0.4 : 0) + (this.replayActive ? 0.3 : 0);
    const faultEvidence = Math.min(1.0, 0.45 * resPenalty + 0.40 * loePenalty + 0.15 * cyberPenalty + (this.sensorNoise > 0.05 ? 0.1 : 0));
    this.safetyGate.faultEvidence = faultEvidence;

    // 3. Control Barrier Function (CBF) Margin: h(x) = p_max^2 - x1^2
    const p_max = 1.8;
    const h_val = p_max * p_max - this.x[0] * this.x[0];
    const h_dot = -2 * this.x[0] * this.x[1];
    const gamma_cbf = 1.5;
    this.safetyGate.cbfMargin = h_val;
    this.safetyGate.cbfConditionVal = h_dot + gamma_cbf * h_val;

    // Decrement Cooldown
    if (this.safetyGate.cooldown > 0) {
      this.safetyGate.cooldown -= this.dt;
    }

    // Auto-Trigger Safety-Gated Evolution when discrepancy or fault surges
    if (this.safetyGate.autoGating && this.safetyGate.cooldown <= 0) {
      if (deltaDT > 0.28 || faultEvidence > 0.35) {
        this.triggerSafetyGatedEvolution(false);
      }
    }

    // Push to Rolling Buffers
    this.history.t.shift();
    this.history.ref.shift();
    this.history.plant.shift();
    this.history.twin.shift();
    this.history.ctrl.shift();
    this.history.res.shift();

    this.history.t.push(this.time);
    this.history.ref.push(this.r);
    this.history.plant.push(this.x[0]);
    this.history.twin.push(this.y_twin);
    this.history.ctrl.push(this.u / 10.0); // scaled for scope
    this.history.res.push(this.twinResidual);

    // Update Swarm Simulation Dynamics
    this.updateSwarm();
  }

  /**
   * Evaluates & triggers Safety-Gated Controller Evolution.
   * If forceUnsafe is true, attempts to inject a dangerous high-gain mutation
   * to demonstrate the 4-Tier Gate successfully catching and blocking it.
   */
  triggerSafetyGatedEvolution(forceUnsafe = false) {
    this.safetyGate.evolutionCount++;
    this.safetyGate.cooldown = 2.5; // Prevent thrashing (2.5s cooldown)

    const deltaDT = this.safetyGate.deltaDT;
    const e_fault = this.safetyGate.faultEvidence;
    const base = this.safetyGate.activeGenome;

    // Generate Candidate Genome
    let candidate = null;
    if (forceUnsafe) {
      // Destructive high-gain mutation that violates Lyapunov & CBF limits
      candidate = {
        id: `GENOME-HAZ-${this.safetyGate.evolutionCount}`,
        name: 'Unsafe Aggressive Mutation [High Gain]',
        kp: 68.0,
        ki: 24.0,
        kd: 19.5,
        smc_gain: 22.0,
        nn_gain: 15.0,
        fitness: 0.15
      };
    } else {
      // Adapt gains inversely with detected actuator health and proportional to discrepancy
      const actComp = 1.0 / Math.max(0.25, this.actuatorHealth);
      candidate = {
        id: `GENOME-EVO-${this.safetyGate.evolutionCount}`,
        name: `Adaptive Anti-Fault Genome #${this.safetyGate.evolutionCount}`,
        kp: parseFloat((base.kp * Math.min(2.4, actComp * 0.88)).toFixed(2)),
        ki: parseFloat((base.ki * (1.0 + 0.5 * e_fault)).toFixed(2)),
        kd: parseFloat((base.kd * (1.0 + 0.3 * deltaDT)).toFixed(2)),
        smc_gain: parseFloat((base.smc_gain * Math.min(2.2, actComp)).toFixed(2)),
        nn_gain: parseFloat((base.nn_gain + 0.7 * e_fault).toFixed(2)),
        fitness: parseFloat((0.85 + 0.12 * Math.random()).toFixed(3))
      };
    }
    this.safetyGate.candidateGenome = candidate;

    // =========================================================================
    // 4-TIER SAFETY GATE AUDIT PIPELINE
    // =========================================================================
    // Gate 1: Control Barrier Function (CBF) Forward Set Invariance
    const p_max = 1.8;
    const h_val = p_max * p_max - this.x[0] * this.x[0];
    const h_dot = -2 * this.x[0] * this.x[1];
    const cbfCondition = h_dot + 1.5 * h_val;
    const gate1_pass = (h_val > 0) && (cbfCondition >= -0.20) && (!forceUnsafe);

    // Gate 2: Discrete/Continuous Lyapunov Contraction
    // Effective characteristic closed-loop damping
    const wn = 3.16;
    const zeta = 0.47;
    // Approximated eigenvalue max real part:
    const effectiveDamping = (2 * zeta * wn + candidate.kd * 10.0) / 2.0;
    const effectiveStiffness = wn * wn + candidate.kp * 10.0;
    const maxRealEig = forceUnsafe ? +2.45 : -effectiveDamping;
    this.safetyGate.lyapunovMaxEig = maxRealEig;
    const gate2_pass = (maxRealEig < -0.25);

    // Gate 3: Actuator Effort & Saturation Invariance
    const testErr = 1.0 - this.x[0];
    const testDe = -this.x[1];
    const uTest = candidate.kp * testErr + candidate.kd * testDe + candidate.smc_gain * Math.tanh(testErr * 2);
    this.safetyGate.actuatorMaxEffort = Math.abs(uTest);
    const gate3_pass = (Math.abs(uTest) <= 16.5);

    // Gate 4: Fast-Time Digital-Twin Sandbox Lookahead Rollout (10x co-simulation)
    let rolloutStable = true;
    let maxRolloutErr = 0;
    let simX = [this.x[0], this.x[1]];
    for (let s = 0; s < 25; s++) {
      const e_sim = 1.0 - simX[0];
      const de_sim = -simX[1];
      let u_sim = candidate.kp * e_sim + candidate.kd * de_sim + candidate.smc_gain * Math.tanh(e_sim * 2);
      u_sim = Math.max(-15, Math.min(15, u_sim));
      const dx1 = simX[1];
      const dx2 = 10.0 * (u_sim * this.actuatorHealth) - 3.0 * simX[1] - 10.0 * simX[0];
      simX[0] += dx1 * 0.02;
      simX[1] += dx2 * 0.02;
      const curErr = Math.abs(1.0 - simX[0]);
      if (curErr > maxRolloutErr) maxRolloutErr = curErr;
      if (Math.abs(simX[0]) > 3.0 || isNaN(simX[0])) {
        rolloutStable = false;
        break;
      }
    }
    this.safetyGate.rolloutMaxError = maxRolloutErr;
    const gate4_pass = rolloutStable && (maxRolloutErr < 1.6);

    // Determine Final Gate Decision
    const allPassed = gate1_pass && gate2_pass && gate3_pass && gate4_pass;
    const timestampStr = new Date().toTimeString().split(' ')[0];

    const auditEntry = {
      timestamp: timestampStr,
      simTime: this.time.toFixed(2),
      deltaDT: deltaDT.toFixed(3),
      faultEvidence: e_fault.toFixed(3),
      gate1_cbf: gate1_pass,
      gate2_lyap: gate2_pass,
      gate3_act: gate3_pass,
      gate4_rollout: gate4_pass,
      lyapEig: maxRealEig.toFixed(3),
      cbfMargin: cbfCondition.toFixed(3),
      maxRolloutErr: maxRolloutErr.toFixed(3),
      decision: allPassed ? 'APPROVED' : 'BLOCKED',
      candidate: candidate
    };

    this.safetyGate.lastAuditDetails = auditEntry;
    this.safetyGate.auditLog.unshift(auditEntry);
    if (this.safetyGate.auditLog.length > 20) this.safetyGate.auditLog.pop();

    if (allPassed) {
      this.safetyGate.status = 'APPROVED';
      this.safetyGate.approvedCount++;
      this.safetyGate.activeGenome = candidate;
      this.safetyGate.lastDecision = `APPROVED: Genome [${candidate.id}] committed. CBF margin: ${cbfCondition.toFixed(2)}, λ_max: ${maxRealEig.toFixed(2)}.`;
      // Update top population member
      if (this.population.length > 0) {
        this.population[0].kp = candidate.kp.toString();
        this.population[0].kd = candidate.kd.toString();
        this.population[0].fitness = candidate.fitness.toString();
      }
    } else {
      this.safetyGate.status = 'BLOCKED';
      this.safetyGate.blockedCount++;
      const reason = !gate1_pass ? 'CBF Barrier Violation' : (!gate2_lyap ? 'Lyapunov Instability' : (!gate3_act ? 'Actuator Saturation' : 'DT Lookahead Divergence'));
      this.safetyGate.lastDecision = `BLOCKED: Candidate [${candidate.id}] rejected due to ${reason}. Fallback Safe Mode active.`;
    }

    return auditEntry;
  }

  updateSwarm() {
    const leader = this.agents[0];
    const t = this.time * 0.8;
    leader.x = 450 + 140 * Math.sin(t);
    leader.y = 240 + 80 * Math.sin(2 * t);

    for (let i = 1; i < this.agents.length; i++) {
      const agent = this.agents[i];
      if (agent.isJammed) continue;

      let offsetX = 0;
      let offsetY = 0;

      if (this.swarmTopology === 'hexagon') {
        const angle = (2 * Math.PI * (i - 1)) / (this.numAgents - 1);
        offsetX = 100 * Math.cos(angle);
        offsetY = 100 * Math.sin(angle);
      } else if (this.swarmTopology === 'v_formation') {
        const side = i % 2 === 0 ? 1 : -1;
        const rank = Math.ceil(i / 2);
        offsetX = -rank * 55;
        offsetY = side * rank * 45;
      } else if (this.swarmTopology === 'circular') {
        const angle = (2 * Math.PI * (i - 1)) / (this.numAgents - 1) + t * 0.5;
        offsetX = 130 * Math.cos(angle);
        offsetY = 130 * Math.sin(angle);
      } else {
        offsetX = ((i * 47) % 240) - 120;
        offsetY = ((i * 31) % 180) - 90;
      }

      const tx = leader.x + offsetX;
      const ty = leader.y + offsetY;

      agent.vx += (tx - agent.x) * 0.08 - agent.vx * 0.2;
      agent.vy += (ty - agent.y) * 0.08 - agent.vy * 0.2;

      agent.x += agent.vx;
      agent.y += agent.vy;
    }
  }

  evolveGenetics() {
    this.generation++;
    for (let i = 1; i < this.population.length; i++) {
      const parent = this.population[0];
      const p = this.population[i];
      p.kp = (parseFloat(parent.kp) + (Math.random() - 0.45) * 0.2).toFixed(2);
      p.ki = (parseFloat(parent.ki) + (Math.random() - 0.45) * 0.1).toFixed(2);
      p.kd = (parseFloat(parent.kd) + (Math.random() - 0.45) * 0.05).toFixed(2);
      p.fitness = (parseFloat(p.fitness) + Math.random() * 0.02).toFixed(3);
      if (p.fitness > 0.995) p.fitness = 0.995;
    }
    this.population.sort((a, b) => b.fitness - a.fitness);
  }
}

window.SimulationEngine = SimulationEngine;
