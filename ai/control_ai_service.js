/**
 * ============================================================================
 * CONTROL-ARENA X — CONTROL AI DUAL-WORKSPACE ENGINEERING INTELLIGENCE SERVICE
 * ============================================================================
 * 
 * Strict Architectural Separation of Concerns:
 * - Language reasoning & requirement interpretation (Control AI Adapter)
 * - Numerical engineering modeling, simulation, and synthesis (Validated Pipeline)
 * 
 * WORKSPACE A: Control AI — Controller Design Engineer
 * - Plant identification & state-space generation
 * - Contextual questioning on missing parameters & operating envelopes
 * - Multi-controller synthesis (PID, LQR, SMC, ADRC, MPC, State-Feedback, Lead-Lag)
 * - Closed-loop RK4 simulation & Lyapunov stability verification
 * - Dynamic block diagram metadata generation
 * - Technical certification report export
 * 
 * WORKSPACE B: Control AI — Complete Project Engineer
 * - Multi-subsystem decomposition (Compute, Power, Actuation, Sensing, Comm)
 * - Domain project generation (Embedded, Robotics, Industrial Automation, Process, etc.)
 * - Component selection from verified hardware library
 * - Automated source code generation (C, C++, Python, MicroPython)
 * - Hardware pinout configuration & connection graphs
 * - Bill of Materials (BOM) & toolchain build instructions
 * - Controller-to-Project artifact integration
 * 
 * ZERO THIRD-PARTY BRANDING in normal user-facing responses.
 * Product name: "Control AI".
 */

'use strict';

const path = require('path');
const pipeline = require('../web_app/control_arena_pipeline.js');
const projectStore = require('../storage/project_store.js');
const componentLibrary = require('../storage/component_library.js');
const projectGenerator = require('../storage/project_generator.js');

// Configurable Server-Side AI Provider Status
const AI_PROVIDER_CONFIG = {
  provider: process.env.CONTROL_AI_PROVIDER || 'autonomous_intelligence_core',
  hasApiKey: Boolean(process.env.CONTROL_AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY),
  model: process.env.CONTROL_AI_MODEL || 'control-ai-engineering-v5',
  engineStatus: 'READY_ONLINE'
};

/**
 * WORKSPACE A: Controller Design Engineer
 */
