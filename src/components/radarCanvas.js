/* ==========================================================================
   Radar 2D Canvas Engine
   ========================================================================== */

export class RadarEngine {
  constructor(canvasId, onTargetSelect) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.onTargetSelect = onTargetSelect;

    this.sweepAngle = 0;
    this.rangeMax = 500; // meters
    this.selectedTargetId = 'UAV-104';

    // Target data in polar/cartesian coordinates relative to radar center
    this.targets = [
      {
        id: 'UAV-104',
        name: 'DJI Mavic Pro Quadcopter',
        dist: 242, // meters
        angle: 42, // degrees
        alt: 45,
        db: 78.4,
        rpm: 5420,
        freq: 361.3,
        threatPct: 94,
        type: 'quadcopter',
        speed: 12.4, // m/s
        heading: 135
      },
      {
        id: 'UAV-208',
        name: 'FPV Micro Racing Drone',
        dist: 380,
        angle: 195,
        alt: 28,
        db: 84.1,
        rpm: 11200,
        freq: 746.6,
        threatPct: 98,
        type: 'fpv',
        speed: 24.8,
        heading: 45
      },
      {
        id: 'HELI-01',
        name: 'Civilian Helicopter (Bell 407)',
        dist: 450,
        angle: 310,
        alt: 180,
        db: 92.5,
        rpm: 450,
        freq: 22.5,
        threatPct: 15,
        type: 'helicopter',
        speed: 48.0,
        heading: 270
      }
    ];

    this.initEvents();
    this.animate();
  }

  setRange(meters) {
    this.rangeMax = meters;
  }

  initEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Check distance to targets
      for (const t of this.targets) {
        const rad = (t.angle * Math.PI) / 180;
        const normDist = (t.dist / this.rangeMax) * radius;
        const tx = centerX + normDist * Math.sin(rad);
        const ty = centerY - normDist * Math.cos(rad);

        const distSq = (clickX - tx) ** 2 + (clickY - ty) ** 2;
        if (distSq < 400) { // 20px radius click zone
          this.selectedTargetId = t.id;
          if (this.onTargetSelect) this.onTargetSelect(t);
          break;
        }
      }
    });
  }

  animate() {
    this.sweepAngle = (this.sweepAngle + 1.2) % 360;
    this.updateTargetPositions();
    this.draw();

    // Update HUD text if element exists
    const angleEl = document.getElementById('radar-sweep-angle');
    if (angleEl) angleEl.textContent = `${Math.floor(this.sweepAngle)}°`;

    requestAnimationFrame(() => this.animate());
  }

  updateTargetPositions() {
    // Subtle target drift simulation
    this.targets.forEach(t => {
      t.angle = (t.angle + (Math.random() - 0.5) * 0.05 + 360) % 360;
      t.dist = Math.max(50, Math.min(this.rangeMax * 0.95, t.dist + (Math.random() - 0.5) * 0.2));
    });
  }

  draw() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 25;

    // Clear background
    this.ctx.fillStyle = '#070b13';
    this.ctx.fillRect(0, 0, width, height);

    // Draw Grid Rings (100m, 250m, 500m)
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';

    const rings = [0.25, 0.5, 0.75, 1.0];
    rings.forEach((r, idx) => {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
      this.ctx.stroke();

      // Distance Label
      this.ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
      this.ctx.font = '10px Rajdhani';
      this.ctx.fillText(`${Math.round(this.rangeMax * r)}m`, centerX + 4, centerY - radius * r + 12);
    });

    // Crosshairs
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - radius, centerY);
    this.ctx.lineTo(centerX + radius, centerY);
    this.ctx.moveTo(centerX, centerY - radius);
    this.ctx.lineTo(centerX, centerY + radius);
    this.ctx.stroke();

    // Cardinal Points (N, S, E, W)
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.font = 'bold 12px Orbitron';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('N', centerX, centerY - radius - 8);
    this.ctx.fillText('S', centerX, centerY + radius + 16);
    this.ctx.fillText('E', centerX + radius + 12, centerY + 4);
    this.ctx.fillText('W', centerX - radius - 12, centerY + 4);

    // Draw Sweeping Beam & Sector Trail
    const currentRad = (this.sweepAngle * Math.PI) / 180;

    // Gradient Sweep Sector
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.arc(centerX, centerY, radius, currentRad - 0.4, currentRad);
    this.ctx.closePath();

    const sweepGrad = this.ctx.createConicGradient(currentRad, centerX, centerY);
    sweepGrad.addColorStop(0, 'rgba(0, 243, 255, 0.35)');
    sweepGrad.addColorStop(0.1, 'rgba(0, 243, 255, 0.05)');
    sweepGrad.addColorStop(1, 'transparent');

    this.ctx.fillStyle = sweepGrad;
    this.ctx.fill();
    this.ctx.restore();

    // Leading Sweep Line
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(
      centerX + radius * Math.sin(currentRad),
      centerY - radius * Math.cos(currentRad)
    );
    this.ctx.strokeStyle = '#00f3ff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 10;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0; // reset shadow

    // Draw Targets
    this.targets.forEach(t => {
      const rad = (t.angle * Math.PI) / 180;
      const normDist = (t.dist / this.rangeMax) * radius;
      const tx = centerX + normDist * Math.sin(rad);
      const ty = centerY - normDist * Math.cos(rad);

      const isSelected = t.id === this.selectedTargetId;

      // Color code by threat
      let color = t.threatPct > 70 ? '#ff2a5f' : (t.threatPct > 40 ? '#ffb700' : '#00ff9d');

      // Target Dot
      this.ctx.beginPath();
      this.ctx.arc(tx, ty, isSelected ? 6 : 4, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = isSelected ? 15 : 6;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Target Reticle Box if selected
      if (isSelected) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.strokeRect(tx - 12, ty - 12, 24, 24);

        // Reticle Corner Accents
        this.ctx.fillStyle = color;
        this.ctx.font = '10px Rajdhani';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${t.id} [${t.type.toUpperCase()}]`, tx + 16, ty - 4);
        this.ctx.fillText(`${Math.round(t.dist)}m / ${t.db}dB`, tx + 16, ty + 8);
      } else {
        this.ctx.fillStyle = 'rgba(240, 244, 248, 0.7)';
        this.ctx.font = '9px Rajdhani';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(t.id, tx + 8, ty + 3);
      }
    });
  }
}
