/* ==========================================================================
   AI Model Benchmarks & Metrics Canvas Visualizers
   ========================================================================== */

export class ModelMetricsEngine {
  constructor() {
    this.accuracyCanvas = document.getElementById('accuracy-chart-canvas');
    this.featureCanvas = document.getElementById('feature-importance-canvas');
    this.matrixContainer = document.getElementById('confusion-matrix-container');

    this.renderAccuracyChart();
    this.renderConfusionMatrix();
    this.renderFeatureImportance();
  }

  renderAccuracyChart() {
    if (!this.accuracyCanvas) return;
    const ctx = this.accuracyCanvas.getContext('2d');
    const w = this.accuracyCanvas.width;
    const h = this.accuracyCanvas.height;

    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, 0, w, h);

    const padding = 40;
    const chartW = w - padding * 2;
    const chartH = h - padding * 2;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px Rajdhani';
      ctx.fillText(`${100 - i * 25}%`, 8, y + 4);
    }

    // Simulated 50 Epoch Training & Validation Data
    const epochs = 50;
    const trainAcc = [];
    const valAcc = [];

    for (let i = 0; i < epochs; i++) {
      const t = i / epochs;
      trainAcc.push(0.45 + 0.53 * (1 - Math.exp(-4 * t)) + (Math.random() - 0.5) * 0.015);
      valAcc.push(0.40 + 0.58 * (1 - Math.exp(-3.5 * t)) + (Math.random() - 0.5) * 0.02);
    }

    // Draw Train Accuracy (Cyan)
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    trainAcc.forEach((val, i) => {
      const x = padding + (chartW / (epochs - 1)) * i;
      const y = padding + chartH * (1 - val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Validation Accuracy (Emerald)
    ctx.strokeStyle = '#00ff9d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    valAcc.forEach((val, i) => {
      const x = padding + (chartW / (epochs - 1)) * i;
      const y = padding + chartH * (1 - val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#00f3ff';
    ctx.fillRect(w - 180, 12, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '11px Rajdhani';
    ctx.fillText('Train Accuracy', w - 162, 22);

    ctx.fillStyle = '#00ff9d';
    ctx.fillRect(w - 80, 12, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.fillText('Val Accuracy', w - 62, 22);
  }

  renderConfusionMatrix() {
    if (!this.matrixContainer) return;

    const classes = ['Drone', 'Heli', 'Bird', 'Plane', 'Bg'];
    const matrix = [
      [482,   8,   4,   2,   4], // Drone
      [  6, 475,   9,   5,   5], // Heli
      [  3,  10, 480,   4,   3], // Bird
      [  2,   6,   5, 484,   3], // Plane
      [  4,   5,   3,   2, 486]  // Bg
    ];

    let html = `
      <div class="matrix-cell matrix-header-cell">Actual \\ Pred</div>
      ${classes.map(c => `<div class="matrix-cell matrix-header-cell">${c}</div>`).join('')}
    `;

    classes.forEach((rowClass, rIdx) => {
      html += `<div class="matrix-cell matrix-header-cell">${rowClass}</div>`;
      matrix[rIdx].forEach((val, cIdx) => {
        const isDiag = rIdx === cIdx;
        html += `<div class="matrix-cell ${isDiag ? 'matrix-diag' : ''}">${val}</div>`;
      });
    });

    this.matrixContainer.innerHTML = html;
  }

  renderFeatureImportance() {
    if (!this.featureCanvas) return;
    const ctx = this.featureCanvas.getContext('2d');
    const w = this.featureCanvas.width;
    const h = this.featureCanvas.height;

    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, 0, w, h);

    const features = [
      { name: 'MFCC 1 (Rotor Pitch)', score: 0.94 },
      { name: 'MFCC 2 (Harmonic 1)', score: 0.88 },
      { name: 'Spectral Centroid', score: 0.82 },
      { name: 'Zero Crossing Rate', score: 0.74 },
      { name: 'Mel Band 400Hz', score: 0.91 },
      { name: 'Chroma STFT', score: 0.65 }
    ];

    const barHeight = 22;
    const gap = 12;
    const startY = 15;

    features.forEach((feat, idx) => {
      const y = startY + idx * (barHeight + gap);

      // Label
      ctx.fillStyle = 'rgba(240, 244, 248, 0.8)';
      ctx.font = '11px Rajdhani';
      ctx.fillText(feat.name, 12, y + 15);

      // Bar container
      const barX = 140;
      const maxW = w - barX - 60;
      const barW = maxW * feat.score;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(barX, y, maxW, barHeight);

      // Bar fill
      ctx.fillStyle = 'linear-gradient(90deg, #ffb700 0%, #00f3ff 100%)';
      ctx.fillStyle = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      ctx.fillStyle.addColorStop(0, '#ffb700');
      ctx.fillStyle.addColorStop(1, '#00f3ff');
      ctx.fillRect(barX, y, barW, barHeight);

      // Score percentage
      ctx.fillStyle = '#00f3ff';
      ctx.font = 'bold 11px Rajdhani';
      ctx.fillText(`${(feat.score * 100).toFixed(1)}%`, barX + barW + 8, y + 15);
    });
  }
}
