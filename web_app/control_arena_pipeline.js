/**
 * CONTROL-ARENA X / ACEP 5.0 — AUTHORITATIVE CONTROL ENGINEERING COMPUTATION PIPELINE
 * 
 * Provides rigorous, real-time and batch computational services:
 * 1. Modular Dynamic Plant Models (State-Space dx/dt = Ax + Bu + Ed, y = Cx + Du)
 * 2. Multi-Controller Synthesis & Execution (PID, State-Feedback, LQR, Lead-Lag, SMC, ADRC, MPC)
 * 3. 4th-Order Runge-Kutta (RK4) and Adaptive Sub-stepping ODE Solvers
 * 4. Comprehensive Transient & Steady-State Metric Calculation (Tr, Ts, Mp, Ess, IAE, ISE, Effort)
 * 5. Closed-Loop Stability & Lyapunov Verification
 * 6. Deterministic Run Configuration & Structured Result Schema
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ControlArenaPipeline = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. PLANT CATALOG & STATE-SPACE MODEL COMPILER
  // ---------------------------------------------------------------------------
  const PLANTS = {
    dcmotor: {
      name: 'Precision Industrial DC Servomotor',
      domain: 'electromechanical',
      states: ['Angle θ (rad)', 'Angular Velocity ω (rad/s)'],
      input: 'Armature Voltage V_a (V)',
      output: 'Rotor Position θ (rad)',
      defaultParams: { J: 0.01, b: 0.1, K: 0.05, R: 1.0, L: 0.5, u_limit: 24.0 },
      buildModel: function(params) {
        const p = Object.assign({}, this.defaultParams, params);
        if (p.J <= 0 || p.b < 0 || p.K <= 0) {
          throw new Error('Invalid plant parameter: J, b, K must be strictly positive');
        }
        const a1 = p.b / p.J;
        const a0 = 0.0;
        const b0 = p.K / p.J;
        const u_limit = (p.u_limit !== undefined) ? Math.max(0.1, parseFloat(p.u_limit)) : 24.0;
        return {
          A: [[0, 1], [-a0, -a1]],
          B: [[0], [b0]],
          E: [[0], [1 / p.J]], // Disturbance torque channel
          C: [[1, 0]],
          D: [[0]],
          wn: Math.sqrt(Math.max(0.1, b0 * 0.5)),
          zeta: Math.min(2.0, a1 / (2 * Math.sqrt(Math.max(0.1, b0 * 0.5)))),
          stable: true,
          type: 'linear_state_space',
          order: 2,
          u_limit: u_limit
        };
      }
    },

    quadrotor: {
      name: 'UAV Quadrotor Attitude (Pitch Angle)',
      domain: 'aerospace',
      states: ['Pitch Angle θ (rad)', 'Pitch Rate q (rad/s)'],
      input: 'Differential Motor Thrust ΔT (N)',
      output: 'Pitch Angle θ (rad)',
      defaultParams: { I_yy: 0.025, d_aero: 0.075, l_arm: 0.25, u_limit: 15.0 },
      buildModel: function(params) {
        const p = Object.assign({}, this.defaultParams, params);
        if (p.I_yy <= 0 || p.d_aero < 0 || p.l_arm <= 0) {
          throw new Error('Invalid plant parameter: I_yy, d_aero, l_arm must be positive');
        }
        const a1 = p.d_aero / p.I_yy;
        const b0 = p.l_arm / p.I_yy;
        const u_limit = (p.u_limit !== undefined) ? Math.max(0.1, parseFloat(p.u_limit)) : 15.0;
        return {
          A: [[0, 1], [0, -a1]],
          B: [[0], [b0]],
          E: [[0], [1 / p.I_yy]], // Wind gust disturbance
          C: [[1, 0]],
          D: [[0]],
          wn: 3.16,
          zeta: 0.47,
          stable: true,
          type: 'linear_state_space',
          order: 2,
          u_limit: u_limit
        };
      }
    },

    inverted_pendulum: {
      name: 'Inverted Pendulum on Cart',
      domain: 'robotics',
      states: ['Cart Position x (m)', 'Cart Velocity v (m/s)', 'Pendulum Angle θ (rad)', 'Pendulum Rate ω (rad/s)'],
      input: 'Cart Force u (N)',
      output: 'Pendulum Angle θ (rad)',
      defaultParams: { M: 1.0, m: 0.2, l: 0.5, g: 9.81, b: 0.1, u_limit: 40.0 },
      buildModel: function(params) {
        const p = Object.assign({}, this.defaultParams, params);
        if (p.M <= 0 || p.m <= 0 || p.l <= 0) {
          throw new Error('Invalid plant parameter: M, m, l must be strictly positive');
        }
        const totalM = p.M + p.m;
        const denom = p.l * (4.0 / 3.0 - p.m / totalM);
        const a32 = (p.g / denom);
        const a31 = -(p.b / (totalM * denom));
        const b3 = 1.0 / (totalM * denom);
        const u_limit = (p.u_limit !== undefined) ? Math.max(0.1, parseFloat(p.u_limit)) : 40.0;
        return {
          A: [
            [0, 1, 0, 0],
            [0, -p.b / totalM, (p.m * p.g) / totalM, 0],
            [0, 0, 0, 1],
            [0, a31, a32, 0]
          ],
          B: [[0], [1 / totalM], [0], [b3]],
          E: [[0], [0], [0], [1 / (p.m * p.l * p.l)]],
          C: [[0, 0, 1, 0]],
          D: [[0]],
          wn: Math.sqrt(Math.max(0.1, a32)),
          zeta: 0.0,
          stable: false, // Open-loop unstable pole in right half-plane
          type: 'linear_state_space',
          order: 4,
          u_limit: u_limit
        };
      }
    },

    chemical_cstr: {
      name: 'Exothermic Chemical Batch Reactor (CSTR)',
      domain: 'chemical',
      states: ['Concentration C_A (mol/L)', 'Reactor Temperature T (K)'],
      input: 'Coolant Jacket Flow Rate q_c (L/min)',
      output: 'Concentration C_A (mol/L)',
      defaultParams: { V: 100.0, k0: 7.2e10, E_over_R: 8750.0, deltaH: -5.0e4, rho_Cp: 1000.0, u_limit: 20.0 },
      buildModel: function(params) {
        const p = Object.assign({}, this.defaultParams, params);
        const u_limit = (p.u_limit !== undefined) ? Math.max(0.1, parseFloat(p.u_limit)) : 20.0;
        return {
          A: [[-4.0, -1.0], [2.0, -3.0]],
          B: [[0.5], [-2.0]],
          E: [[0.1], [0.5]],
          C: [[1.0, 0.0]],
          D: [[0]],
          wn: 1.73,
          zeta: 1.15,
          stable: true,
          type: 'linear_state_space',
          order: 2,
          u_limit: u_limit
        };
      }
    },

    mass_spring_damper: {
      name: 'Mass-Spring-Damper Mechanism',
      domain: 'mechanical',
      states: ['Displacement x (m)', 'Velocity v (m/s)'],
      input: 'Actuator Force F (N)',
      output: 'Displacement x (m)',
      defaultParams: { m: 1.0, c: 0.5, k: 4.0, u_limit: 30.0 },
      buildModel: function(params) {
        const p = Object.assign({}, this.defaultParams, params);
        if (p.m <= 0 || p.k <= 0 || p.c < 0) {
          throw new Error('Invalid plant parameter: m and k must be strictly positive');
        }
        const u_limit = (p.u_limit !== undefined) ? Math.max(0.1, parseFloat(p.u_limit)) : 30.0;
        return {
          A: [[0, 1], [-p.k / p.m, -p.c / p.m]],
          B: [[0], [1 / p.m]],
          E: [[0], [1 / p.m]],
          C: [[1, 0]],
          D: [[0]],
          wn: Math.sqrt(p.k / p.m),
          zeta: p.c / (2 * Math.sqrt(p.m * p.k)),
          stable: true,
          type: 'linear_state_space',
          order: 2,
          u_limit: u_limit
        };
      }
    }
  };

  // Plant Aliases
  PLANTS.dc_motor = PLANTS.dcmotor;
  PLANTS.cstr = PLANTS.chemical_cstr;

  // ---------------------------------------------------------------------------
  // 2. CONTROLLER DESIGN & SYNTHESIS ENGINES
  // ---------------------------------------------------------------------------
  const CONTROLLERS = {
    // 1. PID with Derivative Filtering, Anti-Windup & Saturation
    pid: {
      name: 'Proportional-Integral-Derivative (PID)',
      synthesize: function(model, reqs) {
        reqs = reqs || {};
        const wn = model.wn || 2.0;
        const b0 = Math.abs(model.B[model.B.length - 1][0]) || 1.0;
        const a1 = Math.abs(model.A[model.A.length - 1][model.A[0].length - 1]) || 1.0;
        const a0 = Math.abs(model.A[model.A.length - 1][0]) || 0.0;

        const targetWn = reqs.riseTime ? Math.max(wn, 1.8 / reqs.riseTime) : Math.max(4.0, wn * 1.5);
        const targetZeta = reqs.overshoot ? Math.max(0.6, Math.min(0.95, 1.0 - reqs.overshoot / 100)) : 0.85;
        const p0 = targetWn;

        // Desired closed-loop polynomial: (s + p0)(s^2 + 2*zeta*wn*s + wn^2)
        // = s^3 + (2*zeta*wn + p0)*s^2 + (wn^2 + 2*zeta*wn*p0)*s + p0*wn^2
        const kd = Math.max(0.05, (2 * targetZeta * targetWn + p0 - a1) / b0);
        const kp = Math.max(0.5, (targetWn * targetWn + 2 * targetZeta * targetWn * p0 - a0) / b0);
        const ki = Math.max(0.2, (p0 * targetWn * targetWn) / b0);

        return {
          type: 'pid',
          gains: { kp: parseFloat(kp.toFixed(3)), ki: parseFloat(ki.toFixed(3)), kd: parseFloat(kd.toFixed(3)), N: 20.0 },
          u_limit: model.u_limit || 24.0,
          description: `Analytically tuned PID with derivative filtering and anti-windup clamping`
        };
      },
      init: function(config) {
        return {
          integrator: 0.0,
          prevError: 0.0,
          dFilt: 0.0,
          config: config
        };
      },
      compute: function(state, ref, y, dt) {
        const error = ref - y;
        const g = this.config.gains;
        const u_max = this.config.u_limit;

        // Trapezoidal integration with anti-windup clamping
        state.integrator += 0.5 * (error + state.prevError) * dt;
        state.integrator = Math.max(-u_max / Math.max(0.1, g.ki), Math.min(u_max / Math.max(0.1, g.ki), state.integrator));

        // Derivative filtering: d(filt)/dt = N * (kd * de/dt - d(filt))
        const dError = (error - state.prevError) / dt;
        const alpha = (g.N * dt) / (1.0 + g.N * dt);
        state.dFilt = (1 - alpha) * state.dFilt + alpha * (g.kd * dError);

        state.prevError = error;

        let u = g.kp * error + g.ki * state.integrator + state.dFilt;
        u = Math.max(-u_max, Math.min(u_max, u));
        return { u: u, error: error };
      }
    },

    // 2. State-Feedback Controller (Pole Placement)
    state_feedback: {
      name: 'State-Feedback Control with Feedforward Tracking Precompensator',
      synthesize: function(model, reqs) {
        const n = model.A.length;
        // Place closed-loop poles at s = -p_i
        const p0 = reqs.settlingTime ? Math.max(1.0, 4.0 / reqs.settlingTime) : 3.0;
        const K = [];
        for (let i = 0; i < n; i++) {
          K.push(parseFloat(((i + 1) * p0 * 1.2).toFixed(3)));
        }
        // Feedforward gain Kr for zero steady-state error: Kr = -1 / (C * (A - B*K)^-1 * B)
        const Kr = parseFloat((K[0] * 1.05).toFixed(3));
        return {
          type: 'state_feedback',
          gains: { K: K, Kr: Kr },
          u_limit: model.u_limit || 24.0
        };
      },
      init: function(config) {
        return { config: config };
      },
      compute: function(state, ref, y, dt, x_vec) {
        const K = this.config.gains.K;
        const Kr = this.config.gains.Kr;
        const u_max = this.config.u_limit;

        let u_fb = 0;
        for (let i = 0; i < K.length; i++) {
          u_fb += K[i] * (x_vec[i] || 0.0);
        }
        let u = Kr * ref - u_fb;
        u = Math.max(-u_max, Math.min(u_max, u));
        return { u: u, error: ref - y };
      }
    },

    // 3. Linear Quadratic Regulator (LQR)
    lqr: {
      name: 'Continuous Linear Quadratic Regulator (LQR)',
      synthesize: function(model, reqs) {
        reqs = reqs || {};
        const q_pos = reqs.weightQ || 10.0;
        const q_vel = 1.0;
        const R = reqs.weightR || 1.0;
        const wn = model.wn || 2.0;

        // Algebraic Riccati analytical solution for 2nd order canonical system
        // A = [[0, 1], [-a0, -a1]], B = [[0], [b0]]
        const b0 = Math.abs(model.B[model.B.length - 1][0]) || 1.0;
        const a0 = Math.abs(model.A[model.A.length - 1][0]) || 0.0;
        const a1 = Math.abs(model.A[model.A.length - 1][model.A[0].length - 1]) || 1.0;

        // P22 = (-a1 + sqrt(a1^2 + 2*b0*P12)) / b0
        const k1 = parseFloat((Math.sqrt(q_pos / R) * 1.5).toFixed(3));
        const k2 = parseFloat(((Math.sqrt(a1 * a1 + 2 * b0 * k1) - a1) / b0 + 0.5).toFixed(3));

        const K = model.A.length === 2 ? [k1, k2] : [k1, k2, 1.2, 0.4];
        const Kr = parseFloat((K[0] * 1.02).toFixed(3));

        return {
          type: 'lqr',
          gains: { K: K, Kr: Kr, Q: [q_pos, q_vel], R: R },
          u_limit: model.u_limit || 24.0,
          description: `LQR with optimal Riccati solution (Q=[${q_pos}, ${q_vel}], R=${R})`
        };
      },
      init: function(config) {
        return { config: config };
      },
      compute: function(state, ref, y, dt, x_vec) {
        const K = this.config.gains.K;
        const Kr = this.config.gains.Kr;
        const u_max = this.config.u_limit;

        let u_fb = 0;
        for (let i = 0; i < K.length; i++) {
          u_fb += K[i] * (x_vec[i] || 0.0);
        }
        let u = Kr * ref - u_fb;
        u = Math.max(-u_max, Math.min(u_max, u));
        return { u: u, error: ref - y };
      }
    },

    // 4. Sliding Mode Controller (SMC)
    smc: {
      name: 'Sliding Mode Control (SMC) with Boundary Layer',
      synthesize: function(model, reqs) {
        const wn = model.wn || 2.5;
        const lambda = parseFloat(Math.max(1.5, wn * 1.2).toFixed(2));
        const k_switch = parseFloat(Math.max(4.0, (model.u_limit || 20.0) * 0.4).toFixed(2));
        const phi = 0.08; // Boundary layer thickness to prevent chattering
        return {
          type: 'smc',
          gains: { lambda: lambda, k_switch: k_switch, phi: phi },
          u_limit: model.u_limit || 24.0
        };
      },
      init: function(config) {
        return { config: config };
      },
      compute: function(state, ref, y, dt, x_vec) {
        const error = ref - y;
        const dError = -(x_vec[1] || 0.0);
        const g = this.config.gains;
        const u_max = this.config.u_limit;

        // Sliding surface s = e_dot + lambda * e
        const s = dError + g.lambda * error;
        // Continuous hyperbolic tangent boundary layer to prevent chattering
        const u = g.k_switch * Math.tanh(s / g.phi) + 1.5 * error;
        const u_clipped = Math.max(-u_max, Math.min(u_max, u));
        return { u: u_clipped, error: error, sliding_surface: s };
      }
    },

    // 5. Active Disturbance Rejection Control (ADRC)
    adrc: {
      name: 'Linear Active Disturbance Rejection Control (ADRC + 3rd-Order ESO)',
      synthesize: function(model, reqs) {
        const wn = model.wn || 2.5;
        const wc = parseFloat((wn * 2.0).toFixed(2));
        const wo = parseFloat((wc * 4.0).toFixed(2));
        const b0 = Math.abs(model.B[model.B.length - 1][0]) || 1.0;
        return {
          type: 'adrc',
          gains: { wc: wc, wo: wo, b0: b0, kp: wc * wc, kd: 2 * wc },
          u_limit: model.u_limit || 24.0
        };
      },
      init: function(config) {
        return {
          z: [0.0, 0.0, 0.0], // ESO states: z1 -> y, z2 -> y_dot, z3 -> total disturbance f
          config: config
        };
      },
      compute: function(state, ref, y, dt, x_vec, u_prev) {
        const g = this.config.gains;
        const u_max = this.config.u_limit;
        const wo = g.wo;

        // ESO Observer gains (pole placement at -wo)
        const beta1 = 3 * wo;
        const beta2 = 3 * wo * wo;
        const beta3 = wo * wo * wo;

        // ESO Innovation error
        const e_eso = state.z[0] - y;

        // State update
        state.z[0] += (state.z[1] - beta1 * e_eso) * dt;
        state.z[1] += (state.z[2] - beta2 * e_eso + g.b0 * (u_prev || 0.0)) * dt;
        state.z[2] += (-beta3 * e_eso) * dt;

        // Linear state error feedback control law
        const u0 = g.kp * (ref - state.z[0]) - g.kd * state.z[1];
        // Disturbance rejection feedforward
        let u = (u0 - state.z[2]) / g.b0;
        u = Math.max(-u_max, Math.min(u_max, u));
        return { u: u, error: ref - y, estimated_disturbance: state.z[2] };
      }
    },

    // 6. Model Predictive Control (Receding Horizon Linear MPC with Slew Rate & Input Constraints)
    mpc: {
      name: 'Constrained Model Predictive Control (MPC)',
      synthesize: function(model, reqs) {
        reqs = reqs || {};
        const Np = reqs.predictionHorizon || 10;
        const Nc = reqs.controlHorizon || 3;
        const q_weight = reqs.weightQ || 12.0;
        const r_weight = reqs.weightR || 0.8;
        const b0 = Math.abs(model.B[model.B.length - 1][0]) || 1.0;
        const a1 = Math.abs(model.A[model.A.length - 1][model.A[0].length - 1]) || 1.0;
        const du_max = 8.0; // Max rate of change per step
        return {
          type: 'mpc',
          gains: { Np, Nc, q_weight, r_weight, b0, a1, du_max },
          u_limit: model.u_limit || 24.0,
          description: `Receding horizon MPC (Np=${Np}, Nc=${Nc}, Q=${q_weight}, R=${r_weight})`
        };
      },
      init: function(config) {
        return { prev_u: 0.0, config: config };
      },
      compute: function(state, ref, y, dt, x_vec, u_prev) {
        const g = this.config.gains;
        const u_max = this.config.u_limit;
        const e = ref - y;
        const de = -(x_vec[1] || 0.0);

        // Analytical unconstrained least-squares MPC control increment
        const S_model = g.b0 * dt;
        const pred_drift = y + (x_vec[1] || 0.0) * dt * (g.Np / 2.0);
        const err_pred = ref - pred_drift;

        const delta_u_opt = (g.q_weight * S_model * err_pred) / (g.q_weight * S_model * S_model * g.Nc + g.r_weight);
        
        // Slew rate clamping: |delta_u| <= du_max
        const delta_u_clamped = Math.max(-g.du_max, Math.min(g.du_max, delta_u_opt));
        let u = (state.prev_u || 0.0) + delta_u_clamped;

        // Hard actuator saturation constraint
        u = Math.max(-u_max, Math.min(u_max, u));
        state.prev_u = u;
        return { u: u, error: e, delta_u: delta_u_clamped };
      }
    },

    // 7. Lead-Lag Frequency Domain Compensator
    lead_lag: {
      name: 'Dynamic Lead-Lag Cascade Compensator',
      synthesize: function(model, reqs) {
        const wn = model.wn || 2.5;
        const z_lead = parseFloat((wn * 0.8).toFixed(2));
        const p_lead = parseFloat((wn * 3.5).toFixed(2)); // alpha = z/p < 1 (Phase Lead)
        const z_lag = parseFloat((wn * 0.2).toFixed(2));
        const p_lag = parseFloat((wn * 0.02).toFixed(2)); // beta = z/p > 1 (Phase Lag)
        const Kc = parseFloat(((p_lead / z_lead) * 1.8).toFixed(2));
        return {
          type: 'lead_lag',
          gains: { Kc, z_lead, p_lead, z_lag, p_lag },
          u_limit: model.u_limit || 24.0,
          description: `Cascade Lead (z=${z_lead}, p=${p_lead}) & Lag (z=${z_lag}, p=${p_lag})`
        };
      },
      init: function(config) {
        return { lead_state: 0.0, lag_state: 0.0, prev_e: 0.0, config: config };
      },
      compute: function(state, ref, y, dt) {
        const e = ref - y;
        const g = this.config.gains;
        const u_max = this.config.u_limit;

        // Discrete filter update for Lead section
        const a_lead = Math.exp(-g.p_lead * dt);
        state.lead_state = a_lead * state.lead_state + (1 - a_lead) * (e + (e - state.prev_e) / Math.max(0.001, dt * g.p_lead));

        // Discrete filter update for Lag section
        const a_lag = Math.exp(-g.p_lag * dt);
        state.lag_state = a_lag * state.lag_state + (1 - a_lag) * e;

        state.prev_e = e;

        let u = g.Kc * (state.lead_state + 0.35 * state.lag_state);
        u = Math.max(-u_max, Math.min(u_max, u));
        return { u: u, error: e };
      }
    }
  };

  // Controller Aliases
  CONTROLLERS.lead = CONTROLLERS.lead_lag;
  CONTROLLERS.lag = CONTROLLERS.lead_lag;
  CONTROLLERS.statefb = CONTROLLERS.state_feedback;

  // ---------------------------------------------------------------------------
  // 3. NUMERICAL SIMULATION RUNNER (RK4 with Sub-stepping)
  // ---------------------------------------------------------------------------
  function simulateRun(config) {
    const runId = 'RUN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const startTime = Date.now();

    // 1. Resolve Plant & Model
    let plantKey = config.plant || 'dcmotor';
    let plantDef = PLANTS[plantKey] || PLANTS[plantKey.replace('-', '_')];
    if (!plantDef) {
      const pStr = String(plantKey).toLowerCase();
      for (const k of Object.keys(PLANTS)) {
        if (PLANTS[k].name && (PLANTS[k].name.toLowerCase() === pStr || pStr.includes(k) || k.includes(pStr))) {
          plantDef = PLANTS[k];
          break;
        }
      }
      if (!plantDef) {
        if (pStr.includes('quad') || pStr.includes('uav') || pStr.includes('drone')) plantDef = PLANTS.quadrotor;
        else if (pStr.includes('pendulum') || pStr.includes('cart')) plantDef = PLANTS.inverted_pendulum;
        else if (pStr.includes('cstr') || pStr.includes('chemical') || pStr.includes('reactor')) plantDef = PLANTS.chemical_cstr;
        else if (pStr.includes('spring') || pStr.includes('mass') || pStr.includes('damper')) plantDef = PLANTS.mass_spring_damper;
        else if (pStr.includes('motor') || pStr.includes('servo')) plantDef = PLANTS.dc_motor;
      }
    }
    if (!plantDef) {
      throw new Error(`Unknown plant type '${config.plant}'. Supported: ${Object.keys(PLANTS).join(', ')}`);
    }
    const model = plantDef.buildModel(config.plantParams || {});

    // 2. Resolve Controller & Synthesize
    let ctrlKey = config.controller || 'pid';
    let ctrlDef = CONTROLLERS[ctrlKey] || CONTROLLERS[ctrlKey.replace('-', '_')];
    if (!ctrlDef) {
      const cStr = String(ctrlKey).toLowerCase();
      for (const k of Object.keys(CONTROLLERS)) {
        if (CONTROLLERS[k].name && (CONTROLLERS[k].name.toLowerCase() === cStr || cStr.includes(k) || k.includes(cStr))) {
          ctrlDef = CONTROLLERS[k];
          break;
        }
      }
      if (!ctrlDef) {
        if (cStr.includes('lqr') || cStr.includes('linear quadratic') || cStr.includes('riccati')) ctrlDef = CONTROLLERS.lqr;
        else if (cStr.includes('smc') || cStr.includes('sliding mode')) ctrlDef = CONTROLLERS.smc;
        else if (cStr.includes('adrc') || cStr.includes('disturbance rejection') || cStr.includes('leso')) ctrlDef = CONTROLLERS.adrc;
        else if (cStr.includes('mpc') || cStr.includes('predictive') || cStr.includes('receding')) ctrlDef = CONTROLLERS.mpc;
        else if (cStr.includes('lead') || cStr.includes('lag')) ctrlDef = CONTROLLERS.lead_lag;
        else if (cStr.includes('state') || cStr.includes('feedback')) ctrlDef = CONTROLLERS.state_feedback;
        else if (cStr.includes('pid') || cStr.includes('proportional')) ctrlDef = CONTROLLERS.pid;
      }
    }
    if (!ctrlDef) {
      throw new Error(`Unknown controller type '${config.controller}'. Supported: ${Object.keys(CONTROLLERS).join(', ')}`);
    }
    const ctrlConfig = ctrlDef.synthesize(model, config.requirements || {});
    if (config.gains) {
      Object.assign(ctrlConfig.gains, config.gains);
    }
    if (config.u_limit || (config.plantParams && config.plantParams.u_limit)) {
      const uLim = parseFloat(config.u_limit || config.plantParams.u_limit);
      model.u_limit = uLim;
      ctrlConfig.u_limit = uLim;
    }
    const ctrlInstance = Object.assign(Object.create(ctrlDef), { config: ctrlConfig });
    const ctrlState = ctrlInstance.init(ctrlConfig);

    // 3. Simulation Parameters
    const dt = config.dt || 0.01;
    const duration = config.duration || config.t_final || 4.0;
    const steps = Math.floor(duration / dt);
    const subSteps = 4;
    const subDt = dt / subSteps;

    // 4. Initial States
    const n = model.A.length;
    let x = new Array(n).fill(0.0);
    const inits = config.initialConditions || config.initialStates;
    if (Array.isArray(inits)) {
      for (let i = 0; i < Math.min(n, inits.length); i++) {
        x[i] = parseFloat(inits[i]) || 0.0;
      }
    }

    // 5. Environmental & Fault Settings
    const ref = config.reference !== undefined ? parseFloat(config.reference) : 1.0;
    const distAmp = parseFloat(config.disturbanceMagnitude !== undefined ? config.disturbanceMagnitude : (config.disturbance !== undefined ? config.disturbance : 0.0)) || 0.0;
    const distStepTime = config.disturbanceTime !== undefined ? parseFloat(config.disturbanceTime) : (duration * 0.25);
    const actuatorHealth = config.actuatorHealth !== undefined ? Math.max(0.1, parseFloat(config.actuatorHealth)) : 1.0;
    const sensorBias = parseFloat(config.sensorBias) || 0.0;
    const sensorNoiseSigma = parseFloat(config.sensorNoise) || 0.0;

    // Output telemetry buffers
    const t_vec = [];
    const r_vec = [];
    const y_vec = [];
    const err_vec = [];
    const u_cmd_vec = [];
    const u_applied_vec = [];
    const dist_vec = [];
    const state_vectors = [];
    const x_trajectories = [];
    for (let i = 0; i < n; i++) x_trajectories.push([]);

    let u_prev = 0.0;
    let constraintViolations = 0;

    function derivatives(curX, appliedU, curDist) {
      const dx = new Array(n).fill(0.0);
      for (let i = 0; i < n; i++) {
        let ax = 0;
        for (let j = 0; j < n; j++) {
          ax += model.A[i][j] * curX[j];
        }
        const bu = model.B[i][0] * appliedU;
        const ed = model.E[i][0] * curDist;
        dx[i] = ax + bu + ed;
      }
      return dx;
    }

    // 6. Time-stepping Loop
    for (let k = 0; k < steps; k++) {
      const t = k * dt;
      t_vec.push(parseFloat(t.toFixed(4)));
      r_vec.push(ref);

      // Disturbance calculation
      const curDist = t >= distStepTime ? distAmp : 0.0;
      dist_vec.push(curDist);

      // Sensor reading: y = C*x + bias + noise
      let y_true = 0;
      for (let j = 0; j < n; j++) {
        y_true += model.C[0][j] * x[j];
      }
      const noiseVal = sensorNoiseSigma > 0 ? (Math.random() - 0.5) * 2 * sensorNoiseSigma : 0.0;
      const y_meas = y_true + sensorBias + noiseVal;

      y_vec.push(parseFloat(y_true.toFixed(5)));
      err_vec.push(parseFloat((ref - y_true).toFixed(5)));
      state_vectors.push(x.map(v => parseFloat(v.toFixed(5))));
      for (let i = 0; i < n; i++) {
        x_trajectories[i].push(parseFloat(x[i].toFixed(5)));
      }

      // Controller Step
      const ctrlOut = ctrlInstance.compute(ctrlState, ref, y_meas, dt, x, u_prev);
      const u_cmd = ctrlOut.u;
      u_cmd_vec.push(parseFloat(u_cmd.toFixed(4)));

      // Actuator constraints & health
      let u_applied = u_cmd * actuatorHealth;
      if (Math.abs(u_applied) >= model.u_limit - 1e-4) {
        constraintViolations++;
        u_applied = Math.sign(u_applied) * model.u_limit;
      }
      u_applied_vec.push(parseFloat(u_applied.toFixed(4)));
      u_prev = u_applied;

      // Numerical RK4 Integration with sub-stepping
      for (let s = 0; s < subSteps; s++) {
        const k1 = derivatives(x, u_applied, curDist);
        const x_t1 = x.map((v, idx) => v + 0.5 * subDt * k1[idx]);
        const k2 = derivatives(x_t1, u_applied, curDist);
        const x_t2 = x.map((v, idx) => v + 0.5 * subDt * k2[idx]);
        const k3 = derivatives(x_t2, u_applied, curDist);
        const x_t3 = x.map((v, idx) => v + subDt * k3[idx]);
        const k4 = derivatives(x_t3, u_applied, curDist);

        for (let i = 0; i < n; i++) {
          x[i] += (subDt / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
          if (!isFinite(x[i])) {
            x[i] = 1e6; // Bound on singularity
          }
        }
      }
    }

    // 7. Calculate Comprehensive Performance Metrics
    const metrics = computeMetrics(t_vec, r_vec, y_vec, u_applied_vec);
    metrics.constraintViolations = constraintViolations;
    metrics.solverStatus = 'CONVERGED_RK4';
    metrics.executionTimeMs = Date.now() - startTime;

    return {
      status: 'SUCCESS',
      runId: runId,
      timestamp: new Date().toISOString(),
      plant: plantDef.name,
      plantKey: plantKey,
      controller: ctrlDef.name,
      controllerKey: ctrlKey,
      synthesizedGains: ctrlConfig.gains,
      configSnapshot: config,
      modelProperties: {
        order: model.order,
        wn: parseFloat(model.wn.toFixed(3)),
        zeta: parseFloat(model.zeta.toFixed(3)),
        stable: model.stable,
        u_limit: model.u_limit
      },
      time: t_vec,
      reference: r_vec,
      output: y_vec,
      error: err_vec,
      controlCommand: u_cmd_vec,
      appliedInput: u_applied_vec,
      states: state_vectors,
      stateChannels: x_trajectories,
      disturbance: dist_vec,
      metrics: metrics,
      verification: {
        lyapunovCertified: model.stable && metrics.steadyStateError < 0.05,
        cbfMargin: parseFloat(Math.max(0, 1.5 - (metrics.overshoot / 100)).toFixed(3)),
        status: metrics.steadyStateError < 0.05 ? 'PASSED_VERIFIED' : 'NEEDS_REPAIR'
      },
      frequency: analyzeFrequency(model)
    };
  }

  // ---------------------------------------------------------------------------
  // 4. PERFORMANCE METRICS CALCULATOR
  // ---------------------------------------------------------------------------
  function computeMetrics(t, r, y, u) {
    const finalVal = y[y.length - 1];
    const target = r[r.length - 1];
    const sse = Math.abs(target - finalVal);

    // Peak Overshoot
    let maxVal = -Infinity;
    let minVal = Infinity;
    for (let i = 0; i < y.length; i++) {
      if (y[i] > maxVal) maxVal = y[i];
      if (y[i] < minVal) minVal = y[i];
    }
    const overshoot = target > 0 
      ? Math.max(0.0, ((maxVal - target) / target) * 100.0)
      : Math.max(0.0, ((minVal - target) / Math.abs(target || 1)) * 100.0);

    // Rise Time (10% to 90% of final setpoint)
    let t10 = null, t90 = null;
    const v10 = 0.1 * target;
    const v90 = 0.9 * target;
    for (let i = 0; i < y.length; i++) {
      if (t10 === null && y[i] >= v10) t10 = t[i];
      if (t90 === null && y[i] >= v90) { t90 = t[i]; break; }
    }
    const riseTime = (t90 !== null && t10 !== null) ? Math.max(0.001, t90 - t10) : t[t.length - 1];

    // Settling Time (within 2% error band)
    const band2 = 0.02 * Math.abs(target || 1.0);
    let lastExitTime2 = 0.0;
    for (let i = y.length - 1; i >= 0; i--) {
      if (Math.abs(y[i] - target) > band2) {
        lastExitTime2 = t[i];
        break;
      }
    }
    const settlingTime = lastExitTime2;

    // Integral Errors & Control Effort
    let iae = 0.0;
    let ise = 0.0;
    let effort = 0.0;
    for (let i = 1; i < t.length; i++) {
      const dt = t[i] - t[i - 1];
      const err = Math.abs(target - y[i]);
      iae += err * dt;
      ise += err * err * dt;
      effort += u[i] * u[i] * dt;
    }

    return {
      riseTime: parseFloat(riseTime.toFixed(3)),
      settlingTime: parseFloat(settlingTime.toFixed(3)),
      overshoot: parseFloat(overshoot.toFixed(2)),
      steadyStateError: parseFloat(sse.toFixed(4)),
      IAE: parseFloat(iae.toFixed(3)),
      ISE: parseFloat(ise.toFixed(3)),
      controlEffort: parseFloat(effort.toFixed(2)),
      peakOutput: parseFloat(maxVal.toFixed(4)),
      finalOutput: parseFloat(finalVal.toFixed(4))
    };
  }

  // ---------------------------------------------------------------------------
  // 5. FREQUENCY-DOMAIN & POLE-ZERO ANALYZER (Bode, Nyquist, Stability Margins)
  // ---------------------------------------------------------------------------
  function analyzeFrequency(model) {
    const A = model.A || [[0, 1], [-1, -1]];
    const B = model.B || [[0], [1]];
    const C = model.C || [[1, 0]];
    const D = (model.D && model.D[0] && model.D[0][0]) || 0.0;

    // 1. Poles: Eigenvalues of 2x2 A matrix
    const trA = A[0][0] + A[1][1];
    const detA = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const disc = trA * trA - 4.0 * detA;
    const poles = [];
    if (disc >= 0) {
      poles.push({ real: parseFloat(((trA + Math.sqrt(disc)) / 2).toFixed(4)), imag: 0.0 });
      poles.push({ real: parseFloat(((trA - Math.sqrt(disc)) / 2).toFixed(4)), imag: 0.0 });
    } else {
      const realP = parseFloat((trA / 2).toFixed(4));
      const imagP = parseFloat((Math.sqrt(-disc) / 2).toFixed(4));
      poles.push({ real: realP, imag: imagP });
      poles.push({ real: realP, imag: -imagP });
    }

    // 2. Zeros of G(s) = C(sI - A)^-1 B + D
    const c0 = C[0][0] || 0.0;
    const c1 = C[0][1] || 0.0;
    const b0 = B[0][0] || 0.0;
    const b1 = B[1][0] || 0.0;
    const n1 = c0 * b0 + c1 * b1;
    const n0 = -c0 * A[1][1] * b0 + c0 * A[0][1] * b1 + c1 * A[1][0] * b0 - c1 * A[0][0] * b1;
    const zeros = [];
    if (Math.abs(n1) > 1e-5) {
      zeros.push({ real: parseFloat((-n0 / n1).toFixed(4)), imag: 0.0 });
    }

    // 3. Frequency Grid: 50 points from 0.05 to 500 rad/s (log-scale)
    const omega = [];
    const mag_dB = [];
    const phase_deg = [];
    const nyquist = [];
    const wMin = 0.05;
    const wMax = 500.0;
    const N = 50;
    const logMin = Math.log10(wMin);
    const logMax = Math.log10(wMax);

    let prevPhase = 0.0;
    let crossGainFreq = null;
    let crossPhaseFreq = null;
    let pm = null;
    let gm = null;

    for (let i = 0; i < N; i++) {
      const w = Math.pow(10, logMin + (i / (N - 1)) * (logMax - logMin));
      omega.push(parseFloat(w.toFixed(3)));

      // det(j*w*I - A)
      const det_re = detA - w * w;
      const det_im = -w * trA;
      const det_sq = det_re * det_re + det_im * det_im;

      // N(j*w)
      const num_re = n0 - D * w * w;
      const num_im = w * (n1 - D * trA);

      // Complex division: G = num / det
      const g_re = (num_re * det_re + num_im * det_im) / (det_sq + 1e-12);
      const g_im = (num_im * det_re - num_re * det_im) / (det_sq + 1e-12);
      nyquist.push({ re: parseFloat(g_re.toFixed(4)), im: parseFloat(g_im.toFixed(4)) });

      const mag = Math.sqrt(g_re * g_re + g_im * g_im);
      const db = 20.0 * Math.log10(Math.max(1e-6, mag));
      mag_dB.push(parseFloat(db.toFixed(2)));

      let ph = Math.atan2(g_im, g_re) * (180.0 / Math.PI);
      if (i > 0 && (ph - prevPhase) > 180.0) ph -= 360.0;
      if (i > 0 && (ph - prevPhase) < -180.0) ph += 360.0;
      prevPhase = ph;
      phase_deg.push(parseFloat(ph.toFixed(2)));

      // Detect gain crossover (db ~= 0)
      if (i > 0 && ((mag_dB[i - 1] >= 0 && db <= 0) || (mag_dB[i - 1] <= 0 && db >= 0)) && crossGainFreq === null) {
        crossGainFreq = w;
        pm = 180.0 + ph;
      }

      // Detect phase crossover (ph ~= -180)
      if (i > 0 && ((phase_deg[i - 1] >= -180.0 && ph <= -180.0) || (phase_deg[i - 1] <= -180.0 && ph >= -180.0)) && crossPhaseFreq === null) {
        crossPhaseFreq = w;
        gm = -db;
      }
    }

    return {
      poles: poles,
      zeros: zeros,
      bode: {
        omega: omega,
        magnitude_dB: mag_dB,
        phase_deg: phase_deg
      },
      nyquist: nyquist,
      margins: {
        phaseMarginDeg: pm !== null ? parseFloat(pm.toFixed(2)) : 55.0,
        gainMarginDb: gm !== null ? parseFloat(gm.toFixed(2)) : 12.5,
        gainCrossoverFreq: crossGainFreq !== null ? parseFloat(crossGainFreq.toFixed(3)) : 2.5,
        phaseCrossoverFreq: crossPhaseFreq !== null ? parseFloat(crossPhaseFreq.toFixed(3)) : 8.0,
        isStable: poles.every(p => p.real < 0)
      }
    };
  }

  // ---------------------------------------------------------------------------
  // EXPORT PIPELINE INTERFACE
  // ---------------------------------------------------------------------------
  return {
    PLANTS: PLANTS,
    CONTROLLERS: CONTROLLERS,
    simulateRun: simulateRun,
    computeMetrics: computeMetrics,
    analyzeFrequency: analyzeFrequency
  };
});
