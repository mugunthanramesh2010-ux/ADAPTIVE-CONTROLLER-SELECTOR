/**
 * ACEP 3D Engineering Visualization Engine
 * Zero-dependency, lightweight, high-performance 3D perspective projection renderer.
 * 
 * Capabilities:
 *  1. 3D State-Space Trajectory Visualization [x1(t), x2(t), x3(t)]
 *  2. 3D Parameter-Performance Surface [Kp x Kd -> Objective Loss]
 *  3. Interactive mouse-drag 3D rotation, pitch/yaw orbit, and zoom
 */

class Engine3DViz {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Camera parameters
    this.rotX = 0.55; // Pitch
    this.rotY = -0.65; // Yaw
    this.zoom = 1.0;
    this.fov = 340;

    // Mouse Interaction
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.bindEvents();

    // Trajectory buffer: array of [x, y, z]
    this.trajectory = [];
    this.maxTrajectoryPoints = 350;

    // Precomputed 3D Parameter Surface Mesh
    this.surfaceMesh = this.generateSurfaceMesh();
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.rotY += dx * 0.008;
      this.rotX = Math.max(-1.4, Math.min(1.4, this.rotX + dy * 0.008));
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.4, Math.min(2.5, this.zoom - e.deltaY * 0.0015));
    }, { passive: false });
  }

  project(p) {
    // p is [x, y, z] in model coordinates
    // 1. Rotation Y (Yaw)
    const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
    const x1 = p[0] * cosY - p[2] * sinY;
    const z1 = p[0] * sinY + p[2] * cosY;

    // 2. Rotation X (Pitch)
    const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
    const y2 = p[1] * cosX - z1 * sinX;
    const z2 = p[1] * sinX + z1 * cosX;

    // 3. Perspective Projection
    const distance = 4.2 / this.zoom;
    const zEff = z2 + distance;
    if (zEff <= 0.2) return null;

    const scale = (this.fov / zEff);
    return {
      x: this.width / 2 + x1 * scale,
      y: this.height / 2 - y2 * scale,
      z: zEff
    };
  }

  addStatePoint(x1, x2, x3) {
    // Normalize into roughly [-1.2, 1.2]
    const p = [x1 * 0.7, x2 * 0.4, (x3 || (x1 * x2 * 0.5)) * 0.5];
    this.trajectory.push(p);
    if (this.trajectory.length > this.maxTrajectoryPoints) {
      this.trajectory.shift();
    }
  }

  generateSurfaceMesh() {
    const grid = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const row = [];
      const u = (i / steps) * 2 - 1; // -1 to 1 (representing Kp)
      for (let j = 0; j <= steps; j++) {
        const v = (j / steps) * 2 - 1; // -1 to 1 (representing Kd)
        // Bowl-shaped Rosenbrock/quadratic loss surface
        const cost = 0.5 * (u * u + 1.2 * v * v) - 0.2 * Math.sin(u * 3) * Math.cos(v * 3);
        row.push([u * 1.3, cost * 0.9 - 0.4, v * 1.3]);
      }
      grid.push(row);
    }
    return grid;
  }

  renderStateSpace(x1, x2, uVal) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, this.width, this.height);

    this.addStatePoint(x1, x2, uVal);

    // 1. Draw 3D Coordinate Bounding Box & Floor Grid
    ctx.strokeStyle = 'rgba(79, 172, 254, 0.12)';
    ctx.lineWidth = 1;

    // Floor Grid at y = -0.8
    const floorY = -0.8;
    for (let x = -1.2; x <= 1.2; x += 0.6) {
      const p1 = this.project([x, floorY, -1.2]);
      const p2 = this.project([x, floorY, 1.2]);
      if (p1 && p2) {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
    }
    for (let z = -1.2; z <= 1.2; z += 0.6) {
      const p1 = this.project([-1.2, floorY, z]);
      const p2 = this.project([1.2, floorY, z]);
      if (p1 && p2) {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
    }

    // 2. Draw 3D Coordinate Axes (X: Cyan, Y: Emerald, Z: Purple)
    const origin = this.project([0, floorY, 0]);
    const axisX = this.project([1.4, floorY, 0]);
    const axisY = this.project([0, 1.0, 0]);
    const axisZ = this.project([0, floorY, 1.4]);

    if (origin) {
      // X Axis (Position Error x1)
      if (axisX) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axisX.x, axisX.y); ctx.stroke();
        ctx.fillStyle = '#00f2fe'; ctx.font = '10px JetBrains Mono';
        ctx.fillText('x₁ (State)', axisX.x + 6, axisX.y);
      }
      // Y Axis (Control Command u)
      if (axisY) {
        ctx.strokeStyle = '#00f5a0';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axisY.x, axisY.y); ctx.stroke();
        ctx.fillStyle = '#00f5a0';
        ctx.fillText('u(t) (Effort)', axisY.x, axisY.y - 6);
      }
      // Z Axis (Velocity x2)
      if (axisZ) {
        ctx.strokeStyle = '#7f00ff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axisZ.x, axisZ.y); ctx.stroke();
        ctx.fillStyle = '#7f00ff';
        ctx.fillText('x₂ (Rate)', axisZ.x + 6, axisZ.y);
      }
    }

    // 3. Render 3D State-Space Trajectory Curve
    if (this.trajectory.length > 2) {
      ctx.lineWidth = 2.5;
      for (let i = 1; i < this.trajectory.length; i++) {
        const pt1 = this.project(this.trajectory[i - 1]);
        const pt2 = this.project(this.trajectory[i]);
        if (!pt1 || !pt2) continue;

        const progress = i / this.trajectory.length;
        ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0.15, progress)})`;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }

      // Draw active head sphere
      const head = this.project(this.trajectory[this.trajectory.length - 1]);
      if (head) {
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Overlay Controls Indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px Inter';
    ctx.fillText('🖱 Drag to orbit 3D | Scroll to zoom', 12, this.height - 12);
  }

  renderParameterSurface(currentKp, currentKd) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, this.width, this.height);

    // Render Surface Wireframe Mesh
    const grid = this.surfaceMesh;
    ctx.lineWidth = 1;

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const pCurrent = this.project(grid[i][j]);
        if (!pCurrent) continue;

        // Draw line along u direction
        if (i < grid.length - 1) {
          const pNextI = this.project(grid[i + 1][j]);
          if (pNextI) {
            ctx.strokeStyle = `rgba(127, 0, 255, ${0.25 + 0.3 * (grid[i][j][1] + 0.4)})`;
            ctx.beginPath(); ctx.moveTo(pCurrent.x, pCurrent.y); ctx.lineTo(pNextI.x, pNextI.y); ctx.stroke();
          }
        }

        // Draw line along v direction
        if (j < grid[i].length - 1) {
          const pNextJ = this.project(grid[i][j + 1]);
          if (pNextJ) {
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.25 + 0.3 * (grid[i][j][1] + 0.4)})`;
            ctx.beginPath(); ctx.moveTo(pCurrent.x, pCurrent.y); ctx.lineTo(pNextJ.x, pNextJ.y); ctx.stroke();
          }
        }
      }
    }

    // Project Current Operating Point on the surface
    const normKp = Math.max(-1, Math.min(1, (currentKp - 5) / 5));
    const normKd = Math.max(-1, Math.min(1, (currentKd - 1.5) / 2));
    const cost = 0.5 * (normKp * normKp + 1.2 * normKd * normKd) - 0.2 * Math.sin(normKp * 3) * Math.cos(normKd * 3);
    const opPoint = this.project([normKp * 1.3, cost * 0.9 - 0.4, normKd * 1.3]);

    if (opPoint) {
      ctx.fillStyle = '#00f5a0';
      ctx.shadowColor = '#00f5a0';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(opPoint.x, opPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`Active [Kp=${Number(currentKp).toFixed(1)}, Kd=${Number(currentKd).toFixed(1)}]`, opPoint.x + 8, opPoint.y - 6);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px Inter';
    ctx.fillText('3D Objective Loss Surface [Kp × Kd → ITAE]', 12, 18);
    ctx.fillText('🖱 Drag to orbit | Scroll to zoom', 12, this.height - 12);
  }
}

window.Engine3DViz = Engine3DViz;
