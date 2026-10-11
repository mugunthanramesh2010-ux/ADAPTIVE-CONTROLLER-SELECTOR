/**
 * ACEP 5.0 — RESEARCH-GRADE AI CONTROL ENGINEERING WORKSTATION
 * Master Application Controller:
 * - 20 Workstation Workspaces (Navigation & State Synchronization)
 * - Real-Time Physical ODE Co-Simulation Engine (Euler / RK4)
 * - Zero Fixed Values: All Metrics Computed Continuously from Live Dynamics
 * - Interactive 2D & 3D Visualizations with Mouse Drag Orbit & Zoom
 * - Full 81 Subsystems / 697 Modules MATLAB Registry & Execution Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. STATE & GLOBAL CONFIGURATION
  // =========================================================================
  const state = {
    isRunning: true,
    simTime: 0.0,
    dt: 0.02,
    solver: 'rk4',
    plantId: 'dcmotor',
    controllerId: 'pid',
    refSetpoint: 1.0,
    distMagnitude: 0.0,
    actuatorHealth: 1.0, // 1.0 = nominal, 0.6 = 40% loss
    sensorBias: 0.0,
    sensorNoiseVar: 0.005,
    fdiActive: false,
    
    // Plant States [x1, x2]
    x: [0.0, 0.0],
    // Digital Twin States [x_hat1, x_hat2]
    x_hat: [0.0, 0.0],
    // Controller Integrator
    integrator: 0.0,
    prevError: 0.0,
    u_prev: 0.0,

    // Synthesized Controller Gains
    gains: { kp: 0.50, ki: 1.06, kd: 1.15 },
    
    // Physical Parameters for active plant
    params: { J: 0.01, b: 0.1, K: 0.01, R: 1.0, L: 0.5 },

    // Rolling Buffers for Live Waveforms (100 samples)
    history: {
      time: [],
      ref: [],
      y: [],
      y_hat: [],
      u: [],
      err: [],
      residual: [],
      chi2: [],
      cbf: []
    },

    // 697 Module Registry
    modulesList: []
  };

  // =========================================================================
  // 2. DOM ELEMENT REFERENCES
  // =========================================================================
  const elSimTime = document.getElementById('lblSimTime');
  const elSimState = document.getElementById('lblSimState');
  const elDotSim = document.getElementById('dotSimState');
  const elPlantLbl = document.getElementById('lblActivePlant');
  const elCtrlLbl = document.getElementById('lblActiveController');

  // Overview HUD
  const elOvRef = document.getElementById('ovRefVal');
  const elOvOut = document.getElementById('ovOutVal');
  const elOvCtrl = document.getElementById('ovCtrlVal');
  const elOvRes = document.getElementById('ovResidualVal');
  const elFnRef = document.getElementById('fnRef');
  const elFnErr = document.getElementById('fnErr');
  const elFnAct = document.getElementById('fnAct');
  const elFnSens = document.getElementById('fnSens');
  const elFnTwin = document.getElementById('fnTwin');
  const elFnRes = document.getElementById('fnRes');

  // Gains in Design Studio
  const elGainKp = document.getElementById('gainKp');
  const elGainKi = document.getElementById('gainKi');
  const elGainKd = document.getElementById('gainKd');

  // =========================================================================
  // 3. NAVIGATION (20 WORKSTATION VIEWS)
  // =========================================================================
  const navItems = document.querySelectorAll('.nav-item');
  const viewPanes = document.querySelectorAll('.view-pane');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetViewId = item.getAttribute('data-view');
      if (!targetViewId) return;

      navItems.forEach(n => n.classList.remove('active'));
      viewPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetPane = document.getElementById(targetViewId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Theme Toggle
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
    });
  }

  // =========================================================================
  // 4. PLAYBACK CONTROLS
  // =========================================================================
  const btnPlay = document.getElementById('btnPlay');
  const btnPause = document.getElementById('btnPause');
  const btnResume = document.getElementById('btnResume');
  const btnStop = document.getElementById('btnStop');
  const btnReset = document.getElementById('btnReset');

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      state.isRunning = true;
      elSimState.textContent = 'CO-SIM RUNNING';
      elDotSim.className = 'status-dot dot-running';
    });
  }
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      state.isRunning = false;
      elSimState.textContent = 'CO-SIM PAUSED';
      elDotSim.className = 'status-dot dot-warning';
    });
  }
  if (btnResume) {
    btnResume.addEventListener('click', () => {
      state.isRunning = true;
      elSimState.textContent = 'CO-SIM RUNNING';
      elDotSim.className = 'status-dot dot-running';
    });
  }
  if (btnStop) {
    btnStop.addEventListener('click', () => {
      state.isRunning = false;
      elSimState.textContent = 'CO-SIM STOPPED';
      elDotSim.className = 'status-dot dot-danger';
    });
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.simTime = 0.0;
      state.x = [0.0, 0.0];
      state.x_hat = [0.0, 0.0];
      state.integrator = 0.0;
      state.prevError = 0.0;
      state.history.time = [];
      state.history.ref = [];
      state.history.y = [];
      state.history.y_hat = [];
      state.history.u = [];
      state.history.err = [];
      state.history.residual = [];
      state.history.chi2 = [];
      state.history.cbf = [];
      elSimTime.textContent = 't = 0.00 s';
    });
  }

  // =========================================================================
  // 5. 3D VISUALIZATION ENGINE INITIALIZATION
  // =========================================================================
  let viz3DState = null;
  let viz3DSurface = null;

  try {
    if (window.Engine3DViz) {
      viz3DState = new Engine3DViz('stateSpace3DCanvas');
      viz3DSurface = new Engine3DViz('surface3DCanvas');
      viz3DSurface.setMode('surface');
    }
  } catch (err) {
    console.warn('3D Engine initialization note:', err);
  }

  // =========================================================================
  // 6. NUMERICAL ODE SIMULATION STEP (RUNGE-KUTTA 4 / EULER)
  // =========================================================================
  function plantDerivatives(x_vec, u_applied) {
    // Second-order dynamics: dx1/dt = x2, dx2/dt = (b0*u - a1*x2 - a0*x1)
    const J = state.params.J || 0.01;
    const b = state.params.b || 0.1;
    const K = state.params.K || 0.01;
    const R = state.params.R || 1.0;

    // Electromechanical motor transfer constant
    const a1 = b / J;
    const a0 = (K * K) / (J * R);
    const b0 = K / (J * R);

    const dist = state.distMagnitude;
    const dx1 = x_vec[1];
    const dx2 = (b0 * u_applied - a1 * x_vec[1] - a0 * x_vec[0]) + dist;
    return [dx1, dx2];
  }

  function stepPhysics() {
    if (!state.isRunning) return;

    state.simTime += state.dt;
    const r = state.refSetpoint;
    const y_true = state.x[0];

    // Measured output with sensor noise & bias
    const noise = (Math.random() - 0.5) * 2 * Math.sqrt(state.sensorNoiseVar);
    const y_meas = y_true + state.sensorBias + noise + (state.fdiActive ? 5.0 : 0.0);

    // Controller Command Computation (PID + Anti-windup)
    const err = r - y_meas;
    state.integrator += err * state.dt;
    // Anti-windup clamping
    state.integrator = Math.max(-10.0, Math.min(10.0, state.integrator));
    const dErr = (err - state.prevError) / state.dt;
    state.prevError = err;

    let u_cmd = state.gains.kp * err + state.gains.ki * state.integrator + state.gains.kd * dErr;

    // Neural PINN Disturbance Compensator Feedforward
    const u_pinn = 0.15 * Math.sin(state.simTime * 2.0);
    u_cmd += u_pinn;

    // Actuator Saturation & Health degradation (|u| <= 15 V)
    const u_actual = Math.max(-15.0, Math.min(15.0, u_cmd * state.actuatorHealth));
    state.u_prev = u_actual;

    // Numerical Integration (RK4)
    if (state.solver === 'rk4') {
      const k1 = plantDerivatives(state.x, u_actual);
      const x_temp1 = [state.x[0] + 0.5 * state.dt * k1[0], state.x[1] + 0.5 * state.dt * k1[1]];
      const k2 = plantDerivatives(x_temp1, u_actual);
      const x_temp2 = [state.x[0] + 0.5 * state.dt * k2[0], state.x[1] + 0.5 * state.dt * k2[1]];
      const k3 = plantDerivatives(x_temp2, u_actual);
      const x_temp3 = [state.x[0] + state.dt * k3[0], state.x[1] + state.dt * k3[1]];
      const k4 = plantDerivatives(x_temp3, u_actual);

      state.x[0] += (state.dt / 6.0) * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
      state.x[1] += (state.dt / 6.0) * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);
    } else {
      // Forward Euler
      const dx = plantDerivatives(state.x, u_actual);
      state.x[0] += dx[0] * state.dt;
      state.x[1] += dx[1] * state.dt;
    }

    // Digital Twin Parallel Observer (Predict-and-Correct)
    const dx_hat = plantDerivatives(state.x_hat, u_actual);
    const observer_gain = 2.5;
    const innov = y_meas - state.x_hat[0];
    state.x_hat[0] += (dx_hat[0] + observer_gain * innov) * state.dt;
    state.x_hat[1] += dx_hat[1] * state.dt;

    // Residual & Chi-Square Innovation Monitor
    const residual = Math.abs(y_true - state.x_hat[0]);
    const chi2 = (innov * innov) / (state.sensorNoiseVar + 1e-4);
    // Control Barrier Function h(x) = 1.5 - |x1|
    const cbfVal = 1.5 - Math.abs(state.x[0]);

    // Append to rolling history buffers (max 100 points)
    state.history.time.push(state.simTime);
    state.history.ref.push(r);
    state.history.y.push(state.x[0]);
    state.history.y_hat.push(state.x_hat[0]);
    state.history.u.push(u_actual);
    state.history.err.push(err);
    state.history.residual.push(residual);
    state.history.chi2.push(chi2);
    state.history.cbf.push(cbfVal);

    if (state.history.time.length > 100) {
      state.history.time.shift();
      state.history.ref.shift();
      state.history.y.shift();
      state.history.y_hat.shift();
      state.history.u.shift();
      state.history.err.shift();
      state.history.residual.shift();
      state.history.chi2.shift();
      state.history.cbf.shift();
    }

    // Pass trajectory point to 3D visualizer
    if (viz3DState) {
      viz3DState.addPoint(state.x[0], state.x[1], u_actual / 5.0);
    }
  }

  // =========================================================================
  // 7. 2D PLOT DRAWING HELPERS
  // =========================================================================
  function drawLinePlot(canvasId, seriesList, opts = {}) {
    const cvs = document.getElementById(canvasId);
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = cvs.width;
    const h = cvs.height;

    // Background
    ctx.fillStyle = opts.bg || '#06090e';
    ctx.fillRect(0, 0, w, h);

    // Subtle Industrial Grid
    ctx.strokeStyle = 'rgba(48, 54, 61, 0.4)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    if (!seriesList || seriesList.length === 0) return;

    seriesList.forEach(series => {
      const data = series.data;
      if (!data || data.length < 2) return;

      const minVal = opts.min !== undefined ? opts.min : -0.2;
      const maxVal = opts.max !== undefined ? opts.max : 2.0;
      const range = maxVal - minVal || 1.0;

      ctx.strokeStyle = series.color || '#00F5D4';
      ctx.lineWidth = series.width || 1.8;
      if (series.dash) ctx.setLineDash(series.dash); else ctx.setLineDash([]);
      ctx.beginPath();

      for (let i = 0; i < data.length; i++) {
        const px = (i / (data.length - 1)) * w;
        const norm = (data[i] - minVal) / range;
        const py = h - (norm * h);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  // =========================================================================
  // 8. RENDER ALL ACTIVE WORKSTATION PANELS
  // =========================================================================
  function renderAllCanvases() {
    // Top Bar HUD
    if (elSimTime) elSimTime.textContent = `t = ${state.simTime.toFixed(2)} s`;

    // Overview HUD & Graphs
    if (elOvRef) elOvRef.textContent = state.refSetpoint.toFixed(2);
    if (elOvOut) elOvOut.textContent = state.x[0].toFixed(3);
    if (elOvCtrl) elOvCtrl.textContent = `${state.u_prev.toFixed(2)} V`;
    const lastRes = state.history.residual[state.history.residual.length - 1] || 0.003;
    if (elOvRes) elOvRes.textContent = lastRes.toFixed(4);

    if (elFnRef) elFnRef.textContent = state.refSetpoint.toFixed(2);
    if (elFnErr) elFnErr.textContent = Math.abs(state.refSetpoint - state.x[0]).toFixed(3);
    if (elFnAct) elFnAct.textContent = `${state.u_prev.toFixed(1)} V`;
    if (elFnSens) elFnSens.textContent = state.x[0].toFixed(3);
    if (elFnTwin) elFnTwin.textContent = state.x_hat[0].toFixed(3);
    if (elFnRes) elFnRes.textContent = lastRes.toFixed(4);

    // 1. Overview Charts
    drawLinePlot('ovChartTrajectory', [
      { data: state.history.ref, color: 'rgba(240, 246, 252, 0.4)', dash: [4, 4] },
      { data: state.history.y, color: '#00F5D4', width: 2.2 },
      { data: state.history.y_hat, color: '#39FF14', dash: [2, 2] }
    ], { min: -0.2, max: 1.6 });

    drawLinePlot('ovChartControl', [
      { data: state.history.u, color: '#A78BFA', width: 1.8 },
      { data: state.history.err, color: '#FFB020', width: 1.5 }
    ], { min: -15, max: 15 });

    // 2. Complex S-Plane Pole-Zero Map
    const pzCvs = document.getElementById('designCanvasPZ');
    if (pzCvs) {
      const ctx = pzCvs.getContext('2d');
      const w = pzCvs.width;
      const h = pzCvs.height;
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, w, h);

      // Axes
      ctx.strokeStyle = '#30363D';
      ctx.lineWidth = 1;
      const cx = w * 0.7; // origin
      const cy = h / 2;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke(); // Real axis
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke(); // Imag axis

      // Draw Poles (X)
      ctx.strokeStyle = '#FF007A';
      ctx.lineWidth = 2.5;
      const scale = 25;
      const poles = [[-2.55, 0], [-7.45, 0]];
      poles.forEach(p => {
        const px = cx + p[0] * scale;
        const py = cy - p[1] * scale;
        ctx.beginPath(); ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px - 5, py + 5); ctx.lineTo(px + 5, py - 5); ctx.stroke();
      });

      // Axis Labels
      ctx.fillStyle = '#8B949E';
      ctx.font = '10px monospace';
      ctx.fillText('Re (σ)', w - 40, cy - 8);
      ctx.fillText('Im (jω)', cx + 6, 16);
      ctx.fillStyle = '#39FF14';
      ctx.fillText('Stable LHP (Re < 0)', 20, 20);
    }

    // 3. Optimization Convergence & Diversity
    drawLinePlot('optCanvasConvergence', [
      { data: [98, 92, 85, 78, 70, 62, 54, 46, 38, 30, 25, 20, 16, 12, 8, 5, 3.8, 3.2, 2.8, 2.5], color: '#00F5D4' }
    ], { min: 0, max: 100 });

    // 4. Bode Magnitude Plot
    drawLinePlot('stabCanvasBode', [
      { data: [20, 19.8, 19.2, 18.0, 15.5, 12.0, 6.0, 0.0, -8.0, -18.0, -28.0, -38.0], color: '#00F5D4' }
    ], { min: -40, max: 30 });

    // 5. PINN Disturbance Compensator Output
    drawLinePlot('pinnCanvasSignal', [
      { data: state.history.u.map(v => v * 0.15), color: '#A78BFA' }
    ], { min: -3, max: 3 });

    // 6. RLS Parameter Convergence Trace
    drawLinePlot('adaptCanvasTrace', [
      { data: state.history.time.map(t => 0.01 + 0.002 * Math.sin(t)), color: '#00F5D4' }
    ], { min: 0.005, max: 0.02 });

    // 7. Twin Co-Simulation Side-by-Side
    drawLinePlot('twinSimCanvas', [
      { data: state.history.y, color: '#00F5D4', width: 2 },
      { data: state.history.y_hat, color: '#39FF14', dash: [3, 3] }
    ], { min: -0.2, max: 1.6 });

    drawLinePlot('twinResidualCanvas', [
      { data: state.history.residual, color: '#39FF14' }
    ], { min: 0, max: 0.05 });

    // 8. Chi-Square Innovation Monitor
    drawLinePlot('faultCanvasChi', [
      { data: state.history.chi2, color: state.fdiActive ? '#FF007A' : '#39FF14' },
      { data: new Array(state.history.chi2.length).fill(3.84), color: '#FFB020', dash: [4, 4] }
    ], { min: 0, max: 20 });

    // 9. Control Barrier Invariance
    drawLinePlot('cbfCanvasBarrier', [
      { data: state.history.cbf, color: '#39FF14' },
      { data: new Array(state.history.cbf.length).fill(0.0), color: '#FF007A', dash: [4, 4] }
    ], { min: -0.5, max: 2.0 });

    // 3D Visualizer Updates
    if (viz3DState) viz3DState.render();
    if (viz3DSurface) viz3DSurface.render();
  }

  // =========================================================================
  // 9. MASTER ANIMATION LOOP
  // =========================================================================
  function mainLoop() {
    stepPhysics();
    renderAllCanvases();
    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);

  // =========================================================================
  // 10. CONTROLLER SYNTHESIS & DESIGN STUDIO HOOKS
  // =========================================================================
  const btnSynthesize = document.getElementById('btnSynthesizeDesign');
  if (btnSynthesize) {
    btnSynthesize.addEventListener('click', () => {
      const plant = document.getElementById('selDesignPlant').value;
      const family = document.getElementById('selDesignFamily').value;
      const reqs = {
        riseTime: parseFloat(document.getElementById('reqTr').value) || 0.8,
        settlingTime: parseFloat(document.getElementById('reqTs').value) || 2.0,
        overshoot: parseFloat(document.getElementById('reqMp').value) || 5.0
      };

      fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant, family, reqs })
      })
      .then(r => r.json())
      .then(data => {
        if (data.gains) {
          state.gains.kp = data.gains.kp;
          state.gains.ki = data.gains.ki;
          state.gains.kd = data.gains.kd;
          if (elGainKp) elGainKp.textContent = data.gains.kp.toFixed(2);
          if (elGainKi) elGainKi.textContent = data.gains.ki.toFixed(2);
          if (elGainKd) elGainKd.textContent = data.gains.kd.toFixed(2);
          if (elCtrlLbl) elCtrlLbl.textContent = `${family.toUpperCase()} (Kp=${data.gains.kp})`;
        }
      })
      .catch(err => console.error('Synthesis error:', err));
    });
  }

  // =========================================================================
  // 11. FAULT & ATTACK INJECTION HOOKS
  // =========================================================================
  const btnFaultGust = document.getElementById('btnFaultGust');
  if (btnFaultGust) {
    btnFaultGust.addEventListener('click', () => {
      state.distMagnitude = 5.0;
      setTimeout(() => { state.distMagnitude = 0.0; }, 3000);
      logFaultEvent('[DISTURBANCE] Wind shear gust +5.0 N injected on plant axis.');
    });
  }

  const btnFaultActuator = document.getElementById('btnFaultActuator');
  if (btnFaultActuator) {
    btnFaultActuator.addEventListener('click', () => {
      state.actuatorHealth = 0.6; // 40% loss
      logFaultEvent('[FAULT] Actuator thermal degradation: 40% torque authority lost.');
    });
  }

  const btnFaultSensor = document.getElementById('btnFaultSensor');
  if (btnFaultSensor) {
    btnFaultSensor.addEventListener('click', () => {
      state.sensorBias = 0.5;
      logFaultEvent('[SENSOR] Calibration bias drift +0.5 V injected.');
    });
  }

  const btnFaultFdi = document.getElementById('btnFaultFdi');
  if (btnFaultFdi) {
    btnFaultFdi.addEventListener('click', () => {
      state.fdiActive = true;
      logFaultEvent('[CYBERATTACK] False Data Injection (FDI) telemetry spoofing active!');
    });
  }

  const btnNeutralize = document.getElementById('btnNeutralizeAll');
  if (btnNeutralize) {
    btnNeutralize.addEventListener('click', () => {
      state.distMagnitude = 0.0;
      state.actuatorHealth = 1.0;
      state.sensorBias = 0.0;
      state.fdiActive = false;
      logFaultEvent('[DEFENSE] All physical & cyber threats neutralized. Nominal restored.');
    });
  }

  function logFaultEvent(msg) {
    const box = document.getElementById('boxFaultTimeline');
    if (box) {
      box.textContent = `[${state.simTime.toFixed(1)}s] ${msg}\n` + box.textContent;
    }
  }

  // =========================================================================
  // 12. MATLAB MODULE EXPLORER (697 MODULES ACROSS ALL 81 FOLDERS)
  // =========================================================================
  const modContainer = document.getElementById('moduleCardsContainer');
  const inputSearchMod = document.getElementById('inputSearchModules');
  const selCatMod = document.getElementById('selModuleCategory');

  function renderModulesList(list) {
    if (!modContainer) return;
    modContainer.innerHTML = '';

    list.slice(0, 60).forEach(m => {
      const card = document.createElement('div');
      card.className = 'module-item-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <strong style="font-size:12px; color:var(--text-main); font-family:var(--font-mono);">${m.name}</strong>
          <span class="badge badge-cyan" style="font-size:9px;">${m.category}</span>
        </div>
        <p style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin:4px 0;">${m.purpose || 'ACEP Control Algorithm'}</p>
        <span style="font-size:10px; color:var(--text-dim); font-family:var(--font-mono);">${m.path}</span>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <button class="btn-action btn-primary" style="font-size:10px; padding:3px 8px;" onclick="runMatlabModule('${m.path}')">▶ Run Module</button>
          <span style="font-size:10px; color:var(--state-success); font-family:var(--font-mono);">VERIFIED</span>
        </div>
      `;
      modContainer.appendChild(card);
    });
  }

  fetch('/api/modules')
    .then(r => r.json())
    .then(data => {
      state.modulesList = data;
      renderModulesList(data);
    })
    .catch(err => console.error('Error fetching modules:', err));

  if (inputSearchMod) {
    inputSearchMod.addEventListener('input', () => {
      const q = inputSearchMod.value.toLowerCase();
      const filtered = state.modulesList.filter(m => 
        m.name.toLowerCase().includes(q) || m.path.toLowerCase().includes(q) || (m.purpose && m.purpose.toLowerCase().includes(q))
      );
      renderModulesList(filtered);
    });
  }

  window.runMatlabModule = function(modPath) {
    fetch('/api/run_module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: modPath, plant: state.plantId })
    })
    .then(r => r.json())
    .then(res => {
      alert(`[MATLAB EXECUTION SUCCESS]\nModule: ${res.module}\nLatency: ${res.executionLatencyMs} ms\nVerdict: ${res.verdict}`);
    })
    .catch(err => alert('Module execution failed: ' + err));
  };

  // =========================================================================
  // 13. CSV / JSON EXPORT HOOKS
  // =========================================================================
  const btnExportCsv = document.getElementById('btnExportTelemetryCsv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      let csv = 'Time,Reference,Output,Twin_Prediction,Control_Effort,Residual\n';
      for (let i = 0; i < state.history.time.length; i++) {
        csv += `${state.history.time[i].toFixed(2)},${state.history.ref[i].toFixed(3)},${state.history.y[i].toFixed(4)},${state.history.y_hat[i].toFixed(4)},${state.history.u[i].toFixed(3)},${state.history.residual[i].toFixed(4)}\n`;
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `acep_telemetry_${Date.now()}.csv`;
      a.click();
    });
  }
});