function handleControllerDesignEngineer(prompt, options = {}) {
  const q = (prompt || '').trim();
  const lowerQ = q.toLowerCase();

  // 1. Identify Target Plant
  let plantKey = options.plant || 'dc_motor';
  if (lowerQ.includes('quadrotor') || lowerQ.includes('drone') || lowerQ.includes('uav')) {
    plantKey = 'quadrotor';
  } else if (lowerQ.includes('pendulum') || lowerQ.includes('cart') || lowerQ.includes('inverted')) {
    plantKey = 'inverted_pendulum';
  } else if (lowerQ.includes('chemical') || lowerQ.includes('cstr') || lowerQ.includes('reactor')) {
    plantKey = 'chemical_cstr';
  } else if (lowerQ.includes('spring') || lowerQ.includes('damper') || lowerQ.includes('mass') || lowerQ.includes('suspension')) {
    plantKey = 'mass_spring_damper';
  } else if (lowerQ.includes('motor') || lowerQ.includes('servo') || lowerQ.includes('dc')) {
    plantKey = 'dc_motor';
  }

  // 2. Identify Controller Family
  let controller = options.controller || 'pid';
  if (lowerQ.includes('lqr') || lowerQ.includes('riccati') || lowerQ.includes('optimal')) {
    controller = 'lqr';
  } else if (lowerQ.includes('smc') || lowerQ.includes('sliding mode') || lowerQ.includes('variable structure')) {
    controller = 'smc';
  } else if (lowerQ.includes('adrc') || lowerQ.includes('extended state') || lowerQ.includes('eso')) {
    controller = 'adrc';
  } else if (lowerQ.includes('mpc') || lowerQ.includes('predictive') || lowerQ.includes('horizon')) {
    controller = 'mpc';
  } else if (lowerQ.includes('state feedback') || lowerQ.includes('pole placement')) {
    controller = 'state_feedback';
  } else if (lowerQ.includes('lead') || lowerQ.includes('lag')) {
    controller = 'lead_lag';
  } else if (lowerQ.includes('h_inf') || lowerQ.includes('h-infinity') || lowerQ.includes('robust')) {
    controller = 'h_inf';
  }

  // 3. Extract Transient Requirements & Constraints
  let targetRef = options.reference !== undefined ? options.reference : 1.0;
  const refMatch = q.match(/(?:ref|setpoint|target|r\s*=\s*)\s*([+-]?\d+(?:\.\d+)?)/i);
  if (refMatch) targetRef = parseFloat(refMatch[1]);

  let disturbance = options.disturbance !== undefined ? options.disturbance : 0.0;
  if (lowerQ.includes('wind') || lowerQ.includes('gust') || lowerQ.includes('disturbance') || lowerQ.includes('load')) {
    disturbance = 1.5;
  }

  const reqs = {
    riseTime: lowerQ.includes('fast') ? 0.35 : (options.riseTime || 0.5),
    settlingTime: options.settlingTime || 1.5,
    overshoot: lowerQ.includes('smooth') || lowerQ.includes('low overshoot') ? 2.5 : (options.overshoot || 5.0),
    maxSteadyStateError: 0.02,
    u_limit: options.u_limit || 24.0
  };

  // 4. Generate Dynamic Contextual Questions for Missing Specifications
  const questions = [];
  if (!refMatch && options.reference === undefined) {
    questions.push({
      id: 'q_setpoint',
      question: 'Operating setpoint was not specified. Standard test reference r(t)=1.0 was selected. What is your required operating setpoint or deflection angle?',
      options: ['Nominal r = 1.0', 'High Deflection r = 2.5', 'Bipolar Tracking r = ±1.5', 'Ramp Tracking (v = 0.5 rad/s)']
    });
  }
  if (!lowerQ.includes('disturbance') && !lowerQ.includes('wind') && options.disturbance === undefined) {
    questions.push({
      id: 'q_disturbance',
      question: 'What disturbance profile should the closed-loop controller be certified against?',
      options: ['Nominal environment (No disturbance)', 'Step load disturbance (d = 1.5 N)', 'Stochastic wind turbulence', 'Cyclic sinusoidal load']
    });
  }
  if (!lowerQ.includes('overshoot') && !lowerQ.includes('settling')) {
    questions.push({
      id: 'q_transient',
      question: 'Which performance trade-off priority governs your design requirements?',
      options: ['Standard Balanced (Tr ≤ 0.5s, Mp ≤ 5%)', 'Ultra-Fast Response (Tr ≤ 0.25s, high effort)', 'Minimum Overshoot / High Damping (Mp ≤ 1%)', 'Energy-Efficient / Slew-Constrained']
    });
  }

  // 5. Execute Genuine Mathematical Synthesis & Simulation
  const simRun = pipeline.simulateRun({
    plant: plantKey,
    controller: controller,
    reference: targetRef,
    disturbance: disturbance,
    t_final: 2.5,
    dt: 0.01
  });

  // 6. Generate Block Diagram Architecture
  const blockDiagram = generateBlockDiagramData(plantKey, controller, simRun.gains, reqs);

  // 7. Compose Technical Narrative Report
  const message = [
    `### Control AI — Controller Design Engineer Report`,
    `**System Identified:** \`${simRun.plant.toUpperCase()}\` | **Architecture:** \`${simRun.controller.toUpperCase()}\``,
    ``,
    `#### Synthesized Control Gains & Parameters`,
    `- **Parameters:** \`${JSON.stringify(simRun.gains)}\``,
    `- **Theoretical Equilibrium Trim:** $u_{\\text{trim}} = ${(simRun.appliedInput[simRun.appliedInput.length - 1] || 0).toFixed(2)}\\text{ V}$`,
    ``,
    `#### Numerical Closed-Loop Transient Metrics (Runge-Kutta 4)`,
    `- **Rise Time ($T_r$):** \`${simRun.metrics.riseTime} s\` (Target: $\\le ${reqs.riseTime} s$)`,
    `- **Settling Time ($T_s$):** \`${simRun.metrics.settlingTime} s\` (Target: $\\le ${reqs.settlingTime} s$)`,
    `- **Peak Overshoot ($M_p$):** \`${simRun.metrics.overshoot} %\` (Target: $\\le ${reqs.overshoot} %$)`,
    `- **Steady-State Error ($e_{ss}$):** \`${simRun.metrics.steadyStateError}\``,
    `- **Control Effort ($E_u$):** \`${simRun.metrics.controlEffort} V²·s\``,
    `- **Lyapunov Stability:** ${simRun.verification.lyapunovCertified ? '✅ **Asymptotically Stable** (Hermitian Lyapunov Matrix $P > 0, \\dot{V} < 0$)' : '⚠️ Check Margin'}`,
    ``,
    `#### Closed-Loop Topology & Signal Routing`,
    `Connected executable feedback loop: Reference Generator $\\to$ Summing Junction $\\to$ ${simRun.controller.toUpperCase()} $\\to$ Actuator (Saturation: $\\pm ${reqs.u_limit}V$) $\\to$ Plant Dynamics $\\to$ Sensor Transducer $\\to$ Feedback Path.`,
    `Synchronized with **3D Digital Twin Command Center** and frequency-domain Bode analytics.`
  ].join('\n');

  // Record to active project if provided
  if (options.projectId) {
    try {
      projectStore.addProjectRun(options.projectId, simRun);
      projectStore.addProjectMessage(options.projectId, {
        sender: 'user',
        text: prompt
      });
      projectStore.addProjectMessage(options.projectId, {
        sender: 'assistant',
        workspace: 'controller_designer',
        text: message,
        runId: simRun.runId,
        clarifications: questions.map(q => q.question)
      });
    } catch (e) {
      console.warn('Project persistence note:', e.message);
    }
  }

  return {
    workspace: 'controller_designer',
    engineName: 'Control AI — Controller Design Engineer',
    plant: plantKey,
    plantKey: plantKey,
    controller: controller,
    gains: simRun.gains,
    requirements: reqs,
    simulationResult: simRun,
    blockDiagram: blockDiagram,
    message: message,
    questions: questions,
    timestamp: new Date().toISOString()
  };
}

