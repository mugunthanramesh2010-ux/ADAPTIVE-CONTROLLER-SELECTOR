/**
 * CONTROL-ARENA X — DYNAMIC BLOCK DIAGRAM RENDERER
 * Executable architecture representation synchronized with active plant,
 * synthesized controller, sensor, actuator, and disturbance configuration.
 *
 * Compliance: Part 8 of Specification.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BlockDiagramRenderer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class BlockDiagramRenderer {
    constructor(canvas, options = {}) {
      this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.options = Object.assign({
        interactive: true,
        showFormulas: true,
        onSelectBlock: null
      }, options);

      this.selectedBlockId = null;
      this.hoveredBlockId = null;

      // Active execution model state
      this.model = {
        plantId: 'dcmotor',
        plantName: 'Precision DC Servomotor',
        plantParams: { J: 0.01, b: 0.1, Kt: 0.01, R: 1.0, L: 0.5 },
        transferFunction: 'G(s) = 20 / (s² + 10s + 20)',
        controllerId: 'pid',
        controllerName: 'PID Controller',
        controllerGains: { kp: 4.5, ki: 1.2, kd: 0.25 },
        uLimit: 24.0,
        sensorNoise: 0.01,
        sensorBias: 0.0,
        sensorDelayMs: 0,
        disturbanceType: 'Torque Step (+2.0 N·m)',
        hasObserver: true,
        hasCbfSafety: false,
        activeRunId: 'NOMINAL-RUN-01'
      };

      this.blocks = [];
      this.wires = [];

      this.buildArchitecture();

      if (this.canvas && this.options.interactive) {
        this.setupEventHandlers();
      }
    }

    setModel(newModel) {
      Object.assign(this.model, newModel);
      this.buildArchitecture();
      this.render();
    }

    buildArchitecture() {
      const m = this.model;
      const w = this.canvas ? this.canvas.width : 800;
      const h = this.canvas ? this.canvas.height : 280;

      // Block layout geometry
      const midY = Math.round(h * 0.38);
      const fbY = Math.round(h * 0.82);

      const ctrlGainsText = m.controllerGains ?
        Object.entries(m.controllerGains).map(([k, v]) => `${k}=${Number(v).toFixed(2)}`).join(', ') : 'Gains Tuned';

      this.blocks = [
        {
          id: 'blk_ref',
          type: 'source',
          label: 'Reference r(t)',
          sub: 'Setpoint Source',
          detail: 'Step / Chirp / Square Reference',
          x: 20,
          y: midY - 24,
          w: 80,
          h: 48,
          color: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.12)',
          ports: {
            inputs: [],
            outputs: [{ id: 'p_ref_out', name: 'r(t)', type: 'float', unit: 'rad/s' }]
          },
          contract: { role: 'Command Generator', sampling: 'Continuous / 100Hz' }
        },
        {
          id: 'blk_sum1',
          type: 'junction',
          label: 'Σ₁',
          sub: 'Error Junction',
          detail: 'e(t) = r(t) - y_meas(t)',
          x: 130,
          y: midY - 18,
          w: 36,
          h: 36,
          shape: 'circle',
          color: '#f0f6fc',
          bg: 'rgba(255, 255, 255, 0.08)',
          ports: {
            inputs: [
              { id: 'p_sum1_in_ref', name: '+', sign: '+' },
              { id: 'p_sum1_in_fb', name: '-', sign: '-' }
            ],
            outputs: [{ id: 'p_sum1_out', name: 'e(t)', type: 'float', unit: 'error' }]
          },
          contract: { role: 'Negative Feedback Comparator' }
        },
        {
          id: 'blk_ctrl',
          type: 'controller',
          label: m.controllerName || 'Controller',
          sub: ctrlGainsText,
          detail: `Algorithm: ${m.controllerId.toUpperCase()} [${ctrlGainsText}]`,
          x: 195,
          y: midY - 28,
          w: 125,
          h: 56,
          color: '#a78bfa',
          bg: 'rgba(167, 139, 250, 0.15)',
          ports: {
            inputs: [{ id: 'p_ctrl_in', name: 'e(t)', type: 'float' }],
            outputs: [{ id: 'p_ctrl_out', name: 'u_cmd(t)', type: 'float', unit: 'V' }]
          },
          contract: {
            algorithm: m.controllerId,
            gains: m.controllerGains,
            solver: 'Discrete Tustin / RK4'
          }
        },
        {
          id: 'blk_act',
          type: 'actuator',
          label: 'Actuator / Driver',
          sub: `Saturation ±${m.uLimit || 24}V`,
          detail: `Power Stage Driver with ±${m.uLimit || 24}V Hard Saturation`,
          x: 350,
          y: midY - 26,
          w: 105,
          h: 52,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
          ports: {
            inputs: [{ id: 'p_act_in', name: 'u_cmd(t)' }],
            outputs: [{ id: 'p_act_out', name: 'u_applied(t)', type: 'float', unit: 'V' }]
          },
          contract: { saturation: `±${m.uLimit || 24}V`, rateLimit: '120 V/s' }
        },
        {
          id: 'blk_sum2',
          type: 'junction',
          label: 'Σ₂',
          sub: 'Disturbance Junction',
          detail: 'u_tot = u_act + d(t)',
          x: 485,
          y: midY - 18,
          w: 36,
          h: 36,
          shape: 'circle',
          color: '#f43f5e',
          bg: 'rgba(244, 63, 94, 0.12)',
          ports: {
            inputs: [
              { id: 'p_sum2_in_act', name: '+' },
              { id: 'p_sum2_in_dist', name: '+d(t)' }
            ],
            outputs: [{ id: 'p_sum2_out', name: 'u_tot(t)' }]
          },
          contract: { disturbance: m.disturbanceType }
        },
        {
          id: 'blk_plant',
          type: 'plant',
          label: m.plantName || 'Physical Plant',
          sub: m.transferFunction ? m.transferFunction.slice(0, 22) : 'ODE dx/dt = Ax+Bu',
          detail: `Model: ${m.plantName} | Params: ${JSON.stringify(m.plantParams)}`,
          x: 550,
          y: midY - 30,
          w: 135,
          h: 60,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          ports: {
            inputs: [{ id: 'p_plt_in', name: 'u(t)', type: 'float', unit: 'V' }],
            outputs: [{ id: 'p_plt_out', name: 'y_true(t)', type: 'float', unit: 'rad/s' }]
          },
          contract: {
            model: m.plantId,
            stateDimensions: 2,
            parameters: m.plantParams,
            transferFunction: m.transferFunction
          }
        },
        {
          id: 'blk_sensor',
          type: 'sensor',
          label: 'Feedback Sensor',
          sub: `Noise σ = ${m.sensorNoise || 0.01}`,
          detail: `Measurement Transducer (Encoder/ADC) with Gaussian Noise σ=${m.sensorNoise}`,
          x: 340,
          y: fbY - 24,
          w: 120,
          h: 48,
          color: '#06b6d4',
          bg: 'rgba(6, 182, 212, 0.12)',
          ports: {
            inputs: [{ id: 'p_sen_in', name: 'y_true(t)' }],
            outputs: [{ id: 'p_sen_out', name: 'y_meas(t)', type: 'float' }]
          },
          contract: { noiseStd: m.sensorNoise, bias: m.sensorBias }
        }
      ];

      // Observer Block if enabled
      if (m.hasObserver) {
        this.blocks.push({
          id: 'blk_obs',
          type: 'observer',
          label: 'Luenberger Observer',
          sub: 'Residual r(k) = y - ŷ',
          detail: 'State Estimator & Innovation Residual Generator: r(k) = y(k) - C x̂(k)',
          x: 520,
          y: fbY - 24,
          w: 130,
          h: 48,
          color: '#ec4899',
          bg: 'rgba(236, 72, 153, 0.12)',
          ports: {
            inputs: [{ id: 'p_obs_y', name: 'y_meas' }],
            outputs: [{ id: 'p_obs_res', name: 'r(k)', type: 'float' }]
          },
          contract: { role: 'Observer & FDI Residual Monitor' }
        });
      }

      // Wires connecting ports
      this.wires = [
        { from: 'blk_ref', to: 'blk_sum1', signal: 'r(t)' },
        { from: 'blk_sum1', to: 'blk_ctrl', signal: 'e(t)' },
        { from: 'blk_ctrl', to: 'blk_act', signal: 'u_cmd' },
        { from: 'blk_act', to: 'blk_sum2', signal: 'u_applied' },
        { from: 'blk_sum2', to: 'blk_plant', signal: 'u_tot' },
        // Feedback loop
        {
          from: 'blk_plant',
          to: 'blk_sensor',
          signal: 'y_true',
          path: 'feedback_down'
        },
        {
          from: 'blk_sensor',
          to: 'blk_sum1',
          signal: 'y_meas',
          path: 'feedback_left'
        }
      ];

      if (m.hasObserver) {
        this.wires.push({
          from: 'blk_plant',
          to: 'blk_obs',
          signal: 'y_meas',
          path: 'observer_branch'
        });
      }
    }

    setupEventHandlers() {
      if (!this.canvas) return;

      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        const hit = this.hitTest(x, y);
        if (hit !== this.hoveredBlockId) {
          this.hoveredBlockId = hit;
          this.canvas.style.cursor = hit ? 'pointer' : 'default';
          this.render();
        }
      });

      this.canvas.addEventListener('click', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

        const hit = this.hitTest(x, y);
        this.selectedBlockId = hit;
        this.render();

        if (this.options.onSelectBlock && hit) {
          const blk = this.blocks.find(b => b.id === hit);
          this.options.onSelectBlock(blk);
        }
      });
    }

    hitTest(x, y) {
      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const b = this.blocks[i];
        if (b.shape === 'circle') {
          const r = b.w / 2;
          const cx = b.x + r;
          const cy = b.y + r;
          const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
          if (d2 <= r * r) return b.id;
        } else {
          if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            return b.id;
          }
        }
      }
      return null;
    }

    render() {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Background
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, w, h);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Disturbance Arrow into Σ₂
      const sum2 = this.blocks.find(b => b.id === 'blk_sum2');
      if (sum2) {
        const sx = sum2.x + sum2.w / 2;
        const sy = sum2.y;
        ctx.strokeStyle = '#f43f5e';
        ctx.fillStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 35);
        ctx.lineTo(sx, sy - 2);
        ctx.stroke();
        this.drawArrowhead(ctx, sx, sy - 2, 0, 1, '#f43f5e');

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('+ d(t) [Disturbance]', sx, sy - 40);
      }

      // Draw Wires
      this.drawWires(ctx);

      // Draw Blocks
      for (const b of this.blocks) {
        this.drawBlock(ctx, b);
      }

      // Draw Output Arrow from Plant
      const plant = this.blocks.find(b => b.id === 'blk_plant');
      if (plant) {
        const px = plant.x + plant.w;
        const py = plant.y + plant.h / 2;
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 45, py);
        ctx.stroke();
        this.drawArrowhead(ctx, px + 45, py, 1, 0, '#10b981');

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('y(t) [Output]', px + 50, py + 3);
      }
    }

    drawWires(ctx) {
      const getCenter = (id) => {
        const b = this.blocks.find(x => x.id === id);
        if (!b) return { x: 0, y: 0 };
        return {
          x: b.x + b.w / 2,
          y: b.y + b.h / 2,
          left: b.x,
          right: b.x + b.w,
          top: b.y,
          bottom: b.y + b.h
        };
      };

      for (const wire of this.wires) {
        const src = getCenter(wire.from);
        const dst = getCenter(wire.to);

        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();

        if (!wire.path) {
          // Standard horizontal flow
          ctx.moveTo(src.right, src.y);
          ctx.lineTo(dst.left, dst.y);
          ctx.stroke();
          this.drawArrowhead(ctx, dst.left, dst.y, 1, 0, '#38bdf8');

          if (wire.signal) {
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText(wire.signal, (src.right + dst.left) / 2, src.y - 6);
          }
        } else if (wire.path === 'feedback_down') {
          // Downwards from plant right to sensor right
          const turnX = src.right + 25;
          ctx.strokeStyle = '#06b6d4';
          ctx.fillStyle = '#06b6d4';
          ctx.moveTo(src.right, src.y);
          ctx.lineTo(turnX, src.y);
          ctx.lineTo(turnX, dst.y);
          ctx.lineTo(dst.right, dst.y);
          ctx.stroke();
          this.drawArrowhead(ctx, dst.right, dst.y, -1, 0, '#06b6d4');
        } else if (wire.path === 'feedback_left') {
          // Leftwards from sensor left back to Summing Junction 1
          const turnX = dst.x;
          ctx.strokeStyle = '#06b6d4';
          ctx.fillStyle = '#06b6d4';
          ctx.moveTo(src.left, src.y);
          ctx.lineTo(turnX, src.y);
          ctx.lineTo(turnX, dst.bottom);
          ctx.stroke();
          this.drawArrowhead(ctx, turnX, dst.bottom, 0, -1, '#06b6d4');

          // Draw minus sign near junction entry
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillStyle = '#f43f5e';
          ctx.textAlign = 'right';
          ctx.fillText('-', turnX - 6, dst.bottom + 12);
        }
      }
    }

    drawBlock(ctx, b) {
      const isSelected = this.selectedBlockId === b.id;
      const isHovered = this.hoveredBlockId === b.id;

      ctx.save();

      if (b.shape === 'circle') {
        const r = b.w / 2;
        const cx = b.x + r;
        const cy = b.y + r;

        ctx.fillStyle = b.bg;
        ctx.strokeStyle = isSelected ? '#ffffff' : (isHovered ? '#38bdf8' : b.color);
        ctx.lineWidth = isSelected ? 2.5 : 1.5;

        if (isSelected) {
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 12;
        }

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = b.color;
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, cx, cy);

        // Sign annotations on junction ports
        if (b.id === 'blk_sum1') {
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillStyle = '#10b981';
          ctx.fillText('+', b.x - 4, cy - 8);
        }
      } else {
        // Rounded rectangle block
        const rx = b.x;
        const ry = b.y;
        const rw = b.w;
        const rh = b.h;
        const radius = 6;

        ctx.fillStyle = b.bg;
        ctx.strokeStyle = isSelected ? '#ffffff' : (isHovered ? '#38bdf8' : b.color);
        ctx.lineWidth = isSelected ? 2.5 : 1.5;

        if (isSelected) {
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 12;
        }

        this.roundRect(ctx, rx, ry, rw, rh, radius);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#f0f6fc';
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, rx + rw / 2, ry + 18);

        // Subtitle / formula / parameter
        ctx.fillStyle = b.color;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(b.sub, rx + rw / 2, ry + 34);

        // Port markers (in / out dots)
        ctx.fillStyle = b.color;
        // In dot
        ctx.beginPath();
        ctx.arc(rx, ry + rh / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        // Out dot
        ctx.beginPath();
        ctx.arc(rx + rw, ry + rh / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    drawArrowhead(ctx, x, y, dx, dy, color) {
      const angle = Math.atan2(dy, dx);
      const headlen = 7;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    getArchitectureContract() {
      return {
        architecture: 'Standard Negative Feedback Control with Saturation and Disturbance',
        activeRunId: this.model.activeRunId,
        plant: {
          id: this.model.plantId,
          name: this.model.plantName,
          parameters: this.model.plantParams,
          transferFunction: this.model.transferFunction
        },
        controller: {
          id: this.model.controllerId,
          name: this.model.controllerName,
          gains: this.model.controllerGains
        },
        actuator: { saturationLimit: this.model.uLimit },
        sensor: { noiseStd: this.model.sensorNoise, bias: this.model.sensorBias },
        blocks: this.blocks.map(b => ({
          id: b.id,
          label: b.label,
          type: b.type,
          contract: b.contract
        })),
        wires: this.wires
      };
    }
  }

  return BlockDiagramRenderer;
});
