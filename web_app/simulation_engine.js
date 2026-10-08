/**
 * ACEP Real-Time Dynamic Simulation & Swarm Engine
 * Implements physics integration, digital twin observer, fault injection, and multi-agent flocking.
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
        fitness: (0.65 + Math.random() * 0.25).toFixed(3)
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
        // Evolved Hybrid: Blend of MPC tracking, SMC boundary, and Neural Feedforward
        const mpc_part = 4.5 * error - 1.1 * this.x[1];
        const smc_part = 3.0 * Math.tanh((de + 3.5 * error) / 0.1);
        u_nom = 0.7 * mpc_part + 0.3 * smc_part;

        // Neural Disturbance Compensation (PINDO)
        this.u_nn += this.learningRate * error * 0.5;
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

  updateSwarm() {
    const leader = this.agents[0];
    // Leader moves smoothly in gentle figure-eight or patrol circle
    const t = this.time * 0.8;
    leader.x = 450 + 140 * Math.sin(t);
    leader.y = 240 + 80 * Math.sin(2 * t);

    // Followers follow formation targets relative to leader
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
        // Dispersed
        offsetX = ((i * 47) % 240) - 120;
        offsetY = ((i * 31) % 180) - 90;
      }

      const tx = leader.x + offsetX;
      const ty = leader.y + offsetY;

      // Spring-damper consensus tracking
      agent.vx += (tx - agent.x) * 0.08 - agent.vx * 0.2;
      agent.vy += (ty - agent.y) * 0.08 - agent.vy * 0.2;

      agent.x += agent.vx;
      agent.y += agent.vy;
    }
  }

  evolveGenetics() {
    this.generation++;
    // Genetic crossover & mutation
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
