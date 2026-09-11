/* ==========================================================================
   AeroGuard AI - Main Application Entry Point
   ========================================================================== */

import { RadarEngine } from './components/radarCanvas.js';
import { AudioAnalyzerEngine } from './components/audioAnalyzer.js';
import { ThermalCameraSimulator } from './components/thermalFeed.js';
import { ModelMetricsEngine } from './components/metricsCharts.js';
import { DroneSynthesizerEngine } from './components/droneSynthesizer.js';
import { ThreatLogsEngine } from './components/threatLogs.js';

class AeroGuardApp {
  constructor() {
    this.audioMuted = false;
    this.initClock();
    this.initTabs();
    this.initAlertStream();
    this.initSubsystems();
    this.initMuteButton();
  }

  initClock() {
    const clockEl = document.getElementById('live-clock');
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toUTCString().split(' ')[4] + ' UTC';
      }
    };
    update();
    setInterval(update, 1000);
  }

  initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.dataset.tab;
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  }

  initSubsystems() {
    // 1. Radar Engine
    this.radar = new RadarEngine('radar-canvas', (target) => {
      this.updateSelectedTargetUI(target);
    });

    // 2. Audio Analyzer Engine
    this.audioAnalyzer = new AudioAnalyzerEngine();

    // 3. Thermal IR Feed Simulator
    this.thermalCamera = new ThermalCameraSimulator('camera-canvas');

    // 4. Model Benchmarks Engine
    this.metrics = new ModelMetricsEngine();

    // 5. Drone Synthesizer Engine
    this.synth = new DroneSynthesizerEngine();

    // 6. Threat Logs Engine
    this.logs = new ThreatLogsEngine();

    // Range selector buttons
    const rangeBtns = document.querySelectorAll('.range-btn');
    rangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        rangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.radar.setRange(parseInt(btn.dataset.range, 10));
      });
    });

    // Countermeasure Jammer button
    const jammerBtn = document.getElementById('btn-countermeasure');
    if (jammerBtn) {
      jammerBtn.addEventListener('click', () => {
        alert('COUNTERMEASURE ACTIVATED: RF Directional Jamming signal transmitted at 2.4GHz / 5.8GHz to force safe RTH / Emergency Landing.');
        this.addAlert('INCIDENT CRITICAL', 'RF Directional Jammer activated on UAV-104. Signal disrupted.', 'warning');
      });
    }

    // Lock Track button
    const trackBtn = document.getElementById('btn-track');
    if (trackBtn) {
      trackBtn.addEventListener('click', () => {
        this.addAlert('RECON LOCK', 'Optical tracking locked on target UAV-104 bearing 042°.', 'info');
      });
    }
  }

  updateSelectedTargetUI(t) {
    const idEl = document.getElementById('target-id');
    const classEl = document.getElementById('target-class');
    const distEl = document.getElementById('target-dist');
    const dbEl = document.getElementById('target-db');
    const rpmEl = document.getElementById('target-rpm');
    const freqEl = document.getElementById('target-freq');
    const threatPctEl = document.getElementById('target-threat-pct');
    const threatFillEl = document.getElementById('target-threat-fill');
    const lockedHud = document.getElementById('hud-locked-target');
    const camText = document.getElementById('cam-target-text');

    if (idEl) idEl.textContent = t.id;
    if (classEl) classEl.textContent = t.name;
    if (distEl) distEl.textContent = `${Math.round(t.dist)}m / ${t.alt}m`;
    if (dbEl) dbEl.textContent = `${t.db} dB`;
    if (rpmEl) rpmEl.textContent = `${t.rpm.toLocaleString()} RPM`;
    if (freqEl) freqEl.textContent = `${t.freq} Hz`;
    if (threatPctEl) threatPctEl.textContent = `${t.threatPct}%`;
    if (threatFillEl) threatFillEl.style.width = `${t.threatPct}%`;
    if (lockedHud) lockedHud.textContent = t.id;
    if (camText) camText.textContent = `${t.id} | DIST: ${Math.round(t.dist)}m | 64 FPS`;
  }

  initAlertStream() {
    this.alertList = document.getElementById('alert-stream-list');
    const clearBtn = document.getElementById('btn-clear-alerts');

    if (clearBtn && this.alertList) {
      clearBtn.addEventListener('click', () => {
        this.alertList.innerHTML = '';
      });
    }

    // Initial alert items
    this.addAlert('ACOUSTIC INTRUSION DETECTED', 'Quadrotor blade pass frequency detected at 361Hz in Sector Alpha-7', 'danger');
    this.addAlert('THERMAL TARGET LOCK', 'Target UAV-104 acquired on Thermal IR camera at 242m range', 'warning');
    this.addAlert('SYSTEM STATUS', 'Acoustic array sensors 1-4 synchronized. SNR +24.8dB', 'info');
  }

  addAlert(title, text, type = 'danger') {
    if (!this.alertList) return;

    const timeStr = new Date().toTimeString().split(' ')[0];
    const item = document.createElement('div');
    item.className = `alert-item ${type}`;

    let icon = 'fa-triangle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';
    if (type === 'warning') icon = 'fa-shield-cat';

    item.innerHTML = `
      <div class="alert-left">
        <i class="fa-solid ${icon}"></i>
        <div>
          <span class="alert-msg">${title}</span> - ${text}
        </div>
      </div>
      <span class="alert-time">${timeStr}</span>
    `;

    this.alertList.prepend(item);
  }

  initMuteButton() {
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = document.getElementById('mute-icon');

    if (muteBtn && muteIcon) {
      muteBtn.addEventListener('click', () => {
        this.audioMuted = !this.audioMuted;
        if (this.audioMuted) {
          muteIcon.className = 'fa-solid fa-volume-xmark';
          muteBtn.classList.remove('btn-outline-danger');
          muteBtn.classList.add('btn-dark');
        } else {
          muteIcon.className = 'fa-solid fa-volume-high';
          muteBtn.classList.remove('btn-dark');
          muteBtn.classList.add('btn-outline-danger');
        }
      });
    }
  }
}

// Start Application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AeroGuardApp();
});
