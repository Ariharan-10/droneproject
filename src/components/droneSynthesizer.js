/* ==========================================================================
   Interactive Drone Acoustic Synthesizer & AI Threat Gauge
   ========================================================================== */

export class DroneSynthesizerEngine {
  constructor() {
    this.rpm = 5400;
    this.blades = 2;
    this.distance = 150;
    this.noise = 15;
    this.isSynthPlaying = false;

    this.audioCtx = null;
    this.osc1 = null;
    this.osc2 = null;
    this.noiseNode = null;
    this.gainNode = null;

    this.gaugeCanvas = document.getElementById('threat-gauge-canvas');
    this.spectrumCanvas = document.getElementById('synth-spectrum-canvas');

    this.initEvents();
    this.updateReadouts();
    this.drawGauge(94);
    this.drawSynthSpectrum();
  }

  initEvents() {
    const rpmInput = document.getElementById('synth-rpm');
    const distInput = document.getElementById('synth-dist');
    const noiseInput = document.getElementById('synth-noise');
    const bladeBtns = document.querySelectorAll('#blade-count-selector button');
    const toggleBtn = document.getElementById('btn-toggle-synth');

    if (rpmInput) {
      rpmInput.addEventListener('input', (e) => {
        this.rpm = parseInt(e.target.value, 10);
        this.updateReadouts();
        this.updateSynthAudio();
      });
    }

    if (distInput) {
      distInput.addEventListener('input', (e) => {
        this.distance = parseInt(e.target.value, 10);
        this.updateReadouts();
        this.updateSynthAudio();
      });
    }

    if (noiseInput) {
      noiseInput.addEventListener('input', (e) => {
        this.noise = parseInt(e.target.value, 10);
        this.updateReadouts();
        this.updateSynthAudio();
      });
    }

    bladeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bladeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.blades = parseInt(btn.dataset.blades, 10);
        this.updateReadouts();
        this.updateSynthAudio();
      });
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleSynth();
      });
    }
  }

  calculateBPF() {
    return (this.rpm / 60) * this.blades;
  }

  calculateDB() {
    // Inverse square law simulation from 85dB at 10m
    const baseDb = 95;
    const db = baseDb - 20 * Math.log10(Math.max(1, this.distance / 10));
    return Math.max(30, Math.min(105, db)).toFixed(1);
  }

  calculateThreatPct() {
    const bpf = this.calculateBPF();
    const db = parseFloat(this.calculateDB());
    
    // Drones usually operate in 200Hz - 1200Hz fundamental frequency band
    let freqScore = (bpf >= 180 && bpf <= 1200) ? 90 : 20;
    let distScore = db > 65 ? 95 : 50;
    return Math.min(99, Math.max(10, Math.round((freqScore + distScore) / 2)));
  }

  updateReadouts() {
    const bpf = this.calculateBPF();
    const db = this.calculateDB();
    const threatPct = this.calculateThreatPct();

    const rpmVal = document.getElementById('synth-rpm-val');
    const freqSub = document.getElementById('synth-fundamental-freq');
    const distVal = document.getElementById('synth-dist-val');
    const noiseVal = document.getElementById('synth-noise-val');
    const bladesVal = document.getElementById('synth-blades-val');

    const dbVal = document.getElementById('gauge-db-val');
    const confVal = document.getElementById('gauge-conf-val');
    const threatText = document.getElementById('gauge-threat-text');

    if (rpmVal) rpmVal.textContent = `${this.rpm.toLocaleString()} RPM`;
    if (freqSub) freqSub.textContent = `${bpf.toFixed(1)} Hz`;
    if (distVal) distVal.textContent = `${this.distance} m`;
    if (noiseVal) noiseVal.textContent = `${this.noise}%`;
    if (bladesVal) bladesVal.textContent = `${this.blades} Blades`;

    if (dbVal) dbVal.textContent = `${db} dB`;
    if (confVal) confVal.textContent = `${threatPct}%`;

    if (threatText) {
      if (threatPct > 75) {
        threatText.textContent = 'HIGH DRONE THREAT DETECTED';
        threatText.className = 'gauge-status-title text-red';
      } else if (threatPct > 40) {
        threatText.textContent = 'MODERATE ROTOR WARNING';
        threatText.className = 'gauge-status-title text-amber';
      } else {
        threatText.textContent = 'SAFE / LOW ACOUSTIC THREAT';
        threatText.className = 'gauge-status-title text-emerald';
      }
    }

    this.drawGauge(threatPct);
    this.drawSynthSpectrum();
  }

  toggleSynth() {
    if (this.isSynthPlaying) {
      this.stopSynth();
    } else {
      this.startSynth();
    }
  }

  startSynth() {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!this.audioCtx) this.audioCtx = new AudioCtxClass();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const now = this.audioCtx.currentTime;
    const bpf = this.calculateBPF();

    this.osc1 = this.audioCtx.createOscillator();
    this.osc2 = this.audioCtx.createOscillator();
    this.gainNode = this.audioCtx.createGain();

    const db = parseFloat(this.calculateDB());
    const gainVal = Math.min(0.8, db / 120);
    this.gainNode.gain.setValueAtTime(gainVal, now);

    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(bpf, now);

    this.osc2.type = 'sine';
    this.osc2.frequency.setValueAtTime(bpf * 2, now); // 2nd harmonic

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.osc1.start();
    this.osc2.start();

    this.isSynthPlaying = true;
    const btn = document.getElementById('btn-toggle-synth');
    const icon = document.getElementById('synth-play-icon');
    if (btn && icon) {
      btn.className = 'btn btn-danger btn-lg btn-block';
      icon.className = 'fa-solid fa-pause';
      btn.innerHTML = `<i class="fa-solid fa-pause"></i> STOP ACOUSTIC SYNTH`;
    }
  }

  updateSynthAudio() {
    if (!this.isSynthPlaying || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const bpf = this.calculateBPF();
    if (this.osc1) this.osc1.frequency.setValueAtTime(bpf, now);
    if (this.osc2) this.osc2.frequency.setValueAtTime(bpf * 2, now);
  }

  stopSynth() {
    if (this.osc1) { try { this.osc1.stop(); } catch(e){} this.osc1 = null; }
    if (this.osc2) { try { this.osc2.stop(); } catch(e){} this.osc2 = null; }
    this.isSynthPlaying = false;

    const btn = document.getElementById('btn-toggle-synth');
    if (btn) {
      btn.className = 'btn btn-amber btn-lg btn-block';
      btn.innerHTML = `<i class="fa-solid fa-play"></i> START LIVE ACOUSTIC SYNTH`;
    }
  }

  drawGauge(valPct) {
    if (!this.gaugeCanvas) return;
    const ctx = this.gaugeCanvas.getContext('2d');
    const w = this.gaugeCanvas.width;
    const h = this.gaugeCanvas.height;

    const cx = w / 2;
    const cy = h - 20;
    const radius = Math.min(cx, cy) - 20;

    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, 0, w, h);

    // Background Arc
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Value Arc
    const valRad = Math.PI + (valPct / 100) * Math.PI;
    const arcGrad = ctx.createLinearGradient(0, cy, w, cy);
    arcGrad.addColorStop(0, '#00ff9d');
    arcGrad.addColorStop(0.5, '#ffb700');
    arcGrad.addColorStop(1, '#ff2a5f');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, valRad);
    ctx.strokeStyle = arcGrad;
    ctx.shadowColor = '#ff2a5f';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Needle Pointer
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(valRad);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(radius - 10, 0);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2a5f';
    ctx.fill();

    ctx.restore();

    // Center Percentage Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(`${valPct}%`, cx, cy - 35);
  }

  drawSynthSpectrum() {
    if (!this.spectrumCanvas) return;
    const ctx = this.spectrumCanvas.getContext('2d');
    const w = this.spectrumCanvas.width;
    const h = this.spectrumCanvas.height;

    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, 0, w, h);

    const bpf = this.calculateBPF();
    const harmonics = [bpf, bpf * 2, bpf * 3, bpf * 4, bpf * 5];

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Spectrum Bars
    harmonics.forEach((freq, idx) => {
      const x = (freq / 3000) * w;
      if (x < w) {
        const barH = (1 - idx * 0.18) * (h - 30);
        ctx.fillStyle = idx === 0 ? '#ff2a5f' : '#00f3ff';
        ctx.fillRect(x - 3, h - barH, 6, barH);

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '9px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(freq)}Hz`, x, h - barH - 4);
      }
    });
  }
}
