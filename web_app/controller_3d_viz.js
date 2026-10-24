/**
 * ACEP Controller 3D Physical Animation Engine
 * -----------------------------------------------
 * Renders a parametric, animated 3D model of the active controller's
 * physical plant body (box + actuator shaft + sensor ring + data bus wires)
 * with per-controller colour themes, geometry inputs (L/W/H/mass/thickness),
 * and a live oscillating response that matches the synthesised closed-loop
 * performance metrics (damping ratio ζ, natural frequency ωₙ).
 *
 * Dependencies: none (pure Canvas 2D with custom perspective projection).
 * Integrates with app.js state object.
 */

(function () {
  'use strict';

  // =========================================================================
  // CONTROLLER THEME REGISTRY
  // Defines colour, glow, label and shape style per controller family
  // =========================================================================
  const CTRL_3D_THEMES = {
    pid:              { base: '#00F5D4', glow: '#00F5D450', label: 'PID',              shape: 'box',       accent: '#39FF14' },
    state_feedback:   { base: '#A78BFA', glow: '#A78BFA55', label: 'State FB',         shape: 'prism',     accent: '#00F5D4' },
    lqr:              { base: '#FFB020', glow: '#FFB02055', label: 'LQR',              shape: 'diamond',   accent: '#FF6B35' },
    mpc:              { base: '#FF6B35', glow: '#FF6B3555', label: 'MPC',              shape: 'cylinder',  accent: '#FFB020' },
    adrc:             { base: '#39FF14', glow: '#39FF1445', label: 'ADRC',             shape: 'box',       accent: '#00F5D4' },
    smc:              { base: '#F72585', glow: '#F7258555', label: 'SMC',              shape: 'wedge',     accent: '#A78BFA' },
    h_inf:            { base: '#7B2FF7', glow: '#7B2FF755', label: 'H∞',              shape: 'sphere',    accent: '#F72585' },
    backstepping:     { base: '#00B4D8', glow: '#00B4D855', label: 'Backstepping',     shape: 'prism',     accent: '#39FF14' },
    mrac:             { base: '#FF9F1C', glow: '#FF9F1C55', label: 'MRAC',             shape: 'box',       accent: '#00F5D4' },
    lqg:              { base: '#2EC4B6', glow: '#2EC4B655', label: 'LQG',              shape: 'diamond',   accent: '#FFB020' },
    pinn_neural:      { base: '#E040FB', glow: '#E040FB55', label: 'PINN',             shape: 'cylinder',  accent: '#00F5D4' },
    fuzzy:            { base: '#FF5400', glow: '#FF540055', label: 'Fuzzy',            shape: 'box',       accent: '#39FF14' },
    imc:              { base: '#5CE1E6', glow: '#5CE1E655', label: 'IMC',              shape: 'prism',     accent: '#A78BFA' },
    fractional_pid:   { base: '#AAFF00', glow: '#AAFF0055', label: 'FOPID',           shape: 'box',       accent: '#00F5D4' },
    gpc:              { base: '#FF006E', glow: '#FF006E55', label: 'GPC',              shape: 'diamond',   accent: '#FFB020' },
    ftc:              { base: '#FB5607', glow: '#FB560755', label: 'FTC',              shape: 'wedge',     accent: '#39FF14' },
    bang_bang:        { base: '#FFBE0B', glow: '#FFBE0B55', label: 'Bang-Bang',        shape: 'box',       accent: '#FF6B35' },
    lead_comp:        { base: '#8338EC', glow: '#8338EC55', label: 'Lead',             shape: 'prism',     accent: '#00F5D4' },
    lag_comp:         { base: '#3A86FF', glow: '#3A86FF55', label: 'Lag',              shape: 'prism',     accent: '#A78BFA' },
    lead_lag:         { base: '#06D6A0', glow: '#06D6A055', label: 'Lead-Lag',         shape: 'box',       accent: '#FFB020' },
    notch_comp:       { base: '#EF233C', glow: '#EF233C55', label: 'Notch',            shape: 'cylinder',  accent: '#39FF14' },
    feedforward_comp: { base: '#0077B6', glow: '#0077B655', label: 'Feedforward',      shape: 'box',       accent: '#00F5D4' },
    pz_cancel_comp:   { base: '#023E8A', glow: '#023E8A55', label: 'PZ Cancel',        shape: 'prism',     accent: '#FFB020' },
    cascade_comp:     { base: '#48CAE4', glow: '#48CAE455', label: 'Cascade',          shape: 'box',       accent: '#A78BFA' },
    phase_shaping_comp:{ base: '#ADE8F4', glow: '#ADE8F455', label: 'Phase Shape',    shape: 'wedge',     accent: '#39FF14' },
    custom:           { base: '#F0F6FC', glow: '#F0F6FC30', label: 'Custom',           shape: 'box',       accent: '#00F5D4' },
  };

  function getTheme(id) {
    return CTRL_3D_THEMES[id] || CTRL_3D_THEMES.pid;
  }

  // =========================================================================
  // GEOMETRY HELPERS
  // =========================================================================
  function rotY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0]*c - p[2]*s, p[1], p[0]*s + p[2]*c];
  }
  function rotX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0], p[1]*c - p[2]*s, p[1]*s + p[2]*c];
  }

  // =========================================================================
  // Controller3DEngine
  // =========================================================================
  class Controller3DEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.W = this.canvas.width;
      this.H = this.canvas.height;

      // Camera
      this.rotX = 0.38;
      this.rotY = -0.55;
      this.zoom = 1.0;
      this.fov  = 520;

      // Animation state
      this.t      = 0;
      this.paused = false;
      this.raf    = null;
      this.fps    = 60;
      this._lastTs = 0;
      this._frameCount = 0;
      this._fpsTimer   = 0;

      // Controller / geometry parameters
      this.geom = { L: 1.2, B: 0.6, H: 0.4, mass: 5.0, scale: 1.0, thick: 0.06 };
      this.perf = { zeta: 0.707, wn: 5.2, ts: 0.65, mp: 3.8 };
      this.theme = getTheme('pid');
      this.ctrlId = 'pid';

      // Mouse drag
      this._drag = false;
      this._mx = 0;
      this._my = 0;
      this._bindEvents();
    }

    _bindEvents() {
      this.canvas.addEventListener('mousedown', e => {
        this._drag = true; this._mx = e.clientX; this._my = e.clientY;
      });
      window.addEventListener('mouseup', () => { this._drag = false; });
      window.addEventListener('mousemove', e => {
        if (!this._drag) return;
        this.rotY += (e.clientX - this._mx) * 0.009;
        this.rotX = Math.max(-1.35, Math.min(1.35, this.rotX + (e.clientY - this._my) * 0.009));
        this._mx = e.clientX; this._my = e.clientY;
      });
      this.canvas.addEventListener('wheel', e => {
        e.preventDefault();
        this.zoom = Math.max(0.35, Math.min(3.2, this.zoom - e.deltaY * 0.0014));
      }, { passive: false });
    }

    // Project 3D → 2D canvas pixel
    project(p3) {
      let p = rotY(p3, this.rotY);
      p = rotX(p, this.rotX);
      const d = 4.5 / this.zoom;
      const z = p[2] + d;
      if (z <= 0.001) return null;
      const s = (this.fov * this.zoom) / z;
      return [this.W / 2 + p[0] * s, this.H / 2 - p[1] * s, s];
    }

    // Convenience polygon fill
    _poly(pts, fill, stroke, lw) {
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }

    // -----------------------------------------------------------------------
    // Draw a box face (4 world-space corners)
    // -----------------------------------------------------------------------
    _face(corners3, fill, stroke) {
      const pts = corners3.map(c => this.project(c)).filter(Boolean);
      if (pts.length < 3) return;
      this._poly(pts, fill, stroke, 0.8);
    }

    // -----------------------------------------------------------------------
    // Build box face set with shading
    // -----------------------------------------------------------------------
    _box(cx, cy, cz, lx, ly, lz, baseColor, edgeColor, alpha) {
      const a = alpha !== undefined ? alpha : 1;
      const half = [lx/2, ly/2, lz/2];
      // 8 corners
      const C = (dx,dy,dz) => [cx+dx*half[0], cy+dy*half[1], cz+dz*half[2]];
      const V = [
        C(-1,-1,-1), C(1,-1,-1), C(1,1,-1), C(-1,1,-1), // front  0-3
        C(-1,-1, 1), C(1,-1, 1), C(1,1, 1), C(-1,1, 1), // back   4-7
      ];

      const hexAlpha = Math.round(a * 255).toString(16).padStart(2,'0');
      const darken = (col, f) => {
        const v = parseInt(col.replace('#',''), 16);
        const r = Math.max(0, Math.min(255, ((v>>16)&255)*f)) | 0;
        const g = Math.max(0, Math.min(255, ((v>>8)&255)*f)) | 0;
        const b = Math.max(0, Math.min(255, (v&255)*f)) | 0;
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}${hexAlpha}`;
      };

      const faces = [
        { v:[V[0],V[1],V[2],V[3]], f: darken(baseColor, 0.70) }, // front
        { v:[V[4],V[5],V[6],V[7]], f: darken(baseColor, 0.45) }, // back
        { v:[V[0],V[4],V[7],V[3]], f: darken(baseColor, 0.60) }, // left
        { v:[V[1],V[5],V[6],V[2]], f: darken(baseColor, 0.55) }, // right
        { v:[V[3],V[2],V[6],V[7]], f: darken(baseColor, 0.95) }, // top
        { v:[V[0],V[1],V[5],V[4]], f: darken(baseColor, 0.30) }, // bottom
      ];

      // Sort faces by depth (painter's algorithm)
      const depth = (face) => {
        const avg = face.v.reduce((a,c)=>a+c[2],0) / face.v.length;
        let tmp = rotY([0,0,avg], this.rotY);
        tmp = rotX(tmp, this.rotX);
        return tmp[2];
      };
      faces.sort((a,b) => depth(a) - depth(b));

      const e = edgeColor || 'rgba(255,255,255,0.12)';
      faces.forEach(f => this._face(f.v, f.f, e));
    }

    // -----------------------------------------------------------------------
    // Draw a cylinder (vertical axis) approximated with a prism
    // -----------------------------------------------------------------------
    _cylinder(cx, cy, cz, r, h, segs, colTop, colSide, alpha) {
      segs = segs || 16;
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        pts.push([cx + Math.cos(a)*r, cy, cz + Math.sin(a)*r]);
      }

      const ctx = this.ctx;
      const ea = alpha !== undefined ? alpha : 1;
      const hexA = Math.round(ea * 255).toString(16).padStart(2,'0');

      // Side panels
      for (let i = 0; i < segs; i++) {
        const p0 = pts[i], p1 = pts[i+1];
        const face = [
          [p0[0], p0[1],     p0[2]],
          [p1[0], p1[1],     p1[2]],
          [p1[0], p1[1] + h, p1[2]],
          [p0[0], p0[1] + h, p0[2]],
        ];
        const brightness = 0.5 + 0.4 * Math.cos((i / segs) * Math.PI * 2 - this.rotY);
        const b = Math.round(brightness * 255).toString(16).padStart(2,'0');
        this._face(face, colSide ? colSide+hexA : `#${b}${b}${b}${hexA}`, 'rgba(255,255,255,0.08)', 0.5);
      }

      // Top cap
      const topPts = pts.map(p => this.project([p[0], p[1]+h, p[2]])).filter(Boolean);
      if (topPts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(topPts[0][0], topPts[0][1]);
        topPts.forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.closePath();
        ctx.fillStyle = colTop || '#ffffff55';
        ctx.fill();
      }
    }

    // -----------------------------------------------------------------------
    // Draw a line in 3D
    // -----------------------------------------------------------------------
    _line3(p1, p2, color, lw) {
      const a = this.project(p1), b = this.project(p2);
      if (!a || !b) return;
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = color || '#ffffff55';
      ctx.lineWidth = lw || 1;
      ctx.stroke();
    }

    // -----------------------------------------------------------------------
    // Draw label at 3D point
    // -----------------------------------------------------------------------
    _label3(p3, text, color, size) {
      const p = this.project(p3);
      if (!p) return;
      const ctx = this.ctx;
      ctx.font = `${size||10}px var(--font-mono, monospace)`;
      ctx.fillStyle = color || '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(text, p[0], p[1]);
    }

    // -----------------------------------------------------------------------
    // MAIN RENDER SCENE
    // Draws the controller physical body, actuator, sensor ring, and data bus
    // -----------------------------------------------------------------------
    render() {
      // Dynamic canvas resolution sync
      if (this.canvas.clientWidth > 0 && (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== (this.canvas.clientHeight || 380))) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight || 380;
        this.W = this.canvas.width;
        this.H = this.canvas.height;
      }

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.W, this.H);

      // Background gradient
      const bg = ctx.createRadialGradient(this.W/2, this.H/2, 0, this.W/2, this.H/2, this.H);
      bg.addColorStop(0, '#0a1628');
      bg.addColorStop(1, '#060d1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, this.W, this.H);

      // Grid floor
      this._drawGrid();

      const { L, B, H: ht, mass, scale, thick } = this.geom;
      const sl = scale;
      const lx = L * sl, ly = ht * sl, lz = B * sl;
      const thk = thick * sl;

      const theme = this.theme;
      const perf  = this.perf;

      // ── PHYSICAL DIGITAL TWIN STATE MAPPING ──────────────────────────────
      // Bind visual displacement and dynamics directly to simulated state variables
      const sim = (typeof window !== 'undefined' && window._acepSimulationState) ? window._acepSimulationState : null;
      let oscY = 0;
      let activeX0 = 0;
      let activeX1 = 0;
      let isSat = false;
      let isDist = false;

      if (sim && Array.isArray(sim.x) && sim.x.length > 0) {
        activeX0 = Number(sim.x[0]) || 0;
        activeX1 = Number(sim.x[1]) || 0;
        // Direct physical coordinate mapping: physical plant state drives vertical displacement
        oscY = -Math.max(-0.4, Math.min(0.4, activeX0 * 0.06 * sl));
        isSat = sim.u_sat !== undefined && Math.abs(sim.u - sim.u_sat) > 1e-3;
        isDist = sim.d !== undefined && Math.abs(sim.d) > 1e-3;
      } else {
        // Fallback analytical damped oscillation when simulation is idle
        const oscFreq = perf.wn * 0.6;
        const oscAmp  = 0.04 * (1 - Math.min(0.95, perf.zeta)) * sl;
        oscY    = Math.sin(this.t * oscFreq) * oscAmp * Math.exp(-perf.zeta * this.t * 0.4);
      }

      // ── MAIN BODY BOX ───────────────────────────────────────────────────
      this._box(0, oscY, 0, lx, ly, lz, theme.base, 'rgba(255,255,255,0.18)', 0.88);

      // ── TOP FACE PANEL (controller electronics surface) ─────────────────
      {
        const y0 = ly/2 + oscY;
        const hw = lx/2 * 0.85, hd = lz/2 * 0.85;
        this._face([
          [-hw, y0, -hd], [hw, y0, -hd], [hw, y0, hd], [-hw, y0, hd]
        ], theme.glow.replace('55','33'), theme.base + '99', 0.5);

        // PCB trace lines
        for (let i = -2; i <= 2; i++) {
          const xi = i * (hw / 3);
          this._line3([-hw*0.9, y0+0.002, xi], [hw*0.9, y0+0.002, xi], theme.base + '40', 0.5);
        }
        for (let i = -2; i <= 2; i++) {
          const zi = i * (hd / 3);
          this._line3([zi, y0+0.002, -hd*0.9], [zi, y0+0.002, hd*0.9], theme.accent + '40', 0.5);
        }
      }

      // ── ACTUATOR SHAFT (front face, extended cylinder) ──────────────────
      const shaftR = Math.max(0.025, thk * 0.7) * sl;
      const shaftL = lz * 0.55;
      const shaftY = oscY - ly * 0.2;
      this._cylinder(0, shaftY - shaftR, lz/2, shaftR, shaftL, 14, theme.accent + 'cc', theme.base + '99', 0.85);

      // ── ACTUATOR DISC (end cap) ──────────────────────────────────────────
      this._cylinder(0, shaftY - shaftR, lz/2 + shaftL, shaftR * 2.2, thk * 0.5, 16, theme.base + 'dd', theme.accent + '99', 0.82);

      // ── SENSOR RING (top mounting ring) ─────────────────────────────────
      const ringY = ly/2 + oscY + 0.015;
      const ringR_outer = lx * 0.28, ringR_inner = lx * 0.21;
      const rsegs = 20;
      for (let i = 0; i < rsegs; i++) {
        const a0 = (i / rsegs) * Math.PI * 2;
        const a1 = ((i+1) / rsegs) * Math.PI * 2;
        const p0o = [Math.cos(a0) * ringR_outer, ringY, Math.sin(a0) * ringR_outer];
        const p1o = [Math.cos(a1) * ringR_outer, ringY, Math.sin(a1) * ringR_outer];
        const p0i = [Math.cos(a0) * ringR_inner, ringY, Math.sin(a0) * ringR_inner];
        const p1i = [Math.cos(a1) * ringR_inner, ringY, Math.sin(a1) * ringR_inner];
        const pulse = 0.4 + 0.6 * Math.sin(this.t * 3 + i * 0.5);
        const alpha = Math.round(pulse * 200).toString(16).padStart(2,'0');
        this._face([p0o, p1o, p1i, p0i], theme.accent + alpha, theme.base + '60', 0.5);
      }

      // ── DATA BUS WIRES (bottom face, 3 connection leads) ─────────────────
      const wireY = -ly/2 + oscY;
      const wireColors = [theme.base, theme.accent, '#FFB020'];
      [-0.25*lx, 0, 0.25*lx].forEach((wx, wi) => {
        const col = wireColors[wi % 3];
        this._line3([wx, wireY, 0], [wx, wireY - 0.18*sl, 0], col + 'cc', 1.5);
        this._line3([wx, wireY - 0.18*sl, 0], [wx + 0.04*sl, wireY - 0.22*sl, 0], col + '88', 1);
      });

      // ── MOUNTING BOLTS (4 corners, top face) ────────────────────────────
      const bx = lx/2 * 0.88, bz = lz/2 * 0.88;
      const bY = ly/2 + oscY;
      [[bx, bz], [bx, -bz], [-bx, bz], [-bx, -bz]].forEach(([x, z]) => {
        this._cylinder(x, bY, z, 0.02*sl, 0.04*sl, 8, '#888888cc', '#555555aa', 0.9);
      });

      // ── WEIGHT INDICATOR (hover text on body) ───────────────────────────
      {
        const lp = this.project([0, 0, -lz/2]);
        if (lp) {
          ctx.font = `bold 10px var(--font-mono, monospace)`;
          ctx.fillStyle = theme.base;
          ctx.textAlign = 'center';
          const wLabel = mass >= 100 ? `${mass.toFixed(0)} kg` : `${mass.toFixed(1)} kg`;
          ctx.fillText(`⚖ ${wLabel}`, lp[0], lp[1] + 14);
        }
      }

      // ── CTRL LABEL ON FRONT FACE ──────────────────────────────────────────
      this._label3([0, oscY, -lz/2 - 0.02], theme.label, theme.base, 11);

      // ── DIMENSION ANNOTATIONS ────────────────────────────────────────────
      const dimColor = 'rgba(255,255,255,0.3)';
      // Length arrow (X axis)
      this._line3([-lx/2, -ly/2 + oscY - 0.08, 0], [lx/2, -ly/2 + oscY - 0.08, 0], dimColor, 0.7);
      this._label3([0, -ly/2 + oscY - 0.12, 0], `L=${L.toFixed(1)}m`, dimColor, 9);
      // Height arrow (Y axis)
      this._line3([lx/2 + 0.08, -ly/2 + oscY, 0], [lx/2 + 0.08, ly/2 + oscY, 0], dimColor, 0.7);
      this._label3([lx/2 + 0.18, oscY, 0], `H=${ht.toFixed(1)}m`, dimColor, 9);

      // ── PERFORMANCE GLOW AURA ─────────────────────────────────────────────
      const glowCenter = this.project([0, oscY, 0]);
      if (glowCenter) {
        const glowR = Math.max(60, 130 * sl * this.zoom);
        const grd = ctx.createRadialGradient(glowCenter[0], glowCenter[1], 0, glowCenter[0], glowCenter[1], glowR);
        grd.addColorStop(0, theme.glow.replace('55', '25') || 'rgba(0,245,212,0.08)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.W, this.H);
      }

      // ── HUD (top-left corner) ─────────────────────────────────────────────
      this._drawHUD();
    }

    _drawGrid() {
      const ctx = this.ctx;
      const gridSize = 10;
      const gridSpacing = 0.25;
      const gridY = -0.35;
      ctx.strokeStyle = 'rgba(0,245,212,0.06)';
      ctx.lineWidth = 0.5;
      for (let i = -gridSize; i <= gridSize; i++) {
        const p1 = this.project([i * gridSpacing, gridY, -gridSize * gridSpacing]);
        const p2 = this.project([i * gridSpacing, gridY,  gridSize * gridSpacing]);
        const p3 = this.project([-gridSize * gridSpacing, gridY, i * gridSpacing]);
        const p4 = this.project([ gridSize * gridSpacing, gridY, i * gridSpacing]);
        if (p1 && p2) { ctx.beginPath(); ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.stroke(); }
        if (p3 && p4) { ctx.beginPath(); ctx.moveTo(p3[0],p3[1]); ctx.lineTo(p4[0],p4[1]); ctx.stroke(); }
      }
      // Axis indicators
      const o = this.project([0, gridY, 0]);
      const ax = this.project([0.8, gridY, 0]);
      const az = this.project([0, gridY, 0.8]);
      if (o && ax) { ctx.strokeStyle='rgba(255,80,80,0.35)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(ax[0],ax[1]); ctx.stroke(); }
      if (o && az) { ctx.strokeStyle='rgba(80,180,255,0.35)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(az[0],az[1]); ctx.stroke(); }
    }

    _drawHUD() {
      const ctx = this.ctx;
      const theme = this.theme;
      const p = this.perf;
      const g = this.geom;
      const sim = (typeof window !== 'undefined' && window._acepSimulationState) ? window._acepSimulationState : null;

      const lines = [
        `Twin: Simulation-Based Digital Twin (${theme.label})`,
        `ζ = ${p.zeta.toFixed(3)}  ωₙ = ${p.wn.toFixed(2)} rad/s`,
      ];

      if (sim && Array.isArray(sim.x) && sim.x.length > 0) {
        const x0 = Number(sim.x[0]) || 0;
        const ref = Number(sim.ref) || 0;
        const u = Number(sim.u_sat !== undefined ? sim.u_sat : (sim.u || 0));
        const isSat = sim.u_sat !== undefined && Math.abs(sim.u - sim.u_sat) > 1e-3;
        const dist = Number(sim.d || 0);

        lines.push(`State x₀ = ${x0.toFixed(3)} | Ref r = ${ref.toFixed(2)}`);
        lines.push(`Control u = ${u.toFixed(2)} ${isSat ? '⚠ [SATURATED]' : '[LINEAR]'}`);
        lines.push(`Disturbance d = ${dist.toFixed(2)} | Mass = ${g.mass} kg`);
      } else {
        lines.push(`Ts(2%) = ${p.ts.toFixed(2)} s  Mp = ${p.mp.toFixed(1)} %`);
        lines.push(`Geometry: ${g.L}×${g.B}×${g.H} m`);
        lines.push(`Mass: ${g.mass} kg  Scale: ×${g.scale}`);
      }

      ctx.save();
      ctx.fillStyle = 'rgba(6,13,26,0.85)';
      ctx.strokeStyle = theme.base + '55';
      ctx.lineWidth = 1.0;
      const bw = 240, bh = lines.length * 15 + 14;
      ctx.beginPath();
      ctx.roundRect(10, 10, bw, bh, 6);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      lines.forEach((l, i) => {
        ctx.font = `${i === 0 ? 'bold ' : ''}10px var(--font-mono, monospace)`;
        ctx.fillStyle = i === 0 ? theme.base : (l.includes('SATURATED') ? '#FF6B35' : 'rgba(240,246,252,0.75)');
        ctx.fillText(l, 18, 24 + i * 15);
      });
      ctx.restore();
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------
    setController(ctrlId, gains, perf) {
      this.ctrlId = ctrlId;
      this.theme  = getTheme(ctrlId);
      if (gains) { /* stored for HUD – access through perf */ }
      if (perf) {
        this.perf = {
          zeta: perf.zeta  || 0.707,
          wn:   perf.wn    || 5.2,
          ts:   perf.Ts2   || 0.65,
          mp:   perf.Mp    || 3.8,
        };
      }
      this.t = 0; // restart animation from beginning on controller change
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

    resetView() {
      this.rotX = 0.38; this.rotY = -0.55; this.zoom = 1.0; this.t = 0;
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
          const fpsId = this.canvas.id === 'ctrlTwin3dAnimCanvas' ? 'ctrlTwin3dFps' : 'ctrl3dFps';
          const fpsEl = document.getElementById(fpsId);
          if (fpsEl) fpsEl.textContent = `${this._frameCount} FPS`;
          this._frameCount = 0;
          this._fpsTimer = 0;
        }

        this.render();
      };
      this.raf = requestAnimationFrame(loop);
    }

    stop() {
      if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    }
  }

  // =========================================================================
  // BOOTSTRAP: initialise engines for Design Studio & Controller Digital Twin
  // =========================================================================
  function initCtrl3D() {
    const engineDesign = new Controller3DEngine('ctrl3dAnimCanvas');
    const engineTwin   = new Controller3DEngine('ctrlTwin3dAnimCanvas');
    const engines = [engineDesign, engineTwin].filter(e => !!e.canvas);
    if (engines.length === 0) return;

    // Expose globally so app.js can call either or both
    window._ctrl3dEngine = engineDesign.canvas ? engineDesign : engineTwin;
    window._ctrl3dTwinEngine = engineTwin.canvas ? engineTwin : engineDesign;
    window._ctrl3dUpdateInfoPanel = updateInfoPanel;

    engines.forEach(e => e.start());

    // Reset View buttons
    const bindReset = (btnId, targetEngine) => {
      const btn = document.getElementById(btnId);
      if (btn && targetEngine) btn.addEventListener('click', () => targetEngine.resetView());
    };
    bindReset('btn3dReset', engineDesign);
    bindReset('btnTwin3dReset', engineTwin);

    // Pause / Resume buttons
    const bindToggle = (btnId, targetEngine) => {
      const btn = document.getElementById(btnId);
      if (btn && targetEngine) {
        btn.addEventListener('click', () => {
          targetEngine.paused = !targetEngine.paused;
          btn.textContent = targetEngine.paused ? '▶ Resume' : '⏸ Pause';
        });
      }
    };
    bindToggle('btn3dToggleAnim', engineDesign);
    bindToggle('btnTwin3dToggleAnim', engineTwin);

    // Synchronized Geometry Parameter Application
    function getInputs(prefix) {
      return {
        L:  parseFloat(document.getElementById(prefix + 'Length')?.value)    || 1.2,
        B:  parseFloat(document.getElementById(prefix + 'Breadth')?.value)   || 0.6,
        H:  parseFloat(document.getElementById(prefix + 'Height')?.value)    || 0.4,
        m:  parseFloat(document.getElementById(prefix + 'Mass')?.value)      || 5.0,
        s:  parseFloat(document.getElementById(prefix + 'Scale')?.value)     || 1.0,
        th: parseFloat(document.getElementById(prefix + 'Thickness')?.value) || 0.06
      };
    }

    function syncInputs(fromPrefix, toPrefix) {
      const pFrom = getInputs(fromPrefix);
      const toL = document.getElementById(toPrefix + 'Length');
      const toB = document.getElementById(toPrefix + 'Breadth');
      const toH = document.getElementById(toPrefix + 'Height');
      const toM = document.getElementById(toPrefix + 'Mass');
      const toS = document.getElementById(toPrefix + 'Scale');
      const toT = document.getElementById(toPrefix + 'Thickness');
      if (toL) toL.value = pFrom.L;
      if (toB) toB.value = pFrom.B;
      if (toH) toH.value = pFrom.H;
      if (toM) toM.value = pFrom.m;
      if (toS) toS.value = pFrom.s;
      if (toT) toT.value = pFrom.th;

      engines.forEach(e => e.setGeometry(pFrom.L, pFrom.B, pFrom.H, pFrom.m, pFrom.s, pFrom.th));
    }

    const btnApplyDesign = document.getElementById('btn3dApplyGeom');
    if (btnApplyDesign) btnApplyDesign.addEventListener('click', () => syncInputs('geom3d', 'geomTwin'));

    const btnApplyTwin = document.getElementById('btnTwin3dApplyGeom');
    if (btnApplyTwin) btnApplyTwin.addEventListener('click', () => syncInputs('geomTwin', 'geom3d'));

    // Live sync on direct parameter input changes
    ['Length', 'Breadth', 'Height', 'Mass', 'Scale', 'Thickness'].forEach(param => {
      const inpD = document.getElementById('geom3d' + param);
      if (inpD) inpD.addEventListener('input', () => syncInputs('geom3d', 'geomTwin'));

      const inpT = document.getElementById('geomTwin' + param);
      if (inpT) inpT.addEventListener('input', () => syncInputs('geomTwin', 'geom3d'));
    });

    // Update info panel elements helper across both views
    function updateInfoPanel(ctrlId, gains, perf) {
      const t = getTheme(ctrlId);

      // Design Studio Badges & Info
      const badge = document.getElementById('badge3dCtrlName');
      if (badge) badge.textContent = `${t.label} Active`;

      const c3name  = document.getElementById('c3d_name');
      const c3kp    = document.getElementById('c3d_kp');
      const c3ki    = document.getElementById('c3d_ki');
      const c3kd    = document.getElementById('c3d_kd');
      const c3zeta  = document.getElementById('c3d_zeta');
      const c3wn    = document.getElementById('c3d_wn');
      const c3ts    = document.getElementById('c3d_ts');
      const c3mp    = document.getElementById('c3d_mp');

      if (c3name)  c3name.textContent  = t.label;
      if (c3kp)    c3kp.textContent    = gains?.kp?.toFixed(3) ?? '—';
      if (c3ki)    c3ki.textContent    = gains?.ki?.toFixed(3) ?? '—';
      if (c3kd)    c3kd.textContent    = gains?.kd?.toFixed(3) ?? '—';
      if (c3zeta)  c3zeta.textContent  = perf?.zeta?.toFixed(4) ?? '—';
      if (c3wn)    c3wn.textContent    = perf?.wn?.toFixed(3) ?? '—';
      if (c3ts)    c3ts.textContent    = perf?.Ts2 ? `${perf.Ts2.toFixed(2)} s` : '—';
      if (c3mp)    c3mp.textContent    = perf?.Mp  ? `${perf.Mp.toFixed(1)} %` : '—';

      // Controller Digital Twin Badges & Readouts
      const badgeTwin = document.getElementById('badgeTwin3dCtrlName');
      if (badgeTwin) badgeTwin.textContent = `${t.label} Active`;

      const cTwinName = document.getElementById('cTwin3d_name');
      const cTwinKp   = document.getElementById('cTwin3d_kp');
      const cTwinKi   = document.getElementById('cTwin3d_ki');
      const cTwinKd   = document.getElementById('cTwin3d_kd');
      const cTwinZeta = document.getElementById('cTwin3d_zeta');
      const cTwinWn   = document.getElementById('cTwin3d_wn');
      const cTwinTs   = document.getElementById('cTwin3d_ts');
      const cTwinMp   = document.getElementById('cTwin3d_mp');

      if (cTwinName) cTwinName.textContent = t.label;
      if (cTwinKp)   cTwinKp.textContent   = gains?.kp?.toFixed(3) ?? '—';
      if (cTwinKi)   cTwinKi.textContent   = gains?.ki?.toFixed(3) ?? '—';
      if (cTwinKd)   cTwinKd.textContent   = gains?.kd?.toFixed(3) ?? '—';
      if (cTwinZeta) cTwinZeta.textContent = perf?.zeta?.toFixed(4) ?? '—';
      if (cTwinWn)   cTwinWn.textContent   = perf?.wn?.toFixed(3) ?? '—';
      if (cTwinTs)   cTwinTs.textContent   = perf?.Ts2 ? `${perf.Ts2.toFixed(2)} s` : '—';
      if (cTwinMp)   cTwinMp.textContent   = perf?.Mp  ? `${perf.Mp.toFixed(1)} %` : '—';

      // Digital Twin Metrics Tiles Bar
      const twName = document.getElementById('twinCtrlName');
      const twGains = document.getElementById('twinCtrlGains');
      const twDyn = document.getElementById('twinCtrlDynamics');
      const twPerf = document.getElementById('twinCtrlPerf');

      if (twName) twName.textContent = `${t.label} Controller`;
      if (twGains) twGains.textContent = `${gains?.kp?.toFixed(2) ?? '—'} / ${gains?.ki?.toFixed(2) ?? '—'} / ${gains?.kd?.toFixed(2) ?? '—'}`;
      if (twDyn) twDyn.textContent = `ζ=${perf?.zeta?.toFixed(3) ?? '—'} | ωn=${perf?.wn?.toFixed(2) ?? '—'}`;
      if (twPerf) twPerf.textContent = `Ts=${perf?.Ts2?.toFixed(2) ?? '—'}s | Mp=${perf?.Mp?.toFixed(1) ?? '—'}%`;
    }

    // Hook: listen for the custom event fired by app.js when synthesise completes
    document.addEventListener('acep:controllerSynthesized', (e) => {
      const { ctrlId, gains, perf } = e.detail || {};
      engines.forEach(eng => eng.setController(ctrlId, gains, perf));
      updateInfoPanel(ctrlId, gains, perf);
    });

    // Fallback polling if event not fired: read from DOM every 500 ms
    setInterval(() => {
      if (typeof window._acepState === 'undefined') return;
      const s = window._acepState;
      if (!s || !s.controllerId) return;
      if (s.controllerId === engines[0].ctrlId) return; // no change
      engines.forEach(eng => eng.setController(s.controllerId, s.gains, s.perf));
      updateInfoPanel(s.controllerId, s.gains, s.perf);
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCtrl3D);
  } else {
    initCtrl3D();
  }
})();