/**
 * WORKSPACE B: Complete Project Engineer
 */
function handleCompleteProjectEngineer(prompt, options = {}) {
  const q = (prompt || '').trim();
  const lowerQ = q.toLowerCase();

  // 1. Identify Domain
  let domain = 'electromechanical';
  if (lowerQ.includes('uav') || lowerQ.includes('drone') || lowerQ.includes('quadrotor') || lowerQ.includes('flight')) {
    domain = 'aerospace_robotics';
  } else if (lowerQ.includes('robot') || lowerQ.includes('manipulator') || lowerQ.includes('arm')) {
    domain = 'robotics_motion_control';
  } else if (lowerQ.includes('process') || lowerQ.includes('chemical') || lowerQ.includes('thermal') || lowerQ.includes('reactor')) {
    domain = 'process_thermal';
  } else if (lowerQ.includes('automation') || lowerQ.includes('plc') || lowerQ.includes('conveyor') || lowerQ.includes('factory')) {
    domain = 'industrial_automation';
  } else if (lowerQ.includes('stepper') || lowerQ.includes('cnc')) {
    domain = 'cnc_mechatronics';
  }

  // 2. Identify Hardware Target
  let targetHw = 'stm32f401re';
  if (lowerQ.includes('esp32') || lowerQ.includes('wifi') || lowerQ.includes('iot')) {
    targetHw = 'esp32_wroom';
  } else if (lowerQ.includes('arduino') || lowerQ.includes('uno') || lowerQ.includes('atmega')) {
    targetHw = 'arduino_uno_r3';
  } else if (lowerQ.includes('raspberry') || lowerQ.includes('pi') || lowerQ.includes('linux')) {
    targetHw = 'raspberry_pi_4';
  }

  // 3. Extract Controller Preference & Constraints
  let ctrlType = 'pid';
  if (lowerQ.includes('lqr')) ctrlType = 'lqr';
  else if (lowerQ.includes('smc')) ctrlType = 'smc';
  else if (lowerQ.includes('adrc')) ctrlType = 'adrc';

  const projectName = options.name || (q.length > 5 ? q.slice(0, 48) : `Autonomous ${domain.replace('_', ' ')} System`);
  const gains = options.gains || { kp: 4.8, ki: 1.15, kd: 0.32 };
  const reqs = options.requirements || { riseTime: 0.45, settlingTime: 1.20, overshoot: 4.8, u_limit: 24.0 };

  // 4. Generate Complete Project with Populated Artifacts on Disk
  const projectArtifacts = projectGenerator.generateEngineeringProject({
    name: projectName,
    domain: domain,
    targetHardware: targetHw,
    controllerType: ctrlType,
    gains: gains,
    requirements: reqs
  });

  // 5. Read Generated File Contents for In-Browser Code Inspector
  const fileDetails = projectGenerator.getProjectFiles(projectArtifacts.id) || {};

  // 6. Contextual Missing Hardware Specification Questions
  const questions = [
    {
      id: 'q_supply_rail',
      question: 'What is your primary DC bus voltage rating for the actuator driver power stage?',
      options: ['24.0V DC Industrial Bus', '12.0V DC Automotive / Lead-Acid', '14.8V 4S LiPo Battery Pack', '48.0V Telecom / High-Power Bus']
    },
    {
      id: 'q_comm_interface',
      question: 'Which supervisory communications interface is required for real-time telemetry?',
      options: ['USART / USB Serial (115200 baud)', 'CAN Bus 2.0B (500 kbps differential)', 'Wi-Fi / MQTT IoT Gateway', 'Isolated RS-485 Modbus RTU']
    }
  ];

  // 7. Compose Comprehensive Project Narrative
  const message = [
    `### Control AI — Complete Project Engineer Specification`,
    `**Project ID:** \`${projectArtifacts.id}\` | **Domain:** \`${domain.toUpperCase()}\` | **Target:** \`${targetHw.toUpperCase()}\``,
    ``,
    `#### Populated Project Workspace & Artifacts Generated`,
    `- Created **${projectArtifacts.fileCount} engineering artifacts** in \`storage/projects/${projectArtifacts.id}/\`.`,
    `- Complete discrete firmware entry point: \`main.c\` with 100Hz real-time timer loop.`,
    `- Discrete floating-point controller: \`controller.c\` and \`controller.h\` (Anti-windup & derivative-kick filtered).`,
    `- Commercial Bill of Materials: **${projectArtifacts.bomSummary.totalParts} components** totaling **$${projectArtifacts.bomSummary.totalCostUsd.toFixed(2)} USD**.`,
    `- Pinout mappings, hardware connections, automated unit test suites (\`test_suite.py\`), and Makefile.`,
    ``,
    `#### Selected Hardware Subsystem Architecture`,
    `- **Compute Controller:** \`${projectArtifacts.components.find(c => c.category === 'compute_controllers')?.name || 'STM32 Microcontroller'}\``,
    `- **Power Electronics Driver:** \`${projectArtifacts.components.find(c => c.category === 'power_electronics')?.name || 'H-Bridge Driver'}\``,
    `- **Actuator / Drive:** \`${projectArtifacts.components.find(c => c.category === 'actuators_motors')?.name || 'DC Servomotor'}\``,
    `- **Sensor Feedback:** \`${projectArtifacts.components.find(c => c.category === 'sensors')?.name || 'Quadrature Optical Encoder'}\``,
    ``,
    `The complete project workspace is now loaded in the **Code & Project Workspace Viewer**. You can inspect each file, run unit tests, and prepare toolchain deployment.`
  ].join('\n');

  // Register in Project Store
  try {
    projectStore.createProject({
      name: projectName,
      plantKey: 'dc_motor',
      author: 'Control AI Project Engineer',
      requirements: reqs,
      notes: `Generated by Control AI Complete Project Engineer (${projectArtifacts.id})`
    });
  } catch (e) {
    console.warn('Project store registration note:', e.message);
  }

  return {
    workspace: 'project_engineer',
    engineName: 'Control AI — Complete Project Engineer',
    projectId: projectArtifacts.id,
    project: projectArtifacts,
    components: projectArtifacts.components || [],
    files: fileDetails,
    questions: questions,
    message: message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate Dynamic Block Diagram Data Structure
 */
function generateBlockDiagramData(plantKey, ctrlType, gains, reqs) {
  const pName = plantKey ? plantKey.replace('_', ' ').toUpperCase() : 'DC MOTOR';
  const cName = ctrlType ? ctrlType.toUpperCase() : 'PID';

  return {
    blocks: [
      { id: 'blk_ref', label: 'Reference Generator r(t)', type: 'source', x: 40, y: 120, width: 140, height: 60, portOut: 'r' },
      { id: 'blk_sum', label: 'Summing (Σ)', type: 'junction', x: 230, y: 135, width: 40, height: 40, signs: ['+', '-'] },
      { id: 'blk_ctrl', label: `${cName} Controller C(s)`, type: 'controller', x: 320, y: 110, width: 160, height: 80, gains: gains },
      { id: 'blk_act', label: `Actuator (±${reqs.u_limit || 24}V)`, type: 'actuator', x: 530, y: 120, width: 140, height: 60 },
      { id: 'blk_dist', label: 'Disturbance d(t)', type: 'disturbance', x: 710, y: 30, width: 110, height: 40 },
      { id: 'blk_plant', label: `${pName} Plant P(s)`, type: 'plant', x: 710, y: 110, width: 160, height: 80 },
      { id: 'blk_sens', label: 'Sensor H(s)', type: 'sensor', x: 710, y: 240, width: 160, height: 60 },
      { id: 'blk_obs', label: 'Kalman Observer x̂(t)', type: 'observer', x: 530, y: 240, width: 140, height: 60 }
    ],
    connections: [
      { from: 'blk_ref', to: 'blk_sum', signal: 'r(t)' },
      { from: 'blk_sum', to: 'blk_ctrl', signal: 'e(t) = r - y' },
      { from: 'blk_ctrl', to: 'blk_act', signal: 'u_cmd(t)' },
      { from: 'blk_act', to: 'blk_plant', signal: 'u_act(t)' },
      { from: 'blk_dist', to: 'blk_plant', signal: 'd(t)' },
      { from: 'blk_plant', to: 'blk_sens', signal: 'y_true(t)' },
      { from: 'blk_sens', to: 'blk_obs', signal: 'y_meas(t)' },
      { from: 'blk_sens', to: 'blk_sum', signal: 'Feedback y(t)', via: [[920, 150], [920, 340], [250, 340], [250, 175]] }
    ]
  };
}

module.exports = {
  AI_PROVIDER_CONFIG,
  handleControllerDesignEngineer,
  handleCompleteProjectEngineer,
  generateBlockDiagramData
};
