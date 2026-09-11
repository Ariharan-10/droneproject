# AeroGuard AI — Drone Acoustic & Visual Defense Grid 🛸🛰️

[![AI Model](https://img.shields.io/badge/Model-2D%20CNN%20%2B%20Residual%20Block-00f3ff.svg)](#ai-model--notebook)
[![Accuracy](https://img.shields.io/badge/Validation%20Accuracy-98.4%25-00ff9d.svg)](#ai-model--notebook)
[![License](https://img.shields.io/badge/License-MIT-ffb700.svg)](#license)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%7C%20HTML5%20Canvas%20%7C%20Web%20Audio-ff2a5f.svg)](#getting-started)

**AeroGuard AI** is a state-of-the-art, multi-modal counter-unmanned aerial vehicle (C-UAV) detection and airspace monitoring platform. The system leverages acoustic spectrographic pattern recognition, Mel-Frequency Cepstral Coefficients (MFCCs), 2D Convolutional Neural Networks (CNN), and Thermal IR optical reconnaissance to identify, classify, and track drone incursions in real time.

---

## 🌟 Key System Capabilities

### 1. 🎯 360° Airspace Radar & Tactical HUD
* **Interactive 2D Canvas Radar**: Real-time rotating radar sweep with multi-ring distance zones (500m, 1000m, 2000m), azimuth sector tracking, and active target locking.
* **Thermal IR & RGB Optical Feed**: Dual-camera simulator featuring heatmap thermal vision gradients, target bounding reticles, and velocity vector tracking.
* **Target Telemetry Inspector**: Instantaneous extraction of estimated motor RPM, fundamental blade pass frequency (BPF), sound pressure level ($dB$), distance, and altitude.
* **RF Jammer Countermeasure Trigger**: Simulated automated RF directional jamming countermeasure signal transmission.

### 2. 🎵 Real-Time Web Audio Spectrogram & Analyzer
* **Oscilloscope & Mel Spectrogram Density**: Dynamic 60 FPS time-domain waveform and 0-8000 Hz frequency spectrogram waterfall visualization.
* **20-Band MFCC Heatmap**: Real-time extraction of Mel-Frequency Cepstral Coefficients to isolate rotor blade pass harmonics from background noise.
* **Audio Presets & File Upload Playground**: Interactive audio playback for **DJI Quadcopters**, **FPV Racing Drones**, **Helicopters**, and **Bird/Wind Noise**, plus drag-and-drop audio file upload (`.wav`, `.mp3`).

### 3. 📊 AI Model Benchmarks & Metrics
* **Accuracy & Loss Curves**: Visualizes training vs. validation accuracy across 50 epochs ($98.4\%$ validation accuracy).
* **5x5 Confusion Matrix**: Performance breakdown across 5 audio classes (*Drone*, *Helicopter*, *Bird*, *Airplane*, *Ambient Background*).
* **Feature Importance Analysis**: Comparative breakdown of acoustic features (Rotor Pitch, Spectral Centroid, Harmonic 1, Zero Crossing Rate).

### 4. 🎛️ Acoustic Rotor Frequency Synthesizer
* **Parametric Sound Generator**: Adjust Motor RPM ($2,000$ to $12,000$ RPM), Blade Count ($2, 3, 4$ blades), Distance ($10$m to $500$m), and Wind Interference in real time.
* **AI Threat Evaluator Gauge**: Interactive gauge dial with animated pointer calculating live Blade Pass Frequency:
  $$\text{BPF} = \left(\frac{\text{RPM}}{60}\right) \times \text{Blade Count}$$

### 5. 🗄️ Airspace Incident Database & Export
* **Searchable Threat Log**: Comprehensive log of incident IDs, timestamps, sectors, sound levels, AI confidence scores, and actions taken.
* **Data Export**: One-click export to **CSV** and **JSON** formats.

---

## 🏗️ Project Architecture

```
droneproject/
├── drone.ipynb                       # Kaggle audio dataset downloader, MFCC extraction, & CNN training notebook
├── index.html                        # Main web app layout & HUD structure
├── package.json                      # Vite project config & scripts
├── src/
│   ├── main.js                       # App entry point, tab router, system clock & alert stream
│   ├── style.css                     # Dark Cyber / Aerospace HUD Glassmorphic CSS design system
│   └── components/
│       ├── radarCanvas.js            # 2D canvas radar sweep & target selector engine
│       ├── audioAnalyzer.js          # Web Audio API oscilloscope, Mel Spectrogram, MFCC heatmap & synth
│       ├── thermalFeed.js            # Thermal IR / RGB camera feed simulator
│       ├── metricsCharts.js          # Training curves, 5x5 confusion matrix & feature importance canvas
│       ├── droneSynthesizer.js       # RPM acoustic synthesizer & threat gauge dial
│       └── threatLogs.js             # Incident database renderer & CSV/JSON exporter
```

---

## 🛠️ AI Model & Notebook

The deep learning model in [`drone.ipynb`](file:///e:/droneproject/drone.ipynb) is trained on acoustic audio detection datasets (including Kaggle `amineipad/drone-sound-audio-detection` and `DroneDetectionThesis/Drone-detection-dataset`):

* **Audio Preprocessing**: Sample rate $22,050 \text{ Hz}$, $N_{\text{fft}} = 2048$, hop length $= 512$, $N_{\text{mels}} = 128$.
* **Feature Representation**: 40-band MFCCs with Delta and Delta-Delta dynamic features.
* **Architecture**: 2D Convolutional Neural Network (CNN) with Residual Blocks, Batch Normalization, and Dropout ($0.3$).
* **Metrics**: $98.4\%$ validation accuracy, $98.7\%$ precision, $98.1\%$ recall ($F_1\text{-score} = 0.984$).

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** (v9.0 or higher)

### Installation & Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ariharan-10/droneproject.git
   cd droneproject
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000/`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📜 License

This project is licensed under the **MIT License**.
