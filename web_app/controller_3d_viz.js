/**
 * ============================================================================
 * CONTROL-ARENA X — 3D CONTROLLER VISUALIZATION & DIGITAL TWIN MODULE
 * ============================================================================
 * 
 * Interactive, full-view 3D Digital Twin of the complete closed-loop control system:
 * - Plant (with physical kinematic models for DC Motor, Quadrotor, Inverted Pendulum, CSTR, Mass-Spring-Damper)
 * - Controller (chassis, family themes, DSP LEDs, gains, internal states)
 * - Actuators (moving stroke, saturation aura, health degradation)
 * - Sensors (transducer ring, sample strobe, FDI fault / bias alert)
 * - Feedback connections (3D wiring bus, active signal flow particles)
 * - Disturbance injection (dynamic 3D force vector arrow)
 * - 3D State Trajectory [x1(t), x2(t), u(t)] ribbon
 * - Interactive camera: Orbit (rotX, rotY), Pan (panX, panY), Zoom, and Preset Views
 * - Interactive Raycasting & Component Selection with Live Parameter Inspector HUD
 * - Real-time synchronization with Runge-Kutta simulation engine & instant re-simulation
 * 
 * Dependencies: Pure Canvas 2D with custom 3D perspective projection (zero external WebGL CDN required).
 * Fully compatible with browser DOM and Node.js testing environments.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    root.Controller3DEngine = mod.Controller3DEngine;
    root.CTRL_3D_THEMES = mod.CTRL_3D_THEMES;
    root.PLANT_KINEMATICS = mod.PLANT_KINEMATICS;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // =========================================================================
  // 1. CONTROLLER THEMES REGISTRY
  // =========================================================================
  const CTRL_3D_THEMES = {
    pid:              { base: '#00F5D4', glow: '#00F5D450', label: 'PID',              shape: 'box',       accent: '#39FF14', type: 'Proportional-Integral-Derivative' },
    state_feedback:   { base: '#A78BFA', glow: '#A78BFA55', label: 'State FB',         shape: 'prism',     accent: '#00F5D4', type: 'Full-State Pole Placement' },
    lqr:              { base: '#FFB020', glow: '#FFB02055', label: 'LQR',              shape: 'diamond',   accent: '#FF6B35', type: 'Linear Quadratic Regulator' },
    mpc:              { base: '#FF6B35', glow: '#FF6B3555', label: 'MPC',              shape: 'cylinder',  accent: '#FFB020', type: 'Model Predictive Control' },
    adrc:             { base: '#39FF14', glow: '#39FF1445', label: 'ADRC',             shape: 'box',       accent: '#00F5D4', type: 'Active Disturbance Rejection Control' },
    smc:              { base: '#F72585', glow: '#F7258555', label: 'SMC',              shape: 'wedge',     accent: '#A78BFA', type: 'Sliding Mode Control' },
    h_inf:            { base: '#7B2FF7', glow: '#7B2FF755', label: 'H∞',              shape: 'sphere',    accent: '#F72585', type: 'H-Infinity Robust Control' },
    backstepping:     { base: '#00B4D8', glow: '#00B4D855', label: 'Backstepping',     shape: 'prism',     accent: '#39FF14', type: 'Nonlinear Backstepping' },
    mrac:             { base: '#FF9F1C', glow: '#FF9F1C55', label: 'MRAC',             shape: 'box',       accent: '#00F5D4', type: 'Model Reference Adaptive Control' },
    lqg:              { base: '#2EC4B6', glow: '#2EC4B655', label: 'LQG',              shape: 'diamond',   accent: '#FFB020', type: 'Linear Quadratic Gaussian' },
    pinn_neural:      { base: '#E040FB', glow: '#E040FB55', label: 'PINN',             shape: 'cylinder',  accent: '#00F5D4', type: 'Physics-Informed Neural Network' },
    fuzzy:            { base: '#FF5400', glow: '#FF540055', label: 'Fuzzy',            shape: 'box',       accent: '#39FF14', type: 'Fuzzy Logic Controller' },
    imc:              { base: '#5CE1E6', glow: '#5CE1E655', label: 'IMC',              shape: 'prism',     accent: '#A78BFA', type: 'Internal Model Control' },
    fractional_pid:   { base: '#AAFF00', glow: '#AAFF0055', label: 'FOPID',           shape: 'box',       accent: '#00F5D4', type: 'Fractional-Order PID' },
    gpc:              { base: '#FF006E', glow: '#FF006E55', label: 'GPC',              shape: 'diamond',   accent: '#FFB020', type: 'Generalized Predictive Control' },
    ftc:              { base: '#FB5607', glow: '#FB560755', label: 'FTC',              shape: 'wedge',     accent: '#39FF14', type: 'Fault-Tolerant Control' },
    bang_bang:        { base: '#FFBE0B', glow: '#FFBE0B55', label: 'Bang-Bang',        shape: 'box',       accent: '#FF6B35', type: 'Relay Bang-Bang Control' },
    lead_comp:        { base: '#8338EC', glow: '#8338EC55', label: 'Lead',             shape: 'prism',     accent: '#00F5D4', type: 'Phase-Lead Compensator' },
    lag_comp:         { base: '#3A86FF', glow: '#3A86FF55', label: 'Lag',              shape: 'prism',     accent: '#A78BFA', type: 'Phase-Lag Compensator' },
    lead_lag:         { base: '#06D6A0', glow: '#06D6A055', label: 'Lead-Lag',         shape: 'box',       accent: '#FFB020', type: 'Lead-Lag Compensator' },
    notch_comp:       { base: '#EF233C', glow: '#EF233C55', label: 'Notch',            shape: 'cylinder',  accent: '#39FF14', type: 'Notch Filter Compensator' },
    feedforward_comp: { base: '#0077B6', glow: '#0077B655', label: 'Feedforward',      shape: 'box',       accent: '#00F5D4', type: 'Feedforward Disturbance Compensator' },
    pz_cancel_comp:   { base: '#023E8A', glow: '#023E8A55', label: 'PZ Cancel',        shape: 'prism',     accent: '#FFB020', type: 'Pole-Zero Cancellation' },
    cascade_comp:     { base: '#48CAE4', glow: '#48CAE455', label: 'Cascade',          shape: 'box',       accent: '#A78BFA', type: 'Cascade Architecture' },
    phase_shaping_comp:{ base: '#ADE8F4', glow: '#ADE8F455', label: 'Phase Shape',    shape: 'wedge',     accent: '#39FF14', type: 'Phase Shaping Loop' },
    custom:           { base: '#F0F6FC', glow: '#F0F6FC30', label: 'Custom',           shape: 'box',       accent: '#00F5D4', type: 'Custom Architecture' },
  };

  function getTheme(id) {
    if (!id) return CTRL_3D_THEMES.pid;
    const clean = id.toLowerCase().replace('-', '_');
    return CTRL_3D_THEMES[clean] || CTRL_3D_THEMES.pid;
  }

  // =========================================================================
  // 2. 3D MATH & PROJECTION PRIMITIVES
  // =========================================================================
  function rotY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0]*c - p[2]*s, p[1], p[0]*s + p[2]*c];
  }

  function rotX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0], p[1]*c - p[2]*s, p[1]*s + p[2]*c];
  }

  function rotZ(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0]*c - p[1]*s, p[0]*s + p[1]*c, p[2]];
  }

  function projectPoint(p3, rotAngleX, rotAngleY, zoom, fov, width, height, panX = 0, panY = 0) {
    let p = rotY(p3, rotAngleY);
    p = rotX(p, rotAngleX);
    const d = 4.8 / Math.max(0.1, zoom);
    const z = p[2] + d;
    if (z <= 0.05) return null;
    const s = (fov * zoom) / z;
    return [
      width / 2 + panX + p[0] * s,
      height / 2 + panY - p[1] * s,
      s,
      z
    ];
  }

  // =========================================================================
  // 3. PLANT KINEMATICS REGISTRY (5 Real Physical Dynamic Models)
  // =========================================================================
  const PLANT_KINEMATICS = {
    // 1. Precision DC Servomotor: angular displacement, rotating rotor, inertial flywheel
    dc_motor: {
      name: 'Precision Industrial DC Servomotor',
      evalKinematics: (simState, timeSec) => {
        const x0 = simState?.x?.[0] || 0; // angular speed omega (rad/s) or angle
        const x1 = simState?.x?.[1] || 0; // armature current i_a (A)
        const angle = (timeSec * x0 * 2.5) % (Math.PI * 2);
        return {
          theta: angle,
          omega: x0,
          current: x1,
          vibration: Math.min(0.04, Math.abs(x1) * 0.005)
        };
      }
    },

    // 2. UAV Quadrotor: 4-rotor cross airframe, pitch angle, spinning props
    quadrotor: {
      name: 'UAV Quadrotor Attitude (Pitch/Altitude)',
      evalKinematics: (simState, timeSec) => {
        const pitch = Math.max(-0.65, Math.min(0.65, simState?.x?.[0] || 0)); // rad
        const pitchRate = simState?.x?.[1] || 0; // rad/s
        const propSpeed = 15.0 + Math.abs(simState?.u || 0) * 0.8;
        const propAngle = (timeSec * propSpeed) % (Math.PI * 2);
        return {
          pitch: pitch,
          pitchRate: pitchRate,
          propAngle: propAngle,
          altitudeOffset: Math.sin(timeSec * 2) * 0.02
        };
      }
    },

    // 3. Inverted Pendulum on Cart: linear cart translation + upright rod angle
    inverted_pendulum: {
      name: 'Inverted Pendulum on Cart',
      evalKinematics: (simState, timeSec) => {
        const poleTheta = simState?.x?.[0] || 0; // rod angle (rad) from upright
        const cartPos = Math.max(-1.4, Math.min(1.4, (simState?.x?.[1] || 0) * 0.35)); // cart position
        return {
          poleTheta: poleTheta,
          cartPos: cartPos,
          bobX: cartPos + Math.sin(poleTheta) * 0.8,
          bobY: Math.cos(poleTheta) * 0.8
        };
      }
    },

    // 4. Jacketed Exothermic Chemical CSTR: fluid level, mixing impeller, thermal color
    chemical_cstr: {
      name: 'Exothermic Chemical Batch Reactor (CSTR)',
      evalKinematics: (simState, timeSec) => {
        const conc = Math.max(0, Math.min(2.5, (simState?.x?.[0] || 1.0)));
        const temp = simState?.x?.[1] || 0;
        const impellerSpeed = 6.0;
        const impellerAngle = (timeSec * impellerSpeed) % (Math.PI * 2);
        // Thermal/concentration color: from cool cyan (low) to hot amber/red (high)
        const tNorm = Math.max(0, Math.min(1, conc / 2.0));
        return {
          concentration: conc,
          temperature: temp,
          impellerAngle: impellerAngle,
          fluidLevel: 0.65 + Math.sin(timeSec * 3) * 0.015,
          colorRatio: tNorm
        };
      }
    },

    // 5. Mass-Spring-Damper: Helical coil spring deflection, dashpot, vibrating mass
    mass_spring_damper: {
      name: 'Active Mass-Spring-Damper System',
      evalKinematics: (simState, timeSec) => {
        const displacement = Math.max(-0.6, Math.min(0.6, (simState?.x?.[0] || 0) * 0.4));
        const velocity = simState?.x?.[1] || 0;
        return {
          displacement: displacement,
          velocity: velocity,
          springCoils: 12,
          springLength: 0.8 + displacement
        };
      }
    }
  };

  // Plant name aliases
  PLANT_KINEMATICS.dcmotor = PLANT_KINEMATICS.dc_motor;
  PLANT_KINEMATICS.chemical = PLANT_KINEMATICS.chemical_cstr;
  PLANT_KINEMATICS.cstr = PLANT_KINEMATICS.chemical_cstr;
  PLANT_KINEMATICS.pendulum = PLANT_KINEMATICS.inverted_pendulum;
  PLANT_KINEMATICS.suspension = PLANT_KINEMATICS.mass_spring_damper;
  PLANT_KINEMATICS.robot_arm = PLANT_KINEMATICS.dc_motor;
  PLANT_KINEMATICS.maglev = PLANT_KINEMATICS.mass_spring_damper;

  // =========================================================================
  // 4. TOPOLOGY NODES CONFIGURATION
  // =========================================================================
  const TOPOLOGY_NODES = {
    ref:         { id: 'ref',         label: 'Reference Generator', sub: 'Setpoint r(t)',  pos: [-2.4,  0.5, 0.0], hitR: 40 },
    summing:     { id: 'summing',     label: 'Summing Junction',    sub: 'Error e = r - y', pos: [-1.6,  0.5, 0.0], hitR: 35 },
    controller:  { id: 'controller',  label: 'Controller Unit',     sub: 'Control Algorithm',pos: [-0.65, 0.5, 0.0], hitR: 50 },
    actuator:    { id: 'actuator',    label: 'Actuator Unit',       sub: 'Drive u(t)',     pos: [ 0.35,  0.5, 0.0], hitR: 45 },
    disturbance: { id: 'disturbance', label: 'Disturbance Vector',  sub: 'Load d(t)',      pos: [ 1.45,  1.3, 0.0], hitR: 35 },
    plant:       { id: 'plant',       label: 'Physical Plant Twin', sub: 'Dynamic System', pos: [ 1.45,  0.0, 0.0], hitR: 70 },
    sensor:      { id: 'sensor',      label: 'Sensor Transducer',   sub: 'Feedback y(t)',  pos: [ 2.45,  0.0, 0.0], hitR: 40 },
  };

  // Wire routing paths for signal particles
  const SIGNAL_PATHS = [
    { from: 'ref',         to: 'summing',    signalKey: 'r',   col: '#00F5D4' },
    { from: 'summing',     to: 'controller', signalKey: 'err', col: '#FFB020' },
    { from: 'controller',  to: 'actuator',   signalKey: 'u',   col: '#A78BFA' },
    { from: 'actuator',    to: 'plant',      signalKey: 'u',   col: '#39FF14' },
    { from: 'disturbance', to: 'plant',      signalKey: 'd',   col: '#FF4D4F' },
    { from: 'plant',       to: 'sensor',     signalKey: 'y',   col: '#00F5D4' },
    // Feedback path: sensor -> bottom drop -> left return -> summing junction bottom
    { from: 'sensor',      via: [[2.45, -0.9, 0], [-1.6, -0.9, 0]], to: 'summing', signalKey: 'y', col: '#00B4D8' }
  ];

  // =========================================================================
  // 5. MAIN 3D CONTROLLER & DIGITAL TWIN ENGINE CLASS
  // =========================================================================
  class Controller3DEngine {
    constructor(canvasOrId, options = {}) {
      if (typeof canvasOrId === 'string') {
        this.canvas = typeof document !== 'undefined' ? document.getElementById(canvasOrId) : null;
      } else {
        this.canvas = canvasOrId || null;
      }

      this.ctx = this.canvas && this.canvas.getContext ? this.canvas.getContext('2d') : null;
      this.W = this.canvas ? this.canvas.width : (options.width || 800);
      this.H = this.canvas ? this.canvas.height : (options.height || 450);

      // Camera Orbit, Pan & Zoom
      this.rotX = options.rotX !== undefined ? options.rotX : 0.35;
      this.rotY = options.rotY !== undefined ? options.rotY : -0.52;
      this.panX = options.panX !== undefined ? options.panX : 0;
      this.panY = options.panY !== undefined ? options.panY : 0;
      this.zoom = options.zoom !== undefined ? options.zoom : 1.0;
      this.fov  = options.fov  !== undefined ? options.fov  : 500;

      // Animation & Simulation State
      this.t       = 0;
      this.paused  = false;
      this.raf     = null;
      this.fps     = 60;
      this._lastTs = 0;
      this._frameCount = 0;
      this._fpsTimer   = 0;

      // Active Plant & Controller
      this.plantKey = options.plantKey || 'dc_motor';
      this.ctrlId   = options.ctrlId   || 'pid';
      this.theme    = getTheme(this.ctrlId);
      this.geom     = { L: 1.2, B: 0.6, H: 0.4, mass: 5.0, scale: 1.0, thick: 0.06 };
      this.perf     = { zeta: 0.707, wn: 5.2, ts: 0.65, mp: 3.8 };
      this.gains    = { kp: 1.0, ki: 0.5, kd: 0.2 };

      // Component Hit-Testing & Selection
      this.selectedComponent = 'plant';
      this.hoveredComponent  = null;
      this.nodeScreenCoords  = {};

      // Signal Particles Buffer (live particle flow along cables)
      this.particles = [];
      this.initParticles();

      // 3D State Trajectory History Buffer [x1, x2, u]
      this.trajectory = [];
      this.maxTrajectoryPoints = 180;
      this.showTrajectory = true;
      this.showParticles  = true;
      this.isComparisonMode = false;
      this.compareController = null;

      // User Interaction
      this._drag = false;
      this._isPanning = false;
      this._mx = 0;
      this._my = 0;

      if (this.canvas && typeof window !== 'undefined') {
        this._bindEvents();
      }
    }

    initParticles() {
      this.particles = [];
      SIGNAL_PATHS.forEach((path, pathIdx) => {
        const count = 5;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            pathIdx: pathIdx,
            progress: i / count,
            speed: 0.35 + Math.random() * 0.2,
            size: 2.5 + Math.random() * 1.5,
            color: path.col
          });
        }
      });
    }

    _bindEvents() {
      const cv = this.canvas;
      if (!cv) return;

      cv.addEventListener('mousedown', (e) => {
        this._drag = true;
        this._isPanning = e.button === 2 || e.shiftKey;
        this._mx = e.clientX;
        this._my = e.clientY;

        // Hit-test on click
        const rect = cv.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const hit = this.hitTest(clickX, clickY);
        if (hit) {
          this.selectComponent(hit);
        }
      });

      window.addEventListener('mouseup', () => {
        this._drag = false;
        this._isPanning = false;
      });

      window.addEventListener('mousemove', (e) => {
        const rect = cv.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;

        if (this._drag) {
          const dx = e.clientX - this._mx;
          const dy = e.clientY - this._my;

          if (this._isPanning) {
            this.panX += dx;
            this.panY += dy;
          } else {
            this.rotY += dx * 0.008;
            this.rotX = Math.max(-1.45, Math.min(1.45, this.rotX + dy * 0.008));
          }
          this._mx = e.clientX;
          this._my = e.clientY;
        } else {
          // Hover hit-test
          const hit = this.hitTest(curX, curY);
          if (hit !== this.hoveredComponent) {
            this.hoveredComponent = hit;
            cv.style.cursor = hit ? 'pointer' : 'default';
          }
        }
      });

      cv.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.zoom = Math.max(0.35, Math.min(3.5, this.zoom - e.deltaY * 0.0014));
      }, { passive: false });

      // Prevent right-click context menu for panning
      cv.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    project(p3) {
      return projectPoint(p3, this.rotX, this.rotY, this.zoom, this.fov, this.W, this.H, this.panX, this.panY);
    }

    hitTest(pixelX, pixelY) {
      for (const [nodeId, sc] of Object.entries(this.nodeScreenCoords)) {
        if (!sc) continue;
        const dist = Math.hypot(pixelX - sc.x, pixelY - sc.y);
        const hitR = (sc.hitR || 40) * Math.min(1.8, Math.max(0.6, this.zoom));
        if (dist <= hitR) {
          return nodeId;
        }
      }
      return null;
    }

    selectComponent(componentId) {
      this.selectedComponent = componentId;
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('acep:3dComponentSelected', {
          detail: {
            componentId: componentId,
            node: TOPOLOGY_NODES[componentId],
            ctrlId: this.ctrlId,
            plantKey: this.plantKey,
            simState: this.getLiveSimState()
          }
        }));
      }
    }

    getLiveSimState() {
      if (typeof window !== 'undefined' && window._acepSimulationState) {
        return window._acepSimulationState;
      }
      return {
        x: [0.0, 0.0],
        x_hat: [0.0, 0.0],
        u: 0.0,
        u_sat: 0.0,
        r: 1.0,
        err: 1.0,
        d: 0.0,
        residual: 0.0,
        actuatorHealth: 1.0,
        sensorBias: 0.0,
        fdiActive: false
      };
    }

    // -----------------------------------------------------------------------
    // Canvas Drawing Helpers
    // -----------------------------------------------------------------------
    _poly(pts, fill, stroke, lw) {
      const ctx = this.ctx;
      if (!ctx || pts.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }

    _face(corners3, fill, stroke, lw) {
      const pts = corners3.map(c => this.project(c)).filter(Boolean);
      if (pts.length < 3) return;
      this._poly(pts, fill, stroke, lw || 0.8);
    }

    _box(cx, cy, cz, lx, ly, lz, baseColor, edgeColor, alpha) {
      const a = alpha !== undefined ? alpha : 1;
      const half = [lx/2, ly/2, lz/2];
      const C = (dx,dy,dz) => [cx+dx*half[0], cy+dy*half[1], cz+dz*half[2]];
      const V = [
        C(-1,-1,-1), C(1,-1,-1), C(1,1,-1), C(-1,1,-1), // front  0-3
        C(-1,-1, 1), C(1,-1, 1), C(1,1, 1), C(-1,1, 1), // back   4-7
      ];

      const hexAlpha = Math.round(a * 255).toString(16).padStart(2,'0');
      const darken = (col, f) => {
        try {
          const v = parseInt(col.replace('#','').slice(0,6), 16);
          const r = Math.max(0, Math.min(255, ((v>>16)&255)*f)) | 0;
          const g = Math.max(0, Math.min(255, ((v>>8)&255)*f)) | 0;
          const b = Math.max(0, Math.min(255, (v&255)*f)) | 0;
          return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}${hexAlpha}`;
        } catch (e) {
          return col;
        }
      };

      const faces = [
        { v:[V[0],V[1],V[2],V[3]], f: darken(baseColor, 0.70) },
        { v:[V[4],V[5],V[6],V[7]], f: darken(baseColor, 0.45) },
        { v:[V[0],V[4],V[7],V[3]], f: darken(baseColor, 0.60) },
        { v:[V[1],V[5],V[6],V[2]], f: darken(baseColor, 0.55) },
        { v:[V[3],V[2],V[6],V[7]], f: darken(baseColor, 0.95) },
        { v:[V[0],V[1],V[5],V[4]], f: darken(baseColor, 0.30) },
      ];

      // Depth sort
      const depth = (face) => {
        const avg = face.v.reduce((acc,c) => acc + c[2], 0) / face.v.length;
        let tmp = rotY([0,0,avg], this.rotY);
        tmp = rotX(tmp, this.rotX);
        return tmp[2];
      };
      faces.sort((a,b) => depth(a) - depth(b));

      const e = edgeColor || 'rgba(255,255,255,0.12)';
      faces.forEach(f => this._face(f.v, f.f, e));
    }

    _cylinder(cx, cy, cz, r, h, segs = 14, colTop = '#ffffff', colSide = '#888888', alpha = 0.85, axis = 'Y') {
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        if (axis === 'Y') {
          pts.push([cx + Math.cos(a)*r, cy, cz + Math.sin(a)*r]);
        } else if (axis === 'X') {
          pts.push([cx, cy + Math.cos(a)*r, cz + Math.sin(a)*r]);
        } else {
          pts.push([cx + Math.cos(a)*r, cy + Math.sin(a)*r, cz]);
        }
      }

      for (let i = 0; i < segs; i++) {
        const p0 = pts[i], p1 = pts[i+1];
        let face;
        if (axis === 'Y') {
          face = [[p0[0], p0[1], p0[2]], [p1[0], p1[1], p1[2]], [p1[0], p1[1]+h, p1[2]], [p0[0], p0[1]+h, p0[2]]];
        } else if (axis === 'X') {
          face = [[p0[0], p0[1], p0[2]], [p1[0], p1[1], p1[2]], [p1[0]+h, p1[1], p1[2]], [p0[0]+h, p0[1], p0[2]]];
        } else {
          face = [[p0[0], p0[1], p0[2]], [p1[0], p1[1], p1[2]], [p1[0], p1[1], p1[2]+h], [p0[0], p0[1], p0[2]+h]];
        }
        this._face(face, colSide, 'rgba(255,255,255,0.06)', 0.5);
      }

      // Top cap
      const capPts = pts.map(p => {
        if (axis === 'Y') return [p[0], p[1]+h, p[2]];
        if (axis === 'X') return [p[0]+h, p[1], p[2]];
        return [p[0], p[1], p[2]+h];
      });
      this._face(capPts, colTop, 'rgba(255,255,255,0.15)', 0.6);
    }

    _line3(p1, p2, color = 'rgba(255,255,255,0.5)', lw = 1) {
      const a = this.project(p1), b = this.project(p2);
      if (!a || !b) return;
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.stroke();
    }

    _label3(p3, text, color = '#ffffff', size = 10, bold = false) {
      const p = this.project(p3);
      if (!p) return;
      const ctx = this.ctx;
      ctx.font = `${bold ? 'bold ' : ''}${size}px var(--font-mono, monospace)`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(text, p[0], p[1]);
    }

    // -----------------------------------------------------------------------
    // 6. DETAILED 3D CLOSED-LOOP TOPOLOGY RENDERING
    // -----------------------------------------------------------------------
    renderTopology(simState) {
      const ctx = this.ctx;
      const t = this.t;
      const r = Number(simState.r !== undefined ? simState.r : 1.0);
      const e = Number(simState.err !== undefined ? simState.err : (r - (simState.x?.[0] || 0)));
      const u = Number(simState.u || 0);
      const uSat = Number(simState.u_sat !== undefined ? simState.u_sat : u);
      const dist = Number(simState.d || 0);
      const y = Number(simState.x?.[0] || 0);
      const isSaturated = Math.abs(u - uSat) > 1e-3 || (simState.u_limit && Math.abs(u) >= simState.u_limit * 0.99);
      const isFault = simState.fdiActive || Math.abs(simState.sensorBias || 0) > 1e-3 || (simState.residual && simState.residual > 0.15);

      this.nodeScreenCoords = {};

      // ── WIRING & SIGNAL CABLES ──────────────────────────────────────────
      SIGNAL_PATHS.forEach(sp => {
        const nFrom = TOPOLOGY_NODES[sp.from];
        const nTo = TOPOLOGY_NODES[sp.to];
        if (!nFrom || !nTo) return;

        if (sp.via && Array.isArray(sp.via)) {
          let curr = nFrom.pos;
          sp.via.forEach(vPt => {
            this._line3(curr, vPt, 'rgba(0,180,216,0.35)', 1.5);
            curr = vPt;
          });
          this._line3(curr, nTo.pos, 'rgba(0,180,216,0.35)', 1.5);
        } else {
          this._line3(nFrom.pos, nTo.pos, sp.col + '44', 2.0);
        }
      });

      // ── SIGNAL PARTICLES FLOW ───────────────────────────────────────────
      if (this.showParticles) {
        this.updateAndDrawParticles(simState);
      }

      // ── 1. REFERENCE GENERATOR ─────────────────────────────────────────
      {
        const node = TOPOLOGY_NODES.ref;
        const [nx, ny, nz] = node.pos;
        const pr = this.project(node.pos);
        if (pr) this.nodeScreenCoords.ref = { x: pr[0], y: pr[1], hitR: node.hitR };

        const isSel = this.selectedComponent === 'ref';
        const isHov = this.hoveredComponent === 'ref';

        this._cylinder(nx, ny - 0.25, nz, 0.18, 0.5, 12, '#00F5D4', '#00F5D466', 0.85);
        this._box(nx, ny + 0.3, nz, 0.45, 0.25, 0.35, '#0B1E2D', isSel ? '#00F5D4' : '#00F5D444', 0.9);
        
        // Signal Wave Pulse
        const pR = 0.25 + (t % 1.5) * 0.2;
        const pA = Math.max(0, 1 - (t % 1.5) / 1.5);
        this._cylinder(nx, ny + 0.45, nz, pR, 0.02, 16, `rgba(0,245,212,${pA * 0.6})`, `rgba(0,245,212,${pA * 0.3})`, 0.5);

        this._label3([nx, ny + 0.32, nz - 0.2], `r=${r.toFixed(2)}`, '#00F5D4', 10, true);
        this._label3([nx, ny - 0.38, nz], 'COMMAND INPUT', '#8B949E', 9);
        if (isSel || isHov) this.drawSelectionBrackets(node.pos, 0.35, isSel ? '#00F5D4' : '#FFB020');
      }

      // ── 2. SUMMING JUNCTION (Σ) ─────────────────────────────────────────
      {
        const node = TOPOLOGY_NODES.summing;
        const [nx, ny, nz] = node.pos;
        const pr = this.project(node.pos);
        if (pr) this.nodeScreenCoords.summing = { x: pr[0], y: pr[1], hitR: node.hitR };

        const isSel = this.selectedComponent === 'summing';
        const isHov = this.hoveredComponent === 'summing';

        this._cylinder(nx, ny - 0.18, nz, 0.22, 0.36, 16, '#1A2E3B', '#FFB02088', 0.9);
        this._label3([nx, ny + 0.05, nz - 0.25], 'Σ', '#FFB020', 16, true);
        this._label3([nx, ny + 0.25, nz], `e=${e.toFixed(3)}`, '#FFB020', 9);
        this._label3([nx - 0.28, ny + 0.12, nz], '+', '#00F5D4', 11, true);
        this._label3([nx, ny - 0.32, nz], '−', '#FF4D4F', 13, true);
        if (isSel || isHov) this.drawSelectionBrackets(node.pos, 0.3, isSel ? '#FFB020' : '#00F5D4');
      }

      // ── 3. CONTROLLER CHASSIS UNIT ──────────────────────────────────────
      {
        const node = TOPOLOGY_NODES.controller;
        const [nx, ny, nz] = node.pos;
        const pr = this.project(node.pos);
        if (pr) this.nodeScreenCoords.controller = { x: pr[0], y: pr[1], hitR: node.hitR };

        const isSel = this.selectedComponent === 'controller';
        const isHov = this.hoveredComponent === 'controller';
        const th = this.theme;

        // Controller Main Cabinet
        this._box(nx, ny, nz, 0.75, 0.55, 0.45, th.base, isSel ? '#ffffff' : th.glow, 0.9);

        // OLED Display Panel on Front Face
        this._box(nx, ny + 0.06, nz - 0.24, 0.55, 0.28, 0.02, '#060D1A', th.base, 0.95);
        this._label3([nx, ny + 0.12, nz - 0.27], `${th.label} DSP`, th.base, 10, true);
        this._label3([nx, ny - 0.02, nz - 0.27], `u=${u.toFixed(2)}`, '#39FF14', 9);

        // Blinking computation LEDs
        const ledOn = Math.sin(t * 12) > 0;
        this._cylinder(nx - 0.22, ny + 0.2, nz - 0.24, 0.02, 0.01, 8, ledOn ? '#39FF14' : '#114411', '#000000', 0.9);
        this._cylinder(nx - 0.15, ny + 0.2, nz - 0.24, 0.02, 0.01, 8, isSaturated ? '#FF4D4F' : '#FFB020', '#000000', 0.9);

        this._label3([nx, ny - 0.38, nz], `${th.type}`, 'rgba(240,246,252,0.6)', 8);
        if (isSel || isHov) this.drawSelectionBrackets(node.pos, 0.45, isSel ? th.base : '#00F5D4');
      }

      // ── 4. ACTUATOR UNIT ────────────────────────────────────────────────
      {
        const node = TOPOLOGY_NODES.actuator;
        const [nx, ny, nz] = node.pos;
        const pr = this.project(node.pos);
        if (pr) this.nodeScreenCoords.actuator = { x: pr[0], y: pr[1], hitR: node.hitR };

        const isSel = this.selectedComponent === 'actuator';
        const isHov = this.hoveredComponent === 'actuator';

        // Actuator housing
        this._cylinder(nx, ny - 0.25, nz, 0.22, 0.5, 14, '#2B3A4A', '#4A5D6E', 0.88, 'X');

        // Dynamic stroke shaft extension based on control command u
        const strokeX = Math.max(-0.25, Math.min(0.25, u * 0.05));
        this._cylinder(nx + 0.25, ny - 0.08, nz, 0.09, 0.35 + strokeX, 10, '#39FF14', '#228811', 0.9, 'X');

        // Saturation Lightning Warning Aura
        if (isSaturated) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 18);
          this._cylinder(nx, ny - 0.28, nz, 0.28 + pulse * 0.08, 0.56, 12, `rgba(255,77,79,${0.4 + pulse * 0.4})`, 'rgba(255,176,32,0.6)', 0.6, 'X');
          this._label3([nx, ny + 0.42, nz], '⚠ ACTUATOR SATURATION', '#FF4D4F', 9, true);
        }

        this._label3([nx, ny - 0.38, nz], 'ACTUATOR DRIVE', '#8B949E', 9);
        if (isSel || isHov) this.drawSelectionBrackets(node.pos, 0.4, isSel ? (isSaturated ? '#FF4D4F' : '#39FF14') : '#00F5D4');
      }

      // ── 5. DISTURBANCE FORCE VECTOR ─────────────────────────────────────
      {
        const node = TOPOLOGY_NODES.disturbance;
        const [nx, ny, nz] = node.pos;
        const pr = this.project(node.pos);
        if (pr) this.nodeScreenCoords.disturbance = { x: pr[0], y: pr[1], hitR: node.hitR };

        const isSel = this.selectedComponent === 'disturbance';
        const isHov = this.hoveredComponent === 'disturbance';
        const hasDist = Math.abs(dist) > 1e-3;

        const arrowCol = hasDist ? '#FF4D4F' : 'rgba(255,77,79,0.3)';
        const arrowLen = hasDist ? Math.min(0.8, 0.3 + Math.abs(dist) * 0.15) : 0.3;

        // Vector stem downward to plant
        this._line3([nx, ny, nz], [nx, ny - arrowLen, nz], arrowCol, hasDist ? 3.0 : 1.0);
        // Arrowhead cone
        this._cylinder(nx, ny - arrowLen - 0.12, nz, 0.08, 0.12, 8, arrowCol, arrowCol, 0.9);

        this._label3([nx, ny + 0.15, nz], hasDist ? `d=${dist.toFixed(2)} N` : 'd=0.00', arrowCol, 9, hasDist);
        if (isSel || isHov) this.drawSelectionBrackets(node.pos, 0.25, '#FF4D4F');
      }

      // ── 6. PHYSICAL PLANT TWIN (Plant-Specific Dynamic Kinematics) ──────
      {
        const node = TOPOLOGY_NODES.plant;
        const pr = this.project(node.pos);
        if (pr) this.nodeScreenCoords.plant = { x: pr[0], y: pr[1], hitR: node.hitR };

        const isSel = this.selectedComponent === 'plant';
        const isHov = this.hoveredComponent === 'plant';

        this.renderPlantKinematics(node.pos, simState);

        this._label3([node.pos[0], node.pos[1] - 0.72, node.pos[2]], `y(t) = ${y.toFixed(3)}`, '#00F5D4', 10, true);
        if (isSel || isHov) this.drawSelectionBrackets(node.pos, 0.75, isSel ? '#00F5D4' : '#A78BFA');
      }

      // ── 7. SENSOR TRANSDUCER & FDI MONITOR ──────────────────────────────
      {
        const node = TOPOLOGY_NODES.sensor;
        const [nx, ny, nz] = node.pos;
        const pr = this.project(node.pos);
        if (pr) this.nodeScreenCoords.sensor = { x: pr[0], y: pr[1], hitR: node.hitR };

        const isSel = this.selectedComponent === 'sensor';
        const isHov = this.hoveredComponent === 'sensor';

        // Outer transducer pickup ring
        const ringCol = isFault ? '#FF007A' : '#00B4D8';
        this._cylinder(nx, ny - 0.22, nz, 0.22, 0.44, 16, ringCol, ringCol + '66', 0.85);

        // Inner optical encoder disc
        const encAngle = (t * 8) % (Math.PI * 2);
        this._cylinder(nx, ny - 0.18, nz, 0.14, 0.36, 12, '#060D1A', '#39FF1488', 0.95);

        // Strobe pulse ring on sampling
        const strobe = 0.3 + 0.7 * Math.abs(Math.sin(t * 10));
        this._cylinder(nx, ny + 0.25, nz, 0.26 * strobe, 0.02, 16, ringCol + '88', ringCol + '44', 0.5);

        if (isFault) {
          this._label3([nx, ny + 0.42, nz], '⚠ SENSOR FAULT / FDI ALERT', '#FF007A', 9, true);
        } else {
          this._label3([nx, ny + 0.38, nz], 'ENCODER READY', '#39FF14', 8);
        }

        this._label3([nx, ny - 0.38, nz], 'SENSOR PROBE', '#8B949E', 9);
        if (isSel || isHov) this.drawSelectionBrackets(node.pos, 0.35, isSel ? ringCol : '#00F5D4');
      }
    }

    // -----------------------------------------------------------------------
    // 7. SPECIFIC 3D PLANT KINEMATICS RENDERERS
    // -----------------------------------------------------------------------
    renderPlantKinematics(center3, simState) {
      const [cx, cy, cz] = center3;
      const pKey = (this.plantKey || 'dc_motor').toLowerCase().replace('-', '_');

      if (pKey.includes('quad') || pKey.includes('drone') || pKey.includes('uav')) {
        this.renderQuadrotorModel(cx, cy, cz, simState);
      } else if (pKey.includes('pendulum') || pKey.includes('cart')) {
        this.renderInvertedPendulumModel(cx, cy, cz, simState);
      } else if (pKey.includes('cstr') || pKey.includes('chemical') || pKey.includes('reactor')) {
        this.renderCSTRModel(cx, cy, cz, simState);
      } else if (pKey.includes('spring') || pKey.includes('damper') || pKey.includes('suspension')) {
        this.renderMassSpringDamperModel(cx, cy, cz, simState);
      } else {
        // Default: Precision Industrial DC Servomotor
        this.renderDCMotorModel(cx, cy, cz, simState);
      }
    }

    // 1. DC Motor Kinematics: Stator, Armature, Rotating Rotor Shaft & Load Flywheel
    renderDCMotorModel(cx, cy, cz, simState) {
      const k = PLANT_KINEMATICS.dc_motor.evalKinematics(simState, this.t);
      const vib = k.vibration;
      const th = k.theta;

      // Stator outer steel shell
      this._cylinder(cx + vib, cy - 0.3, cz, 0.32, 0.6, 16, '#1A2E3B', '#00F5D444', 0.88, 'Z');

      // Copper winding segments inside casing
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const wx = cx + Math.cos(a) * 0.22;
        const wy = cy + Math.sin(a) * 0.22;
        this._cylinder(wx, wy - 0.05, cz - 0.25, 0.05, 0.5, 8, '#FF9F1C', '#D97706', 0.9, 'Z');
      }

      // Rotating Rotor Shaft
      this._cylinder(cx, cy, cz - 0.45, 0.06, 0.9, 12, '#E2E8F0', '#94A3B8', 0.95, 'Z');

      // Inertial Flywheel Load with spinning spokes
      const fwZ = cz + 0.45;
      this._cylinder(cx, cy, fwZ, 0.38, 0.08, 18, '#334155', '#00F5D488', 0.92, 'Z');
      
      // Radial spokes spinning at shaft angular velocity
      for (let i = 0; i < 4; i++) {
        const a = th + (i / 4) * Math.PI * 2;
        const sx = cx + Math.cos(a) * 0.35;
        const sy = cy + Math.sin(a) * 0.35;
        this._line3([cx, cy, fwZ + 0.09], [sx, sy, fwZ + 0.09], '#00F5D4', 2.0);
      }

      this._label3([cx, cy + 0.42, cz], `ω = ${k.omega.toFixed(2)} rad/s`, '#00F5D4', 9);
    }

    // 2. Quadrotor Kinematics: Cross airframe, Avionics pod, 4 spinning prop discs, Pitch tilt
    renderQuadrotorModel(cx, cy, cz, simState) {
      const k = PLANT_KINEMATICS.quadrotor.evalKinematics(simState, this.t);
      const pitch = k.pitch;
      const propA = k.propAngle;
      const armL = 0.55;

      // Center avionics fuselage pod
      this._box(cx, cy + k.altitudeOffset, cz, 0.28, 0.14, 0.28, '#0F172A', '#38BDF8', 0.95);

      // 4 Carbon-fiber arms extending outwards
      const arms = [
        [armL, 0, 0], [-armL, 0, 0], [0, 0, armL], [0, 0, -armL]
      ];

      arms.forEach(([dx, dy, dz], i) => {
        // Apply pitch tilt
        let pTip = [cx + dx, cy + dy + Math.sin(pitch) * dz, cz + Math.cos(pitch) * dz];
        this._line3([cx, cy, cz], pTip, '#64748B', 3.0);

        // Motor nacelle at arm tip
        this._cylinder(pTip[0], pTip[1] - 0.04, pTip[2], 0.06, 0.08, 10, '#1E293B', '#38BDF8', 0.9);

        // Spinning Propeller disc (translucent blur)
        const pR = 0.22;
        const p1 = [pTip[0] + Math.cos(propA + i*1.2) * pR, pTip[1] + 0.05, pTip[2] + Math.sin(propA + i*1.2) * pR];
        const p2 = [pTip[0] - Math.cos(propA + i*1.2) * pR, pTip[1] + 0.05, pTip[2] - Math.sin(propA + i*1.2) * pR];
        this._line3(p1, p2, '#00F5D4', 2.5);
        this._cylinder(pTip[0], pTip[1] + 0.04, pTip[2], pR, 0.01, 14, 'rgba(0,245,212,0.18)', 'rgba(0,245,212,0.4)', 0.5);
      });

      this._label3([cx, cy + 0.45, cz], `θ_pitch = ${(pitch * 180 / Math.PI).toFixed(1)}°`, '#38BDF8', 9);
    }

    // 3. Inverted Pendulum Kinematics: Steel rails, sliding cart, rotating balance rod
    renderInvertedPendulumModel(cx, cy, cz, simState) {
      const k = PLANT_KINEMATICS.inverted_pendulum.evalKinematics(simState, this.t);
      const cartX = cx + k.cartPos;
      const rodL = 0.85;
      const poleTheta = k.poleTheta;

      // Ground guide rails
      this._line3([cx - 1.2, cy - 0.35, cz], [cx + 1.2, cy - 0.35, cz], '#475569', 3.0);
      this._line3([cx - 1.2, cy - 0.35, cz - 0.15], [cx + 1.2, cy - 0.35, cz - 0.15], '#334155', 2.0);

      // Sliding cart chassis
      this._box(cartX, cy - 0.22, cz - 0.07, 0.42, 0.18, 0.28, '#1E293B', '#00F5D4', 0.92);

      // Cart wheels
      [-0.15, 0.15].forEach(wx => {
        this._cylinder(cartX + wx, cy - 0.33, cz + 0.08, 0.04, 0.03, 10, '#64748B', '#000000', 0.9, 'Z');
      });

      // Pivot axle joint
      const pivotY = cy - 0.12;
      this._cylinder(cartX, pivotY - 0.02, cz, 0.04, 0.06, 10, '#F59E0B', '#B45309', 0.95, 'Z');

      // Upright Swinging Pendulum Rod
      const tipX = cartX + Math.sin(poleTheta) * rodL;
      const tipY = pivotY + Math.cos(poleTheta) * rodL;
      this._line3([cartX, pivotY, cz], [tipX, tipY, cz], '#F43F5E', 3.5);

      // Top balance bob mass
      this._cylinder(tipX, tipY - 0.06, cz, 0.08, 0.12, 12, '#F43F5E', '#BE123C', 0.95);

      this._label3([cx, cy + 0.82, cz], `θ = ${(poleTheta * 180 / Math.PI).toFixed(2)}°`, '#F43F5E', 9);
    }

    // 4. Chemical CSTR Kinematics: Jacketed reactor, mixing impeller, liquid surface
    renderCSTRModel(cx, cy, cz, simState) {
      const k = PLANT_KINEMATICS.chemical_cstr.evalKinematics(simState, this.t);
      const ratio = k.colorRatio; // 0 to 1

      // Fluid color: transitions from cool cyan (0.0) to hot amber/red (1.0)
      const rVal = Math.round(ratio * 240 + (1 - ratio) * 0);
      const gVal = Math.round((1 - ratio) * 245 + ratio * 80);
      const bVal = Math.round((1 - ratio) * 212 + ratio * 30);
      const fluidCol = `rgba(${rVal},${gVal},${bVal},0.7)`;

      // Outer cooling jacket ribs
      this._cylinder(cx, cy - 0.45, cz, 0.38, 0.85, 16, '#1E293B', '#38BDF844', 0.85);

      // Liquid volume inside
      this._cylinder(cx, cy - 0.42, cz, 0.32, 0.75 * k.fluidLevel, 14, fluidCol, fluidCol, 0.8);

      // Overhead agitator motor
      this._cylinder(cx, cy + 0.42, cz, 0.12, 0.22, 12, '#334155', '#64748B', 0.9);

      // Vertical stirrer shaft
      this._cylinder(cx, cy - 0.35, cz, 0.03, 0.8, 8, '#CBD5E1', '#94A3B8', 0.95);

      // 4-blade impeller spinning in fluid
      const impY = cy - 0.3;
      for (let i = 0; i < 4; i++) {
        const a = k.impellerAngle + (i / 4) * Math.PI * 2;
        const bx = cx + Math.cos(a) * 0.22;
        const bz = cz + Math.sin(a) * 0.22;
        this._line3([cx, impY, cz], [bx, impY, bz], '#E2E8F0', 3.0);
      }

      this._label3([cx, cy + 0.72, cz], `C_A = ${k.concentration.toFixed(2)} mol/L`, fluidCol, 9);
    }

    // 5. Mass-Spring-Damper Kinematics: Helical spring, Dashpot, Vibrating Mass
    renderMassSpringDamperModel(cx, cy, cz, simState) {
      const k = PLANT_KINEMATICS.mass_spring_damper.evalKinematics(simState, this.t);
      const disp = k.displacement;
      const wallX = cx - 0.9;
      const massX = cx + disp;

      // Ground wall anchor
      this._box(wallX, cy, cz, 0.08, 0.75, 0.45, '#334155', '#64748B', 0.95);
      // Wall hatch lines
      for (let i = -3; i <= 3; i++) {
        const hy = cy + i * 0.1;
        this._line3([wallX - 0.04, hy - 0.04, cz], [wallX, hy, cz], '#94A3B8', 1.0);
      }

      // Compressing/Expanding Helical Spring
      const coils = 12;
      const springStart = wallX + 0.04;
      const springEnd = massX - 0.25;
      const springLen = springEnd - springStart;
      let lastPt = [springStart, cy + 0.12, cz];

      for (let i = 1; i <= coils * 4; i++) {
        const progress = i / (coils * 4);
        const a = progress * coils * Math.PI * 2;
        const sx = springStart + progress * springLen;
        const sy = cy + 0.12 + Math.sin(a) * 0.07;
        const sz = cz + Math.cos(a) * 0.07;
        const curPt = [sx, sy, sz];
        this._line3(lastPt, curPt, '#38BDF8', 1.8);
        lastPt = curPt;
      }

      // Viscous Damper / Dashpot Cylinder (lower line)
      const dashY = cy - 0.15;
      const cylLen = 0.45;
      this._cylinder(springStart, dashY - 0.05, cz, 0.06, cylLen, 10, '#1E293B', '#64748B', 0.9, 'X');
      // Moving Piston Rod
      this._line3([springStart + cylLen * 0.6, dashY, cz], [massX - 0.25, dashY, cz], '#E2E8F0', 3.0);

      // Oscillating Mass Block
      this._box(massX, cy, cz, 0.45, 0.45, 0.45, '#0284C7', '#00F5D4', 0.92);
      this._label3([massX, cy + 0.05, cz - 0.24], 'M', '#F0F6FC', 14, true);

      this._label3([cx, cy + 0.55, cz], `x = ${disp.toFixed(3)} m`, '#38BDF8', 9);
    }

    // -----------------------------------------------------------------------
    // 8. 3D STATE TRAJECTORY RIBBON [x1, x2, u]
    // -----------------------------------------------------------------------
    addStatePoint(x1, x2, u) {
      if (!isFinite(x1) || !isFinite(x2) || !isFinite(u)) return;
      // Map state vector into 3D box coordinates
      const p = [
        Math.max(-2.5, Math.min(2.5, x1 * 0.8)),
        Math.max(-1.8, Math.min(1.8, x2 * 0.35 - 0.8)),
        Math.max(-1.5, Math.min(1.5, u * 0.15))
      ];
      this.trajectory.push(p);
      if (this.trajectory.length > this.maxTrajectoryPoints) {
        this.trajectory.shift();
      }
    }

    drawStateTrajectory() {
      if (this.trajectory.length < 2) return;
      const ctx = this.ctx;
      const pts = this.trajectory.map(p => this.project(p)).filter(Boolean);
      if (pts.length < 2) return;

      ctx.save();
      for (let i = 1; i < pts.length; i++) {
        const pA = pts[i-1], pB = pts[i];
        const alpha = Math.max(0.15, i / pts.length);
        ctx.beginPath();
        ctx.moveTo(pA[0], pA[1]);
        ctx.lineTo(pB[0], pB[1]);
        ctx.strokeStyle = `rgba(0, 245, 212, ${alpha * 0.85})`;
        ctx.lineWidth = 1.2 + alpha * 1.5;
        ctx.stroke();
      }

      // Glowing current point
      const last = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(last[0], last[1], 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#39FF14';
      ctx.shadowColor = '#39FF14';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // 9. SIGNAL PARTICLES ANIMATION
    // -----------------------------------------------------------------------
    updateAndDrawParticles(simState) {
      const ctx = this.ctx;
      const dt = 0.02;

      this.particles.forEach(pt => {
        const path = SIGNAL_PATHS[pt.pathIdx];
        if (!path) return;

        // Dynamic speed proportional to signal magnitude
        let sigMag = 1.0;
        if (path.signalKey === 'r')   sigMag = Math.abs(simState.r || 1.0);
        if (path.signalKey === 'err') sigMag = Math.abs(simState.err || 0.5);
        if (path.signalKey === 'u')   sigMag = Math.abs(simState.u || 1.0);
        if (path.signalKey === 'y')   sigMag = Math.abs(simState.x?.[0] || 1.0);
        if (path.signalKey === 'd')   sigMag = Math.abs(simState.d || 0.0);

        const currentSpeed = Math.min(3.0, Math.max(0.3, pt.speed * (0.4 + sigMag * 0.6)));
        pt.progress += dt * currentSpeed;
        if (pt.progress >= 1.0) pt.progress -= 1.0;

        // Interpolate 3D position along path
        const nFrom = TOPOLOGY_NODES[path.from];
        const nTo = TOPOLOGY_NODES[path.to];
        if (!nFrom || !nTo) return;

        let p3;
        if (path.via && Array.isArray(path.via)) {
          const segs = [nFrom.pos, ...path.via, nTo.pos];
          const segCount = segs.length - 1;
          const totalP = pt.progress * segCount;
          const sIdx = Math.min(segCount - 1, Math.floor(totalP));
          const localP = totalP - sIdx;
          const pA = segs[sIdx], pB = segs[sIdx + 1];
          p3 = [
            pA[0] + (pB[0] - pA[0]) * localP,
            pA[1] + (pB[1] - pA[1]) * localP,
            pA[2] + (pB[2] - pA[2]) * localP
          ];
        } else {
          p3 = [
            nFrom.pos[0] + (nTo.pos[0] - nFrom.pos[0]) * pt.progress,
            nFrom.pos[1] + (nTo.pos[1] - nFrom.pos[1]) * pt.progress,
            nFrom.pos[2] + (nTo.pos[2] - nFrom.pos[2]) * pt.progress
          ];
        }

        const pr = this.project(p3);
        if (pr) {
          ctx.beginPath();
          ctx.arc(pr[0], pr[1], pt.size * (this.zoom * 0.9), 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.fill();
        }
      });
    }

    // -----------------------------------------------------------------------
    // 10. SELECTION BRACKETS
    // -----------------------------------------------------------------------
    drawSelectionBrackets(pos3, radius, color = '#00F5D4') {
      const [cx, cy, cz] = pos3;
      const r = radius;
      const bLen = r * 0.35;
      const corners = [
        [cx - r, cy - r, cz], [cx + r, cy - r, cz],
        [cx + r, cy + r, cz], [cx - r, cy + r, cz]
      ];

      // Draw 4 corner wireframe brackets
      this._line3([cx - r, cy - r, cz], [cx - r + bLen, cy - r, cz], color, 2.0);
      this._line3([cx - r, cy - r, cz], [cx - r, cy - r + bLen, cz], color, 2.0);

      this._line3([cx + r, cy - r, cz], [cx + r - bLen, cy - r, cz], color, 2.0);
      this._line3([cx + r, cy - r, cz], [cx + r, cy - r + bLen, cz], color, 2.0);

      this._line3([cx + r, cy + r, cz], [cx + r - bLen, cy + r, cz], color, 2.0);
      this._line3([cx + r, cy + r, cz], [cx + r, cy + r - bLen, cz], color, 2.0);

      this._line3([cx - r, cy + r, cz], [cx - r + bLen, cy + r, cz], color, 2.0);
      this._line3([cx - r, cy + r, cz], [cx - r, cy + r - bLen, cz], color, 2.0);
    }

    // -----------------------------------------------------------------------
    // 11. GROUND GRID & SPATIAL ENVIRONMENT
    // -----------------------------------------------------------------------
    _drawGrid() {
      const ctx = this.ctx;
      const gridSize = 10;
      const gridSpacing = 0.5;
      const gridY = -1.1;

      ctx.strokeStyle = 'rgba(0, 245, 212, 0.05)';
      ctx.lineWidth = 0.6;

      for (let i = -gridSize; i <= gridSize; i++) {
        const p1 = this.project([i * gridSpacing, gridY, -gridSize * gridSpacing]);
        const p2 = this.project([i * gridSpacing, gridY,  gridSize * gridSpacing]);
        const p3 = this.project([-gridSize * gridSpacing, gridY, i * gridSpacing]);
        const p4 = this.project([ gridSize * gridSpacing, gridY, i * gridSpacing]);

        if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke(); }
        if (p3 && p4) { ctx.beginPath(); ctx.moveTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]); ctx.stroke(); }
      }

      // Coordinate Axis Indicators
      const o  = this.project([0, gridY, 0]);
      const ax = this.project([0.8, gridY, 0]);
      const az = this.project([0, gridY, 0.8]);
      if (o && ax) { ctx.strokeStyle = 'rgba(255,80,80,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(ax[0],ax[1]); ctx.stroke(); }
      if (o && az) { ctx.strokeStyle = 'rgba(80,180,255,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(az[0],az[1]); ctx.stroke(); }
    }

    // -----------------------------------------------------------------------
    // 12. FLOATING HUD READOUT
    // -----------------------------------------------------------------------
    _drawHUD(simState) {
      const ctx = this.ctx;
      const th = this.theme;
      const p = this.perf;
      const x0 = Number(simState.x?.[0] || 0);
      const x1 = Number(simState.x?.[1] || 0);
      const u = Number(simState.u || 0);
      const r = Number(simState.r !== undefined ? simState.r : 1.0);
      const isSat = simState.u_sat !== undefined && Math.abs(simState.u - simState.u_sat) > 1e-3;

      const lines = [
        `Digital Twin: ${th.label} × ${PLANT_KINEMATICS[this.plantKey]?.name || this.plantKey}`,
        `Ref r(t) = ${r.toFixed(2)} | Output y(t) = ${x0.toFixed(3)} | Error e = ${(r - x0).toFixed(3)}`,
        `Control Effort u = ${u.toFixed(2)} ${isSat ? '⚠ [SATURATED]' : '[LINEAR]'}`,
        `Dynamics: ζ = ${p.zeta?.toFixed(3) || '0.707'} | ωₙ = ${p.wn?.toFixed(2) || '5.20'} rad/s | Ts = ${p.ts?.toFixed(2) || '0.65'}s`
      ];

      ctx.save();
      ctx.fillStyle = 'rgba(6, 13, 26, 0.85)';
      ctx.strokeStyle = th.base + '55';
      ctx.lineWidth = 1.0;
      const bw = 340, bh = lines.length * 16 + 14;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(12, 12, bw, bh, 6);
      } else {
        ctx.rect(12, 12, bw, bh);
      }
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      lines.forEach((l, i) => {
        ctx.font = `${i === 0 ? 'bold ' : ''}10px var(--font-mono, monospace)`;
        ctx.fillStyle = i === 0 ? th.base : (l.includes('SATURATED') ? '#FF6B35' : 'rgba(240,246,252,0.85)');
        ctx.fillText(l, 20, 27 + i * 16);
      });
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // 13. MAIN SCENE RENDER LOOP
    // -----------------------------------------------------------------------
    render() {
      if (!this.canvas || !this.ctx) return;

      // Sync canvas dimensions
      if (this.canvas.clientWidth > 0 && (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== (this.canvas.clientHeight || 380))) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight || 380;
        this.W = this.canvas.width;
        this.H = this.canvas.height;
      }

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.W, this.H);

      // Radial dark sci-fi background
      const bg = ctx.createRadialGradient(this.W/2, this.H/2, 0, this.W/2, this.H/2, Math.max(this.W, this.H));
      bg.addColorStop(0, '#0a1628');
      bg.addColorStop(1, '#060d1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.W, this.H);

      // Ground plane grid
      this._drawGrid();

      // Retrieve synchronized real simulation data
      const simState = this.getLiveSimState();

      // Update 3D state trajectory buffer
      if (simState && Array.isArray(simState.x) && simState.x.length > 0) {
        this.addStatePoint(Number(simState.x[0]), Number(simState.x[1] || 0), Number(simState.u || 0));
      }

      // Draw 3D state-space trajectory ribbon
      if (this.showTrajectory) {
        this.drawStateTrajectory();
      }

      // Render the complete 3D closed-loop topology
      this.renderTopology(simState);

      // HUD readout
      this._drawHUD(simState);
    }

    // -----------------------------------------------------------------------
    // 14. PUBLIC API & CAMERA PRESETS
    // -----------------------------------------------------------------------
    setController(ctrlId, gains, perf) {
      this.ctrlId = ctrlId || 'pid';
      this.theme  = getTheme(this.ctrlId);
      if (gains) this.gains = { ...this.gains, ...gains };
      if (perf)  this.perf  = { ...this.perf,  ...perf };
      this.t = 0;
    }

    setPlant(plantKey) {
      if (plantKey) {
        this.plantKey = plantKey;
        this.trajectory = [];
      }
    }

    setGeometry(L, B, H, mass, scale, thick) {
      this.geom = {
        L: Math.max(0.1, L || 1.2),
        B: Math.max(0.1, B || 0.6),
        H: Math.max(0.05, H || 0.4),
        mass: Math.max(0.1, mass || 5.0),
        scale: Math.max(0.1, scale || 1.0),
        thick: Math.max(0.01, thick || 0.06),
      };
    }

    setCameraPreset(presetName) {
      switch (presetName) {
        case 'isometric':
        default:
          this.rotX = 0.35; this.rotY = -0.52; this.panX = 0; this.panY = 0; this.zoom = 1.0;
          break;
        case 'top':
          this.rotX = 1.55; this.rotY = 0; this.panX = 0; this.panY = 0; this.zoom = 0.95;
          break;
        case 'front':
          this.rotX = 0.05; this.rotY = 0; this.panX = 0; this.panY = 0; this.zoom = 1.0;
          break;
        case 'side':
          this.rotX = 0.05; this.rotY = -1.57; this.panX = 0; this.panY = 0; this.zoom = 1.0;
          break;
      }
    }

    resetView() {
      this.setCameraPreset('isometric');
      this.t = 0;
    }

    start() {
      if (this.raf) cancelAnimationFrame(this.raf);
      const loop = (ts) => {
        this.raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (ts - this._lastTs) / 1000);
        this._lastTs = ts;

        if (!this.paused) this.t += dt;

        this._frameCount++;
        this._fpsTimer += dt;
        if (this._fpsTimer >= 1.0) {
          const fpsId = this.canvas?.id === 'ctrlTwin3dAnimCanvas' ? 'ctrlTwin3dFps' : 
                       (this.canvas?.id === 'fullTwin3DCanvas' ? 'fullTwin3dFps' : 'ctrl3dFps');
          if (typeof document !== 'undefined') {
            const fpsEl = document.getElementById(fpsId);
            if (fpsEl) fpsEl.textContent = `${this._frameCount} FPS`;
          }
          this._frameCount = 0;
          this._fpsTimer = 0;
        }

        this.render();
      };
      this.raf = requestAnimationFrame(loop);
    }

    stop() {
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    }
  }

  // =========================================================================
  // 15. DOM INITIALIZATION & MULTI-VIEWPORT BOOTSTRAP
  // =========================================================================
  function initAll3DViewports() {
    if (typeof document === 'undefined') return;

    const engineDesign = new Controller3DEngine('ctrl3dAnimCanvas');
    const engineTwin   = new Controller3DEngine('ctrlTwin3dAnimCanvas');
    const engineFull   = new Controller3DEngine('fullTwin3DCanvas');

    const engines = [engineDesign, engineTwin, engineFull].filter(e => !!e.canvas);
    if (engines.length === 0) return;

    if (typeof window !== 'undefined') {
      window._ctrl3dEngine = engineDesign.canvas ? engineDesign : engineFull;
      window._ctrl3dTwinEngine = engineTwin.canvas ? engineTwin : engineFull;
      window._ctrl3dFullTwinEngine = engineFull.canvas ? engineFull : engineTwin;
      window._allCtrl3dEngines = engines;
      window._ctrl3dUpdateInfoPanel = updateInfoPanel;
    }

    engines.forEach(e => e.start());

    // Camera preset button event listeners
    const bindPreset = (btnId, preset) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          engines.forEach(eng => eng.setCameraPreset(preset));
          document.querySelectorAll('.btn-cam-preset').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      }
    };

    bindPreset('btnCamIso', 'isometric');
    bindPreset('btnCamTop', 'top');
    bindPreset('btnCamFront', 'front');
    bindPreset('btnCamSide', 'side');

    // Reset View buttons
    ['btn3dReset', 'btnTwin3dReset', 'btnFullTwinReset'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) btn.addEventListener('click', () => engines.forEach(eng => eng.resetView()));
    });

    // Pause / Resume buttons
    ['btn3dToggleAnim', 'btnTwin3dToggleAnim', 'btnFullTwinToggleAnim'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          const paused = !engines[0].paused;
          engines.forEach(eng => { eng.paused = paused; });
          btn.textContent = paused ? '▶ Resume' : '⏸ Pause';
        });
      }
    });

    // Toggle particles and trajectory
    const btnTogglePart = document.getElementById('btnToggleParticles');
    if (btnTogglePart) {
      btnTogglePart.addEventListener('click', () => {
        const val = !engines[0].showParticles;
        engines.forEach(eng => { eng.showParticles = val; });
        btnTogglePart.textContent = val ? '⚡ Particles: ON' : '⚡ Particles: OFF';
      });
    }

    const btnToggleTraj = document.getElementById('btnToggleTrajectory');
    if (btnToggleTraj) {
      btnToggleTraj.addEventListener('click', () => {
        const val = !engines[0].showTrajectory;
        engines.forEach(eng => { eng.showTrajectory = val; });
        btnToggleTraj.textContent = val ? '📈 Trajectory: ON' : '📈 Trajectory: OFF';
      });
    }

    // Geometry Parameter Synchronization
    function syncGeom(fromPrefix) {
      const L = parseFloat(document.getElementById(fromPrefix + 'Length')?.value) || 1.2;
      const B = parseFloat(document.getElementById(fromPrefix + 'Breadth')?.value) || 0.6;
      const H = parseFloat(document.getElementById(fromPrefix + 'Height')?.value) || 0.4;
      const m = parseFloat(document.getElementById(fromPrefix + 'Mass')?.value) || 5.0;
      const s = parseFloat(document.getElementById(fromPrefix + 'Scale')?.value) || 1.0;
      const th = parseFloat(document.getElementById(fromPrefix + 'Thickness')?.value) || 0.06;

      engines.forEach(e => e.setGeometry(L, B, H, m, s, th));
    }

    const btnApplyDesign = document.getElementById('btn3dApplyGeom');
    if (btnApplyDesign) btnApplyDesign.addEventListener('click', () => syncGeom('geom3d'));

    const btnApplyTwin = document.getElementById('btnTwin3dApplyGeom');
    if (btnApplyTwin) btnApplyTwin.addEventListener('click', () => syncGeom('geomTwin'));

    // Info panel updater
    function updateInfoPanel(ctrlId, gains, perf) {
      const t = getTheme(ctrlId);

      const updateText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      updateText('badge3dCtrlName', `${t.label} Active`);
      updateText('badgeTwin3dCtrlName', `${t.label} Active`);
      updateText('badgeFullTwinCtrlName', `${t.label} Active`);

      updateText('c3d_name', t.label);
      updateText('c3d_kp', gains?.kp?.toFixed(3) ?? '—');
      updateText('c3d_ki', gains?.ki?.toFixed(3) ?? '—');
      updateText('c3d_kd', gains?.kd?.toFixed(3) ?? '—');
      updateText('c3d_zeta', perf?.zeta?.toFixed(4) ?? '—');
      updateText('c3d_wn', perf?.wn?.toFixed(3) ?? '—');
      updateText('c3d_ts', perf?.Ts2 ? `${perf.Ts2.toFixed(2)} s` : '—');
      updateText('c3d_mp', perf?.Mp  ? `${perf.Mp.toFixed(1)} %` : '—');

      updateText('cTwin3d_name', t.label);
      updateText('cTwin3d_kp', gains?.kp?.toFixed(3) ?? '—');
      updateText('cTwin3d_ki', gains?.ki?.toFixed(3) ?? '—');
      updateText('cTwin3d_kd', gains?.kd?.toFixed(3) ?? '—');
      updateText('cTwin3d_zeta', perf?.zeta?.toFixed(4) ?? '—');
      updateText('cTwin3d_wn', perf?.wn?.toFixed(3) ?? '—');
      updateText('cTwin3d_ts', perf?.Ts2 ? `${perf.Ts2.toFixed(2)} s` : '—');
      updateText('cTwin3d_mp', perf?.Mp  ? `${perf.Mp.toFixed(1)} %` : '—');

      updateText('twinCtrlName', `${t.label} Controller`);
      updateText('twinCtrlGains', `${gains?.kp?.toFixed(2) ?? '—'} / ${gains?.ki?.toFixed(2) ?? '—'} / ${gains?.kd?.toFixed(2) ?? '—'}`);
      updateText('twinCtrlDynamics', `ζ=${perf?.zeta?.toFixed(3) ?? '—'} | ωn=${perf?.wn?.toFixed(2) ?? '—'}`);
      updateText('twinCtrlPerf', `Ts=${perf?.Ts2?.toFixed(2) ?? '—'}s | Mp=${perf?.Mp?.toFixed(1) ?? '—'}%`);
    }

    // Synthesis Event Listener
    document.addEventListener('acep:controllerSynthesized', (e) => {
      const { ctrlId, plantKey, gains, perf } = e.detail || {};
      engines.forEach(eng => {
        eng.setController(ctrlId, gains, perf);
        if (plantKey) eng.setPlant(plantKey);
      });
      updateInfoPanel(ctrlId, gains, perf);
    });

    // Component Selection Event Listener for Live HUD
    document.addEventListener('acep:3dComponentSelected', (e) => {
      const { componentId, node, simState } = e.detail || {};
      const inspectorTitle = document.getElementById('twinInspectorTitle');
      const inspectorEquation = document.getElementById('twinInspectorEquation');
      const inspectorSignals = document.getElementById('twinInspectorSignals');
      const inspectorParams = document.getElementById('twinInspectorParams');
      if (!inspectorTitle) return;

      inspectorTitle.textContent = `${node?.label || componentId.toUpperCase()} (${node?.sub || ''})`;

      // Component-specific math equation & live signals
      let eqHtml = '';
      let sigHtml = '';
      let paramHtml = '';

      if (componentId === 'plant') {
        eqHtml = '<code>J·d²θ/dt² + b·dθ/dt = K·u(t) + d(t)</code>';
        sigHtml = `<div>y(t) = <strong>${(simState.x?.[0] || 0).toFixed(3)}</strong> | dy/dt = <strong>${(simState.x?.[1] || 0).toFixed(3)}</strong></div>`;
        paramHtml = `
          <div class="grid-2" style="gap:6px;margin-top:6px;">
            <label style="font-size:10px;">Inertia/Mass J (kg·m²): <input type="number" id="inspPlantJ" class="input-control" value="0.01" step="0.005"></label>
            <label style="font-size:10px;">Damping b (N·m·s): <input type="number" id="inspPlantB" class="input-control" value="0.1" step="0.02"></label>
          </div>
        `;
      } else if (componentId === 'controller') {
        eqHtml = '<code>u(t) = K_p·e(t) + K_i·∫e dt + K_d·de/dt</code>';
        sigHtml = `<div>Command u(t) = <strong>${(simState.u || 0).toFixed(2)}</strong> | Error = <strong>${(simState.err || 0).toFixed(3)}</strong></div>`;
        paramHtml = `
          <div class="grid-3" style="gap:4px;margin-top:6px;">
            <label style="font-size:10px;">Kp: <input type="number" id="inspCtrlKp" class="input-control" value="${(simState.gains?.kp || 1.0).toFixed(2)}" step="0.2"></label>
            <label style="font-size:10px;">Ki: <input type="number" id="inspCtrlKi" class="input-control" value="${(simState.gains?.ki || 0.5).toFixed(2)}" step="0.1"></label>
            <label style="font-size:10px;">Kd: <input type="number" id="inspCtrlKd" class="input-control" value="${(simState.gains?.kd || 0.2).toFixed(2)}" step="0.05"></label>
          </div>
        `;
      } else if (componentId === 'actuator') {
        eqHtml = '<code>u_act(t) = sat(u_cmd · η_health, ±u_max)</code>';
        sigHtml = `<div>Saturation Limit = <strong>±${(simState.u_limit || 120).toFixed(1)}</strong> | Health = <strong>${((simState.actuatorHealth || 1.0)*100).toFixed(0)}%</strong></div>`;
        paramHtml = `
          <div class="grid-2" style="gap:6px;margin-top:6px;">
            <label style="font-size:10px;">Saturation Limit u_max: <input type="number" id="inspActSat" class="input-control" value="20.0" step="2.0"></label>
            <label style="font-size:10px;">Health η (0-1): <input type="number" id="inspActHealth" class="input-control" value="${simState.actuatorHealth || 1.0}" step="0.1" min="0.1" max="1.0"></label>
          </div>
        `;
      } else if (componentId === 'sensor') {
        eqHtml = '<code>y_meas(t) = y_true(t) + bias + noise + fault</code>';
        sigHtml = `<div>Bias = <strong>${(simState.sensorBias || 0).toFixed(2)}</strong> | FDI Status = <strong style="color:${simState.fdiActive ? '#FF007A' : '#39FF14'}">${simState.fdiActive ? 'FAULT' : 'NOMINAL'}</strong></div>`;
        paramHtml = `
          <div class="grid-2" style="gap:6px;margin-top:6px;">
            <label style="font-size:10px;">Sensor Bias: <input type="number" id="inspSensorBias" class="input-control" value="${simState.sensorBias || 0.0}" step="0.5"></label>
            <label style="font-size:10px;">FDI Fault Injection: <select id="inspSensorFdi" class="input-control"><option value="0">Normal (Nominal)</option><option value="1" ${simState.fdiActive ? 'selected' : ''}>Active Injection (+5.0)</option></select></label>
          </div>
        `;
      } else if (componentId === 'disturbance') {
        eqHtml = '<code>d(t) = d_step + d_gust(t)</code>';
        sigHtml = `<div>Injected Force = <strong>${(simState.d || 0).toFixed(2)} N</strong></div>`;
        paramHtml = `
          <div style="margin-top:6px;">
            <label style="font-size:10px;">Disturbance Load (N): <input type="number" id="inspDistMag" class="input-control" value="${simState.d || 0.0}" step="1.0"></label>
          </div>
        `;
      } else {
        eqHtml = '<code>e(t) = r(t) - y_meas(t)</code>';
        sigHtml = `<div>Reference r = <strong>${(simState.r || 1.0).toFixed(2)}</strong> | Output y = <strong>${(simState.x?.[0] || 0).toFixed(2)}</strong></div>`;
        paramHtml = `
          <div style="margin-top:6px;">
            <label style="font-size:10px;">Setpoint Reference r: <input type="number" id="inspRefVal" class="input-control" value="${simState.r || 1.0}" step="0.5"></label>
          </div>
        `;
      }

      if (inspectorEquation) inspectorEquation.innerHTML = eqHtml;
      if (inspectorSignals) inspectorSignals.innerHTML = sigHtml;
      if (inspectorParams) inspectorParams.innerHTML = paramHtml;
    });

    // Fallback sync loop with global state object
    setInterval(() => {
      if (typeof window._acepState === 'undefined') return;
      const s = window._acepState;
      if (!s || !s.controllerId) return;
      if (s.controllerId === engines[0].ctrlId && s.plantKey === engines[0].plantKey) return;
      engines.forEach(eng => {
        eng.setController(s.controllerId, s.gains, s.perf);
        if (s.plantKey) eng.setPlant(s.plantKey);
      });
      updateInfoPanel(s.controllerId, s.gains, s.perf);
    }, 500);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll3DViewports);
    } else {
      initAll3DViewports();
    }
  }

  return {
    Controller3DEngine,
    CTRL_3D_THEMES,
    PLANT_KINEMATICS,
    TOPOLOGY_NODES,
    SIGNAL_PATHS,
    projectPoint,
    rotX,
    rotY,
    rotZ
  };
});
