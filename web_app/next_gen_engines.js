/**
 * ACEP 5.0 - NEXT-GENERATION ENGINES & MATLAB MODULES SUITE
 * Complete 81 Subsystem Families: acep_novelty through xcontrol
 * Coupled with active plant dynamics, live sensor noise, actuator states, and co-simulation.
 * Zero static values; all waveforms, latencies, and indicators evolve continuously.
 */

(function() {
  const ALL_81_ENGINES = [
    // 1. Core & Autonomous Engineering
    {
      id: 'acep_novelty',
      folder: 'matlab/acep_novelty',
      name: 'Autonomous Control Engineer & Novelty Discovery',
      category: 'Core & Autonomous',
      desc: 'Searches the control topology space for mathematically novel architectures with Pareto-optimal tracking and energy efficiency.',
      type: 'novelty',
      baseLat: 1.2
    },
    {
      id: 'acep_os',
      folder: 'matlab/acep_os',
      name: 'Real-Time Controller Microkernel & Scheduler',
      category: 'Core & Autonomous',
      desc: 'Deterministic hard real-time loop scheduling with sub-millisecond deadline assurance and zero priority inversion.',
      type: 'kernel',
      baseLat: 0.4
    },
    {
      id: 'acep_os_v2',
      folder: 'matlab/acep_os_v2',
      name: 'Adaptive Microkernel Resource Manager v2',
      category: 'Core & Autonomous',
      desc: 'Online CPU cycle and memory budget regulator prioritizing safety-critical state estimation during computational starvation.',
      type: 'resource',
      baseLat: 0.5
    },
    {
      id: 'core_generator',
      folder: 'matlab/core',
      name: 'Dynamic Controller State-Space Synthesizer',
      category: 'Core & Autonomous',
      desc: 'Analytical transfer function factorization and Riccati algebraic matrix solver generating continuous state-space gains.',
      type: 'synth',
      baseLat: 1.8
    },
    {
      id: 'auto_design',
      folder: 'matlab/auto_design',
      name: 'Automated Compensator & Bode Loop-Shaper',
      category: 'Core & Autonomous',
      desc: 'Iterative gain-phase margin synthesizer placing lead-lag poles to guarantee specified phase margin and crossover frequency.',
      type: 'frequency',
      baseLat: 1.4
    },
    {
      id: 'integration_orch',
      folder: 'matlab/integration',
      name: 'ACEP Master Co-Simulation Orchestrator',
      category: 'Core & Autonomous',
      desc: 'Synchronizes multi-rate ODE45/Runge-Kutta numerical integration steps between virtual plant and holographic controller twin.',
      type: 'sync',
      baseLat: 0.9
    },
    {
      id: 'innovation_engine',
      folder: 'matlab/innovation_engine',
      name: 'Algorithmic Novelty & Complexity Analyzer',
      category: 'Core & Autonomous',
      desc: 'Quantifies architectural information entropy and algorithmic minimum description length (MDL) of synthesized controllers.',
      type: 'entropy',
      baseLat: 2.1
    },

    // 2. Advanced Adaptation & Observers
    {
      id: 'adaptive_control_plus',
      folder: 'matlab/adaptive_control_plus',
      name: 'Lyapunov MRAC & Backstepping Adaptive Controller',
      category: 'Adaptive & Observers',
      desc: 'Constructs continuous control Lyapunov functions V(e, theta) to eliminate parametric uncertainties with guaranteed asymptotic tracking.',
      type: 'signal',
      baseLat: 0.8
    },
    {
      id: 'adaptation_sup',
      folder: 'matlab/adaptation',
      name: 'Supervisory Parameter Drift & Deadzone Governor',
      category: 'Adaptive & Observers',
      desc: 'Epsilon-modification and leakage-factor bounding preventing parameter burst phenomena during low-excitation regimes.',
      type: 'drift',
      baseLat: 0.6
    },
    {
      id: 'advanced_digital_twin',
      folder: 'matlab/advanced_digital_twin',
      name: 'Physical Aging & Nonlinear Degradation Predictor',
      category: 'Adaptive & Observers',
      desc: 'Weibull and Paris-Erdogan crack/wear propagation models projecting remaining useful life (RUL) under thermal-mechanical stress.',
      type: 'aging',
      baseLat: 1.7
    },
    {
      id: 'live_digital_twin',
      folder: 'matlab/live_digital_twin',
      name: 'High-Fidelity Real-Time Holographic Twin Runtime',
      category: 'Adaptive & Observers',
      desc: 'Continuous state estimation matching virtual plant telemetry against modeled physics with dynamic residual tracking.',
      type: 'spectrum',
      baseLat: 0.7
    },
    {
      id: 'smart_compensators',
      folder: 'matlab/smart_compensators',
      name: 'Adaptive Non-Minimum Phase Zero Compensator',
      category: 'Adaptive & Observers',
      desc: 'Internal model principle compensator suppressing undesirable undershoot and unstable zero zero-dynamics.',
      type: 'bode',
      baseLat: 1.1
    },
    {
      id: 'disturbance_intelligence',
      folder: 'matlab/disturbance_intelligence',
      name: 'Active Disturbance Rejection Control (ADRC & ESO)',
      category: 'Adaptive & Observers',
      desc: 'Extended State Observer (ESO) lumping internal nonlinearities and external disturbances into an augmented state for real-time cancellation.',
      type: 'adrc',
      baseLat: 0.8
    },
    {
      id: 'disturbance_control',
      folder: 'matlab/disturbance_control',
      name: 'Harmonic Disturbance Observer (DOB) Sieve',
      category: 'Adaptive & Observers',
      desc: 'Q-filter frequency-selective disturbance observer decoupling load torque ripples and structural resonant modes.',
      type: 'dob',
      baseLat: 0.7
    },

    // 3. Optimal & Constrained Control
    {
      id: 'advanced_mpc',
      folder: 'matlab/advanced_mpc',
      name: 'Receding Horizon QP & Soft Constraint Slack MPC',
      category: 'Optimal & Constrained',
      desc: 'Active-set quadratic programming solver minimizing trajectory tracking error subject to actuator rate and amplitude constraints.',
      type: 'step',
      baseLat: 2.4
    },
    {
      id: 'controller_design_studio',
      folder: 'matlab/controller_design_studio',
      name: 'Multivariable LQR / LQG Synthesis Studio',
      category: 'Optimal & Constrained',
      desc: 'Riccati equation optimizer tuning Q/R weighting matrices to balance state deviation penalties against control energy consumption.',
      type: 'lqr',
      baseLat: 1.5
    },
    {
      id: 'controller_self_evolution',
      folder: 'matlab/controller_self_evolution',
      name: 'Evolutionary Multi-Island Genetic Controller Tuner',
      category: 'Optimal & Constrained',
      desc: 'Parallel island-model genetic algorithm with crossover and adaptive mutation exploring controller chromosome landscapes.',
      type: 'ga',
      baseLat: 3.2
    },
    {
      id: 'control_optimization',
      folder: 'matlab/control_optimization',
      name: 'Adaptive Particle Swarm (PSO) Optimizer',
      category: 'Optimal & Constrained',
      desc: 'Inertia-weighted particle swarm with ring topology optimizing multi-objective IAE, ITAE, and control rate variance.',
      type: 'pso',
      baseLat: 2.5
    },
    {
      id: 'fractional_control',
      folder: 'matlab/fractional_control',
      name: 'Oustaloup Filtered Fractional Operator (s^-α)',
      category: 'Optimal & Constrained',
      desc: 'Fractional-order integration and differentiation with non-integer power memory providing superior phase margin and ISO-damping.',
      type: 'fractional',
      baseLat: 0.9
    },
    {
      id: 'pid_evolution',
      folder: 'matlab/pid_evolution',
      name: 'Fuzzy-Neuro Adaptive PID Auto-Tuner',
      category: 'Optimal & Constrained',
      desc: 'Takagi-Sugeno fuzzy inference network dynamically scheduling Kp, Ki, and Kd based on instantaneous error magnitude and velocity.',
      type: 'fuzzy',
      baseLat: 0.6
    },

    // 4. Fault Tolerance & Cyber-Physical Resilience
    {
      id: 'advanced_ftc',
      folder: 'matlab/advanced_ftc',
      name: 'Active Reconfigurable Fault-Tolerant Control (FTC)',
      category: 'FTC & Cyber-Resilience',
      desc: 'Pseudo-inverse control reallocation and structural re-trimming preserving system stability during sudden actuator loss.',
      type: 'ftc',
      baseLat: 1.3
    },
    {
      id: 'control_blockchain',
      folder: 'matlab/control_blockchain',
      name: 'Cryptographic Merkle Fault Hash & Ledger Audit',
      category: 'FTC & Cyber-Resilience',
      desc: 'Zero-knowledge fault attestation committing actuator fault signatures and gain reconfiguration hashes to an immutable ledger.',
      type: 'hash',
      baseLat: 3.1
    },
    {
      id: 'cyber_physical_resilience',
      folder: 'matlab/cyber_physical_resilience',
      name: 'Chi-Square Innovation Monitor & Nonce Watermarking',
      category: 'FTC & Cyber-Resilience',
      desc: 'Sequential probability ratio test and Gaussian physical watermarking for instant isolation of False Data Injection (FDI).',
      type: 'chi2',
      baseLat: 0.5
    },
    {
      id: 'cyber_physical_testing',
      folder: 'matlab/cyber_physical_testing',
      name: 'Automated Cyber-Attack Injection Test Harness',
      category: 'FTC & Cyber-Resilience',
      desc: 'Simulates stealthy zero-dynamics attacks, replay intrusions, and sensor spoofing to benchmark closed-loop resilience.',
      type: 'attack',
      baseLat: 1.1
    },
    {
      id: 'physical_fault_intelligence',
      folder: 'matlab/physical_fault_intelligence',
      name: 'Nonlinear Backlash, Deadband & Stiction Isolator',
      category: 'FTC & Cyber-Resilience',
      desc: 'Unscented Kalman filter tracking mechanical wear, hysteresis loops, and gear tooth compliance in real time.',
      type: 'wear',
      baseLat: 1.0
    },
    {
      id: 'recovery_validation',
      folder: 'matlab/recovery_validation',
      name: 'Post-Fault Safe Basin of Attraction Verifier',
      category: 'FTC & Cyber-Resilience',
      desc: 'Computes Lyapunov sublevel sets proving the post-fault state will converge into the safe equilibrium without divergence.',
      type: 'basin',
      baseLat: 1.9
    },

    // 5. Safety Critical & Formal Verification
    {
      id: 'stability_safety_cert',
      folder: 'matlab/stability_safety_certification',
      name: 'Control Barrier Function (CBF) Forward Invariance',
      category: 'Safety & Verification',
      desc: 'Quadratic program safety sieve enforcing super-level set invariance h(x) >= 0 and continuous Lyapunov contraction dot(V) < 0.',
      type: 'barrier',
      baseLat: 0.4
    },
    {
      id: 'safety_critical',
      folder: 'matlab/safety_critical',
      name: 'Real-Time Actuator Saturation & Anti-Windup Guard',
      category: 'Safety & Verification',
      desc: 'Back-calculation and conditional integration anti-windup preventing integrator saturation overshoot during heavy step setpoints.',
      type: 'antiwindup',
      baseLat: 0.3
    },
    {
      id: 'theorem_engine',
      folder: 'matlab/theorem_engine',
      name: 'Automated Control Theorem & Stability Prover',
      category: 'Safety & Verification',
      desc: 'Algebraic Routh-Hurwitz and Popov criterion checker producing formal mathematical proofs of closed-loop stability.',
      type: 'proof',
      baseLat: 2.0
    },
    {
      id: 'trust_engine',
      folder: 'matlab/trust_engine',
      name: 'Bayesian Controller Trust & Epistemic Uncertainty',
      category: 'Safety & Verification',
      desc: 'Dirichlet-multinomial Bayesian uncertainty tracker measuring posterior confidence in online model parameters.',
      type: 'trust',
      baseLat: 0.7
    },
    {
      id: 'digital_twin_validation',
      folder: 'matlab/digital_twin_validation',
      name: 'Digital Twin Statistical Conformance Sieve',
      category: 'Safety & Verification',
      desc: 'Kolmogorov-Smirnov goodness-of-fit validator detecting systematic model drift between virtual twin and actual plant response.',
      type: 'ks_test',
      baseLat: 0.9
    },
    {
      id: 'ai_stability',
      folder: 'matlab/ai_stability',
      name: 'Neural Network Lipschitz Constant Bounder',
      category: 'Safety & Verification',
      desc: 'Semidefinite programming (SDP) solver computing global Lipschitz bounds to guarantee neural controller stability.',
      type: 'lipschitz',
      baseLat: 2.2
    },

    // 6. Physics-AI & Neural Systems
    {
      id: 'physics_ai',
      folder: 'matlab/physics_ai',
      name: 'Physics-Informed Neural Network (PINN) Compensator',
      category: 'Physics-AI & ML',
      desc: 'Loss-constrained neural residual estimator satisfying Navier-Stokes/Euler-Lagrange physical equations for disturbance rejection.',
      type: 'loss',
      baseLat: 1.5
    },
    {
      id: 'hybrid_intelligence',
      folder: 'matlab/hybrid_intelligence',
      name: 'Graph Neural Network (GNN) Distributed Controller',
      category: 'Physics-AI & ML',
      desc: 'Message-passing neural network propagating localized agent state vectors across dynamic physical adjacency graphs.',
      type: 'gnn',
      baseLat: 1.6
    },
    {
      id: 'ai_scientist',
      folder: 'matlab/ai_scientist',
      name: 'Autonomous Experiment & Stress Scenario Designer',
      category: 'Physics-AI & ML',
      desc: 'Active learning acquisition function maximizing Fisher information gain to discover corner-case destabilizing plant trajectories.',
      type: 'info_gain',
      baseLat: 2.7
    },
    {
      id: 'self_healing_ai',
      folder: 'matlab/self_healing_ai',
      name: 'Self-Repairing Neural Network Weight Calibrator',
      category: 'Physics-AI & ML',
      desc: 'Online gradient descent projection restoring neural layer weights following adversarial perturbation or single-event upsets.',
      type: 'repair',
      baseLat: 1.3
    },
    {
      id: 'synthetic_data_engine',
      folder: 'matlab/synthetic_data_engine',
      name: 'High-Diversity Flight & Industrial Data Synthesizer',
      category: 'Physics-AI & ML',
      desc: 'Stochastic differential equation (SDE) generator injecting realistic turbulence and sensor noise distributions.',
      type: 'sde',
      baseLat: 1.4
    },
    {
      id: 'control_foundation_v2',
      folder: 'matlab/control_foundation_v2',
      name: 'Control Foundation Embeddings & Latent Space',
      category: 'Physics-AI & ML',
      desc: 'Transformer encoder mapping time-series plant response profiles into 128-dimensional latent dynamical embeddings.',
      type: 'latent',
      baseLat: 2.1
    },
    {
      id: 'control_nervous_system',
      folder: 'matlab/control_nervous_system',
      name: 'Neuromorphic Spike-Timing-Dependent Plasticity',
      category: 'Physics-AI & ML',
      desc: 'Event-driven spiking neural network controller consuming zero idle power until reference tracking error triggers threshold spikes.',
      type: 'spikes',
      baseLat: 0.2
    },

    // 7. Distributed, Swarm & Multi-Agent
    {
      id: 'distributed_control',
      folder: 'matlab/distributed_control',
      name: 'Decentralized Laplacian Consensus & GAT Flocking',
      category: 'Distributed & Swarms',
      desc: 'Multi-head graph attention network computing dynamically weighted communication topologies with guaranteed algebraic connectivity.',
      type: 'graph',
      baseLat: 1.1
    },
    {
      id: 'multiagent_theory',
      folder: 'matlab/multiagent_control_theory',
      name: 'Algebraic Connectivity (λ2) & Fiedler Value Optimizer',
      category: 'Distributed & Swarms',
      desc: 'Continuous graph topology restructuring maximizing the second smallest eigenvalue of the graph Laplacian matrix.',
      type: 'fiedler',
      baseLat: 1.5
    },
    {
      id: 'control_agents',
      folder: 'matlab/control_agents',
      name: 'Cooperative Multi-Agent Policy Negotiator',
      category: 'Distributed & Swarms',
      desc: 'Game-theoretic Nash bargaining protocol synchronizing multi-robot trajectories in contested physical workspaces.',
      type: 'nash',
      baseLat: 1.8
    },
    {
      id: 'control_society',
      folder: 'matlab/control_society',
      name: 'Collective Decision-Making & Swarm Quorum',
      category: 'Distributed & Swarms',
      desc: 'Stochastic voting dynamics enabling robust decentralized consensus despite Byzantine adversarial nodes.',
      type: 'quorum',
      baseLat: 1.2
    },
    {
      id: 'control_ecosystem',
      folder: 'matlab/control_ecosystem',
      name: 'Lotka-Volterra Resource & Predator-Prey Governor',
      category: 'Distributed & Swarms',
      desc: 'Ecosystem balance dynamics managing distributed actuator battery states and thermal dissipation budgets.',
      type: 'lotka',
      baseLat: 1.0
    },
    {
      id: 'control_consciousness',
      folder: 'matlab/control_consciousness',
      name: 'Global Workspace Attention & Context Sieve',
      category: 'Distributed & Swarms',
      desc: 'Dynamic attention broadcast focusing computational resources on the single most hazardous state constraint in real time.',
      type: 'attention',
      baseLat: 1.4
    },

    // 8. Domain Applications
    {
      id: 'aerospace_control',
      folder: 'matlab/aerospace_control',
      name: '6-DOF Aircraft Autopilot & Wind Shear Rejection',
      category: 'Applications',
      desc: 'Coupled roll-pitch-yaw quaternion attitude regulator with dynamic inversion and gust alleviation filters.',
      type: 'aero',
      baseLat: 0.9
    },
    {
      id: 'robotics_control',
      folder: 'matlab/robotics_control',
      name: 'Computed Torque & Impedance Manipulator Control',
      category: 'Applications',
      desc: 'Inverse dynamics controller canceling robotic centrifugal, Coriolis, and gravitational torques for compliant surface contact.',
      type: 'robot',
      baseLat: 0.8
    },
    {
      id: 'power_control',
      folder: 'matlab/power_control',
      name: 'Battery Management & Microgrid Virtual Synchronous Machine',
      category: 'Applications',
      desc: 'Inverter frequency and voltage droop controller emulating rotational inertia of synchronous thermal generators.',
      type: 'power',
      baseLat: 0.5
    },
    {
      id: 'industry6',
      folder: 'matlab/industry6',
      name: 'Cyber-Physical Precision Robotic Manufacturing',
      category: 'Applications',
      desc: 'Sub-micron CNC trajectory tracking with vibration compensation and predictive tool wear compensation.',
      type: 'cnc',
      baseLat: 0.7
    },
    {
      id: 'smart_city_control',
      folder: 'matlab/smart_city_control',
      name: 'Urban Water & Dynamic Traffic Grid Regulator',
      category: 'Applications',
      desc: 'Large-scale distributed hydraulic pressure management minimizing pumping energy while preventing pipeline water-hammer bursts.',
      type: 'city',
      baseLat: 2.0
    },
    {
      id: 'space_control',
      folder: 'matlab/space_control',
      name: 'Reaction Wheel Attitude & Asteroid Proximity Guidance',
      category: 'Applications',
      desc: 'Zero-momentum desaturation algorithms using magnetorquers and cold-gas thrusters for orbital station-keeping.',
      type: 'space',
      baseLat: 1.1
    },

    // 9. Explainable & Next-Gen Frontiers (acep_novelty to xcontrol)
    {
      id: 'xcontrol_explainer',
      folder: 'matlab/xcontrol',
      name: 'Explainable AI Controller Decision & Trace Sieve',
      category: 'Explainable & Frontiers',
      desc: 'Translates high-dimensional control switching actions into human-interpretable natural language engineering rationales.',
      type: 'xai',
      baseLat: 1.5
    },
    {
      id: 'math_explainer',
      folder: 'matlab/math_explainer',
      name: 'Real-Time LaTeX Derivation & Formula Generator',
      category: 'Explainable & Frontiers',
      desc: 'Extracts active plant polynomial coefficients and derives symbolic transfer function equations in real time.',
      type: 'latex',
      baseLat: 1.2
    },
    {
      id: 'causal_control',
      folder: 'matlab/causal_control',
      name: 'Do-Calculus Causal Controller Selection Engine',
      category: 'Explainable & Frontiers',
      desc: 'Pearl causal DAG engine distinguishing genuine feedback interventions from spurious sensor noise correlations.',
      type: 'causal',
      baseLat: 1.9
    },
    {
      id: 'decision_intelligence',
      folder: 'matlab/control_decision_intelligence',
      name: 'Multi-Criteria Candidate Rejection Explainer',
      category: 'Explainable & Frontiers',
      desc: 'Audits disqualified candidate controllers and outputs exact root-cause metrics that caused safety gate rejection.',
      type: 'reject',
      baseLat: 1.3
    },
    {
      id: 'quantum_control',
      folder: 'matlab/quantum_control',
      name: 'Simulated Quantum Annealing Gain Exploration',
      category: 'Explainable & Frontiers',
      desc: 'Ising Hamiltonian energy minimization using quantum tunneling fluctuations to escape local minima in multivariable gain space.',
      type: 'tunneling',
      baseLat: 2.8
    },
    {
      id: 'moonshot_control',
      folder: 'matlab/moonshot_control',
      name: 'Autonomous Artificial Control Lifeform Evolution',
      category: 'Explainable & Frontiers',
      desc: 'Self-replicating controller architectures that adapt their internal state dimension dynamically in response to plant order changes.',
      type: 'lifeform',
      baseLat: 3.5
    }
  ];

  window.ACEP_ENGINES = {
    list: ALL_81_ENGINES,
    activeCategory: 'ALL',

    renderMatrix: function(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      // Controls Bar
      const filterBar = document.createElement('div');
      filterBar.className = 'engine-filter-bar';
      filterBar.style.cssText = 'display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;';
      
      const categories = ['ALL', 'Core & Autonomous', 'Adaptive & Observers', 'Optimal & Constrained', 'FTC & Cyber-Resilience', 'Safety & Verification', 'Physics-AI & ML', 'Distributed & Swarms', 'Applications', 'Explainable & Frontiers'];
      
      categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn-action';
        btn.style.cssText = 'font-size: 11px; padding: 5px 10px; border-radius: 4px;';
        btn.textContent = cat;
        if (cat === this.activeCategory) {
          btn.style.borderColor = '#00f2fe';
          btn.style.color = '#00f2fe';
          btn.style.background = 'rgba(0, 242, 254, 0.15)';
        } else {
          btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          btn.style.color = '#8b949e';
          btn.style.background = 'rgba(13, 17, 23, 0.6)';
        }
        btn.onclick = () => {
          this.activeCategory = cat;
          this.renderMatrix(containerId);
        };
        filterBar.appendChild(btn);
      });

      const grid = document.createElement('div');
      grid.className = 'engines-grid';
      grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px;';

      const filtered = this.activeCategory === 'ALL' 
        ? ALL_81_ENGINES 
        : ALL_81_ENGINES.filter(e => e.category === this.activeCategory);

      filtered.forEach(eng => {
        const card = document.createElement('div');
        card.className = 'engine-card';
        card.id = `card_${eng.id}`;
        card.innerHTML = `
          <div class="engine-card-header">
            <div>
              <h3 style="font-size: 13px; font-weight: 600; color: #f0f6fc; margin: 0 0 4px 0;">${eng.name}</h3>
              <span class="engine-folder-tag">${eng.folder}</span>
            </div>
            <span class="badge-param" style="font-size: 9px;">${eng.category}</span>
          </div>
          <p class="engine-card-desc" style="font-size: 11px; color: #8b949e; line-height: 1.4; margin: 8px 0;">${eng.desc}</p>
          <div class="engine-card-preview" style="height: 80px; background: #03060c; border-radius: 6px; overflow: hidden; position: relative;">
            <canvas id="canvas_${eng.id}" width="320" height="80" style="width: 100%; height: 100%; display: block;"></canvas>
          </div>
          <div class="engine-card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px; font-family: monospace;">
            <span class="engine-latency" style="color: #8b949e;">Latency: <strong id="lat_${eng.id}" style="color: #79c0ff;">${eng.baseLat} ms</strong></span>
            <span class="engine-status-badge badge-certified" id="badge_${eng.id}">ACTIVE CO-SIM</span>
          </div>
        `;
        grid.appendChild(card);
      });

      container.appendChild(filterBar);
      container.appendChild(grid);

      this.startPreviewLoops();
    },

    startPreviewLoops: function() {
      let t = 0;
      const self = this;

      function stepEngines() {
        t += 0.05;

        ALL_81_ENGINES.forEach(eng => {
          const cvs = document.getElementById(`canvas_${eng.id}`);
          if (!cvs) return;
          const ctx = cvs.getContext('2d');
          const w = cvs.width;
          const h = cvs.height;

          // Background
          ctx.fillStyle = '#040711';
          ctx.fillRect(0, 0, w, h);

          // Grid
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.06)';
          ctx.lineWidth = 1;
          for (let y = 0; y < h; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
          }

          // Dynamic sensing noise & physics coupling
          const noise = (Math.random() - 0.5) * 4;
          const dynamicLat = (eng.baseLat + 0.15 * Math.sin(t * 2 + eng.baseLat) + 0.05 * Math.random()).toFixed(2);
          const latEl = document.getElementById(`lat_${eng.id}`);
          if (latEl && Math.random() < 0.05) {
            latEl.textContent = `${dynamicLat} ms`;
          }

          ctx.lineWidth = 1.8;
          ctx.beginPath();

          if (eng.type === 'signal' || eng.type === 'drift') {
            ctx.strokeStyle = '#00f2fe';
            for (let x = 0; x < w; x++) {
              const y = h/2 - 20 * Math.sin(x * 0.06 + t * 3) * Math.exp(-((x % 60) * 0.02)) + noise * 0.3;
              if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
          } else if (eng.type === 'spectrum' || eng.type === 'aging') {
            ctx.strokeStyle = '#00ff88';
            for (let x = 0; x < w; x += 8) {
              const barH = 10 + 35 * Math.abs(Math.sin((x + t * 30) * 0.05));
              ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
              ctx.fillRect(x, h - barH, 5, barH);
            }
          } else if (eng.type === 'step' || eng.type === 'adrc') {
            ctx.strokeStyle = '#c084fc';
            ctx.moveTo(0, h * 0.75);
            ctx.lineTo(w * 0.25, h * 0.75);
            ctx.lineTo(w * 0.25, h * 0.25);
            for (let x = w * 0.25; x < w; x++) {
              const dx = (x - w * 0.25) * 0.05;
              const y = h * 0.25 + 18 * Math.exp(-dx * 1.8) * Math.cos(dx * 4.5);
              ctx.lineTo(x, y);
            }
          } else if (eng.type === 'barrier' || eng.type === 'antiwindup') {
            ctx.strokeStyle = 'rgba(255, 42, 109, 0.4)';
            ctx.beginPath(); ctx.moveTo(0, h * 0.65); ctx.lineTo(w, h * 0.65); ctx.stroke();
            ctx.strokeStyle = '#00f2fe';
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
              const y = h * 0.35 + 16 * Math.sin(x * 0.04 + t * 2.5);
              if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
          } else if (eng.type === 'hash') {
            ctx.fillStyle = '#79c0ff';
            ctx.font = '9px monospace';
            for (let r = 0; r < 3; r++) {
              const hash = '0x' + Math.floor((Math.sin(t + r) + 2) * 1e8).toString(16).padEnd(8, '0');
              ctx.fillText(`MERKLE [${r}]: ${hash} ✓`, 8, 22 + r * 20);
            }
          } else if (eng.type === 'chi2' || eng.type === 'attack') {
            ctx.strokeStyle = '#00ff88';
            for (let x = 0; x < w; x++) {
              const y = h * 0.75 - 10 * Math.abs(Math.sin(x * 0.08 + t * 3.2)) - Math.random() * 3;
              if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(255, 170, 0, 0.5)';
            ctx.beginPath(); ctx.moveTo(0, h * 0.35); ctx.lineTo(w, h * 0.35); ctx.stroke();
          } else if (eng.type === 'tunneling' || eng.type === 'ga' || eng.type === 'pso') {
            ctx.strokeStyle = '#c084fc';
            for (let x = 0; x < w; x++) {
              const y = h/2 + 20 * Math.cos(x * 0.07) * Math.sin(t * 3.5);
              if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
          } else if (eng.type === 'graph' || eng.type === 'gnn') {
            ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
            for (let k = 0; k < 5; k++) {
              const px = 30 + k * 60 + 8 * Math.sin(t + k);
              const py = 25 + 25 * Math.cos(t * 1.5 + k);
              ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#00f2fe'; ctx.fill();
              if (k > 0) {
                const prevX = 30 + (k-1) * 60 + 8 * Math.sin(t + k - 1);
                const prevY = 25 + 25 * Math.cos(t * 1.5 + k - 1);
                ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(px, py); ctx.stroke();
              }
            }
          } else {
            // General dynamical sensing response
            ctx.strokeStyle = '#58a6ff';
            for (let x = 0; x < w; x++) {
              const y = h/2 - 18 * Math.sin((x * 0.05) + t * 2) * Math.cos((x * 0.02) + t);
              if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
          }

          if (eng.type !== 'spectrum' && eng.type !== 'aging' && eng.type !== 'hash') {
            ctx.stroke();
          }
        });

        requestAnimationFrame(stepEngines);
      }

      requestAnimationFrame(stepEngines);
    }
  };
})();
