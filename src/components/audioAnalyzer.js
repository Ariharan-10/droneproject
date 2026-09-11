/* ==========================================================================
   Acoustic Spectrogram & Web Audio Analyzer
   ========================================================================== */

export class AudioAnalyzerEngine {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.synthOsc1 = null;
    this.synthOsc2 = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.currentPreset = 'quadcopter';

    this.waveformCanvas = document.getElementById('waveform-canvas');
    this.spectrogramCanvas = document.getElementById('spectrogram-canvas');
    this.mfccCanvas = document.getElementById('mfcc-canvas');

    this.spectroHistory = [];
    this.spectroHistoryMax = 100;

    this.initEvents();
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0.7;
      this.gainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initEvents() {
    // Dropzone setup
    const dropzone = document.getElementById('audio-dropzone');
    const fileInput = document.getElementById('audio-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Preset buttons
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPreset = btn.dataset.sample;
        const nowPlaying = document.getElementById('now-playing-text');
        if (nowPlaying) nowPlaying.textContent = `Active: ${btn.querySelector('.preset-name').textContent}`;
        if (this.isPlaying) {
          this.stopAudio();
          this.playPreset(this.currentPreset);
        }
      });
    });

    // Play & Stop buttons
    const playBtn = document.getElementById('btn-play-audio');
    const stopBtn = document.getElementById('btn-stop-audio');
    const volSlider = document.getElementById('vol-slider');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!this.isPlaying) {
          this.playPreset(this.currentPreset);
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopAudio());
    }

    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        if (this.gainNode) {
          this.gainNode.gain.value = parseFloat(e.target.value);
        }
      });
    }

    // FFT Size dropdown
    const fftSelect = document.getElementById('fft-size-select');
    if (fftSelect) {
      fftSelect.addEventListener('change', (e) => {
        if (this.analyser) {
          this.analyser.fftSize = parseInt(e.target.value, 10);
        }
      });
    }
  }

  handleFileUpload(file) {
    this.initAudioContext();
    this.stopAudio();

    const nowPlaying = document.getElementById('now-playing-text');
    if (nowPlaying) nowPlaying.textContent = `Processing Upload: ${file.name}...`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      this.audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
        this.sourceNode = this.audioCtx.createBufferSource();
        this.sourceNode.buffer = buffer;
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.gainNode);
        this.sourceNode.loop = true;
        this.sourceNode.start();
        this.isPlaying = true;
        this.updatePlayStateUI(true);
        if (nowPlaying) nowPlaying.textContent = `Playing Uploaded Audio: ${file.name}`;
        this.startVisualizationLoop();
      }, (err) => {
        alert('Error decoding audio file.');
      });
    };
    reader.readAsArrayBuffer(file);
  }

  playPreset(preset) {
    this.initAudioContext();
    this.stopAudio();

    const now = this.audioCtx.currentTime;

    if (preset === 'quadcopter') {
      // Quadcopter synth (350Hz fundamental + 700Hz + 1050Hz harmonics + mild noise)
      this.synthOsc1 = this.audioCtx.createOscillator();
      this.synthOsc2 = this.audioCtx.createOscillator();
      const noise = this.createNoiseBufferNode();

      this.synthOsc1.type = 'sawtooth';
      this.synthOsc1.frequency.setValueAtTime(346, now);

      this.synthOsc2.type = 'sine';
      this.synthOsc2.frequency.setValueAtTime(692, now);

      // Lowpass filter for rotor acoustic signature
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      this.synthOsc1.connect(filter);
      this.synthOsc2.connect(filter);
      noise.connect(filter);

      filter.connect(this.analyser);
      this.analyser.connect(this.gainNode);

      this.synthOsc1.start();
      this.synthOsc2.start();
      noise.start();
    } else if (preset === 'fpvdrone') {
      // High pitch FPV Drone synth (850Hz + 1700Hz screech)
      this.synthOsc1 = this.audioCtx.createOscillator();
      this.synthOsc2 = this.audioCtx.createOscillator();

      this.synthOsc1.type = 'sawtooth';
      this.synthOsc1.frequency.setValueAtTime(780, now);

      this.synthOsc2.type = 'square';
      this.synthOsc2.frequency.setValueAtTime(1560, now);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.value = 3;

      this.synthOsc1.connect(filter);
      this.synthOsc2.connect(filter);
      filter.connect(this.analyser);
      this.analyser.connect(this.gainNode);

      this.synthOsc1.start();
      this.synthOsc2.start();
    } else if (preset === 'helicopter') {
      // Low frequency helicopter rotor thud (24Hz + AM modulation)
      this.synthOsc1 = this.audioCtx.createOscillator();
      this.synthOsc1.type = 'sine';
      this.synthOsc1.frequency.setValueAtTime(24, now);

      const noise = this.createNoiseBufferNode();
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);

      this.synthOsc1.connect(filter);
      noise.connect(filter);
      filter.connect(this.analyser);
      this.analyser.connect(this.gainNode);

      this.synthOsc1.start();
      noise.start();
    } else if (preset === 'bird') {
      // Bird call chirp (sweep 2500Hz to 4000Hz)
      this.synthOsc1 = this.audioCtx.createOscillator();
      this.synthOsc1.type = 'sine';
      this.synthOsc1.frequency.setValueAtTime(2800, now);
      this.synthOsc1.frequency.exponentialRampToValueAtTime(4200, now + 0.3);

      const noise = this.createNoiseBufferNode();
      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.value = 0.1;
      noise.connect(noiseGain);

      this.synthOsc1.connect(this.analyser);
      noiseGain.connect(this.analyser);
      this.analyser.connect(this.gainNode);

      this.synthOsc1.start();
      noise.start();
    }

    this.isPlaying = true;
    this.updatePlayStateUI(true);
    this.startVisualizationLoop();
    this.updateProbabilities(preset);
  }

  createNoiseBufferNode() {
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    return whiteNoise;
  }

  stopAudio() {
    if (this.synthOsc1) { try { this.synthOsc1.stop(); } catch (e) {} this.synthOsc1 = null; }
    if (this.synthOsc2) { try { this.synthOsc2.stop(); } catch (e) {} this.synthOsc2 = null; }
    if (this.sourceNode) { try { this.sourceNode.stop(); } catch (e) {} this.sourceNode = null; }
    this.isPlaying = false;
    this.updatePlayStateUI(false);
  }

  updatePlayStateUI(playing) {
    const playBtn = document.getElementById('btn-play-audio');
    const playIcon = document.getElementById('play-icon');
    if (playBtn && playIcon) {
      if (playing) {
        playBtn.classList.remove('btn-success');
        playBtn.classList.add('btn-amber');
        playIcon.className = 'fa-solid fa-pause';
      } else {
        playBtn.classList.remove('btn-amber');
        playBtn.classList.add('btn-success');
        playIcon.className = 'fa-solid fa-play';
      }
    }
  }

  startVisualizationLoop() {
    if (!this.isPlaying || !this.analyser) return;

    this.drawWaveform();
    this.drawSpectrogram();
    this.drawMFCC();

    requestAnimationFrame(() => this.startVisualizationLoop());
  }

  drawWaveform() {
    if (!this.waveformCanvas) return;
    const ctx = this.waveformCanvas.getContext('2d');
    const width = this.waveformCanvas.width;
    const height = this.waveformCanvas.height;

    const timeData = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(timeData);

    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ff9d';
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    const sliceWidth = width / timeData.length;
    let x = 0;

    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  drawSpectrogram() {
    if (!this.spectrogramCanvas) return;
    const ctx = this.spectrogramCanvas.getContext('2d');
    const width = this.spectrogramCanvas.width;
    const height = this.spectrogramCanvas.height;

    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);

    // Push new column to spectrogram history
    this.spectroHistory.push(Array.from(freqData.slice(0, 128)));
    if (this.spectroHistory.length > this.spectroHistoryMax) {
      this.spectroHistory.shift();
    }

    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, 0, width, height);

    const colWidth = width / this.spectroHistoryMax;

    this.spectroHistory.forEach((column, colIdx) => {
      const x = colIdx * colWidth;
      const binHeight = height / column.length;

      column.forEach((val, binIdx) => {
        const y = height - (binIdx + 1) * binHeight;
        const normalized = val / 255;

        // Spectrogram Color Gradient (Dark Blue -> Cyan -> Yellow -> Red/White)
        let r, g, b;
        if (normalized < 0.25) {
          r = 5; g = Math.floor(normalized * 4 * 100); b = 120;
        } else if (normalized < 0.6) {
          r = 0; g = 243; b = Math.floor((0.6 - normalized) * 200);
        } else if (normalized < 0.85) {
          r = 255; g = 183; b = 0;
        } else {
          r = 255; g = 42; b = 95;
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, colWidth + 1, binHeight + 1);
      });
    });
  }

  drawMFCC() {
    if (!this.mfccCanvas) return;
    const ctx = this.mfccCanvas.getContext('2d');
    const width = this.mfccCanvas.width;
    const height = this.mfccCanvas.height;

    ctx.fillStyle = '#05080e';
    ctx.fillRect(0, 0, width, height);

    const bands = 20;
    const bandWidth = width / bands;

    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);

    for (let i = 0; i < bands; i++) {
      const val = freqData[i * 4] || 0;
      const norm = val / 255;
      const barHeight = norm * height;

      ctx.fillStyle = `hsl(${180 - norm * 180}, 100%, 50%)`;
      ctx.fillRect(i * bandWidth + 2, height - barHeight, bandWidth - 4, barHeight);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px Rajdhani';
      ctx.fillText(`C${i + 1}`, i * bandWidth + 4, height - 4);
    }
  }

  updateProbabilities(preset) {
    let drone = 96.4, heli = 2.8, bird = 0.5, bg = 0.3;
    let label = 'DRONE AUDIO DETECTED (HIGH CONFIDENCE)';
    let colorClass = 'text-red';

    if (preset === 'fpvdrone') {
      drone = 98.9; heli = 0.8; bird = 0.1; bg = 0.2;
      label = 'FPV RACING DRONE (CRITICAL THREAT)';
    } else if (preset === 'helicopter') {
      drone = 8.2; heli = 89.4; bird = 1.1; bg = 1.3;
      label = 'HELICOPTER CLASSIFIED (CIVILIAN ROTOR)';
      colorClass = 'text-amber';
    } else if (preset === 'bird') {
      drone = 1.4; heli = 2.1; bird = 92.6; bg = 3.9;
      label = 'NON-DRONE: BIRD & AMBIENT WIND';
      colorClass = 'text-emerald';
    }

    const pDrone = document.getElementById('prob-drone');
    const pBarDrone = document.getElementById('prob-bar-drone');
    const pHeli = document.getElementById('prob-helicopter');
    const pBarHeli = document.getElementById('prob-bar-helicopter');
    const pBird = document.getElementById('prob-bird');
    const pBarBird = document.getElementById('prob-bar-bird');
    const pBg = document.getElementById('prob-background');
    const pBarBg = document.getElementById('prob-bar-background');
    const decisionRes = document.getElementById('final-class-result');

    if (pDrone) pDrone.textContent = `${drone}%`;
    if (pBarDrone) pBarDrone.style.width = `${drone}%`;

    if (pHeli) pHeli.textContent = `${heli}%`;
    if (pBarHeli) pBarHeli.style.width = `${heli}%`;

    if (pBird) pBird.textContent = `${bird}%`;
    if (pBarBird) pBarBird.style.width = `${bird}%`;

    if (pBg) pBg.textContent = `${bg}%`;
    if (pBarBg) pBarBg.style.width = `${bg}%`;

    if (decisionRes) {
      decisionRes.textContent = label;
      decisionRes.className = `decision-result ${colorClass}`;
    }
  }
}
