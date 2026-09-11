/* ==========================================================================
   Thermal IR Optical Camera Visualizer
   ========================================================================== */

export class ThermalCameraSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.mode = 'ir'; // 'ir' or 'rgb'
    this.target = { x: 200, y: 110, vx: 0.4, vy: 0.2 };

    this.initEvents();
    this.animate();
  }

  initEvents() {
    const irBtn = document.getElementById('cam-mode-ir');
    const rgbBtn = document.getElementById('cam-mode-rgb');

    if (irBtn && rgbBtn) {
      irBtn.addEventListener('click', () => {
        irBtn.classList.add('active');
        rgbBtn.classList.remove('active');
        this.mode = 'ir';
      });
      rgbBtn.addEventListener('click', () => {
        rgbBtn.classList.add('active');
        irBtn.classList.remove('active');
        this.mode = 'rgb';
      });
    }
  }

  animate() {
    this.updateTarget();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  updateTarget() {
    this.target.x += this.target.vx;
    this.target.y += this.target.vy;

    if (this.target.x > 320 || this.target.x < 80) this.target.vx *= -1;
    if (this.target.y > 170 || this.target.y < 50) this.target.vy *= -1;
  }

  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background Feed Gradient
    if (this.mode === 'ir') {
      const bgGrad = this.ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#040212');
      bgGrad.addColorStop(0.5, '#120a2a');
      bgGrad.addColorStop(1, '#050210');
      this.ctx.fillStyle = bgGrad;
      this.ctx.fillRect(0, 0, w, h);

      // Noise scanlines
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < h; y += 4) {
        this.ctx.fillRect(0, y, w, 1);
      }

      // Draw Drone Thermal Heat Blob (white/yellow/red gradient)
      const tx = this.target.x;
      const ty = this.target.y;

      const thermalGrad = this.ctx.createRadialGradient(tx, ty, 2, tx, ty, 35);
      thermalGrad.addColorStop(0, '#ffffff');
      thermalGrad.addColorStop(0.3, '#ffcc00');
      thermalGrad.addColorStop(0.6, '#ff2a5f');
      thermalGrad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = thermalGrad;
      this.ctx.beginPath();
      this.ctx.arc(tx, ty, 35, 0, Math.PI * 2);
      this.ctx.fill();

      // Rotor thermal spots
      const spots = [[-18, -12], [18, -12], [-18, 12], [18, 12]];
      spots.forEach(([ox, oy]) => {
        const spotGrad = this.ctx.createRadialGradient(tx + ox, ty + oy, 1, tx + ox, ty + oy, 8);
        spotGrad.addColorStop(0, '#ffffff');
        spotGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = spotGrad;
        this.ctx.beginPath();
        this.ctx.arc(tx + ox, ty + oy, 8, 0, Math.PI * 2);
        this.ctx.fill();
      });

    } else {
      // RGB Mode (Daylight Sky View)
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#101c30');
      skyGrad.addColorStop(1, '#1b2a45');
      this.ctx.fillStyle = skyGrad;
      this.ctx.fillRect(0, 0, w, h);

      // Simple Quadcopter Silhouette
      const tx = this.target.x;
      const ty = this.target.y;

      this.ctx.fillStyle = '#090d16';
      this.ctx.fillRect(tx - 12, ty - 4, 24, 8); // Body
      this.ctx.strokeStyle = '#090d16';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(tx - 20, ty - 14); this.ctx.lineTo(tx + 20, ty + 14);
      this.ctx.moveTo(tx + 20, ty - 14); this.ctx.lineTo(tx - 20, ty + 14);
      this.ctx.stroke();

      // Rotor blades
      const blurRad = (Date.now() / 20) % (Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      [[-20, -14], [20, -14], [-20, 14], [20, 14]].forEach(([ox, oy]) => {
        this.ctx.beginPath();
        this.ctx.ellipse(tx + ox, ty + oy, 12, 3, blurRad, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    // Target Locking Bounding Box
    const tx = this.target.x;
    const ty = this.target.y;
    const boxSize = 50;

    this.ctx.strokeStyle = '#ff2a5f';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(tx - boxSize / 2, ty - boxSize / 2, boxSize, boxSize);

    // Corner brackets
    const bLen = 10;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    // Top-Left
    this.ctx.moveTo(tx - boxSize / 2, ty - boxSize / 2 + bLen);
    this.ctx.lineTo(tx - boxSize / 2, ty - boxSize / 2);
    this.ctx.lineTo(tx - boxSize / 2 + bLen, ty - boxSize / 2);
    // Top-Right
    this.ctx.moveTo(tx + boxSize / 2 - bLen, ty - boxSize / 2);
    this.ctx.lineTo(tx + boxSize / 2, ty - boxSize / 2);
    this.ctx.lineTo(tx + boxSize / 2, ty - boxSize / 2 + bLen);
    // Bottom-Left
    this.ctx.moveTo(tx - boxSize / 2, ty + boxSize / 2 - bLen);
    this.ctx.lineTo(tx - boxSize / 2, ty + boxSize / 2);
    this.ctx.lineTo(tx - boxSize / 2 + bLen, ty + boxSize / 2);
    // Bottom-Right
    this.ctx.moveTo(tx + boxSize / 2 - bLen, ty + boxSize / 2);
    this.ctx.lineTo(tx + boxSize / 2, ty + boxSize / 2);
    this.ctx.lineTo(tx + boxSize / 2, ty + boxSize / 2 - bLen);
    this.ctx.stroke();

    // Text Overlay
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.font = '10px Orbitron';
    this.ctx.fillText('LOCK: UAV-104', tx - boxSize / 2, ty - boxSize / 2 - 6);
  }
}
