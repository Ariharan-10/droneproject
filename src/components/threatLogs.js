/* ==========================================================================
   Threat Logs & Operational Database Component
   ========================================================================== */

export class ThreatLogsEngine {
  constructor() {
    this.tbody = document.getElementById('threat-logs-tbody');
    this.searchInput = document.getElementById('log-search-input');
    this.exportCsvBtn = document.getElementById('btn-export-csv');
    this.exportJsonBtn = document.getElementById('btn-export-json');

    this.logs = [
      { id: 'INC-9041', time: '2026-09-11 12:45:10', sector: 'Alpha-7', class: 'Quadcopter (DJI Mavic)', db: 82.4, freq: 362.5, conf: '98.4%', optMatch: 'TRUE (Thermal IR)', status: 'RF Jammer Activated' },
      { id: 'INC-9040', time: '2026-09-11 12:30:22', sector: 'Alpha-7', class: 'FPV Racing Drone', db: 86.1, freq: 780.0, conf: '99.1%', optMatch: 'TRUE (RGB Visual)', status: 'Tracking Locked' },
      { id: 'INC-9039', time: '2026-09-11 11:58:04', sector: 'Beta-2', class: 'Helicopter (Civilian)', db: 94.0, freq: 24.0, conf: '89.4%', optMatch: 'FALSE (Aircraft)', status: 'Ignored (Civilian Flight)' },
      { id: 'INC-9038', time: '2026-09-11 11:15:45', sector: 'Gamma-9', class: 'Bird Flock (Non-Drone)', db: 64.2, freq: 2800.0, conf: '92.6%', optMatch: 'FALSE', status: 'Cleared (Natural)' },
      { id: 'INC-9037', time: '2026-09-11 10:42:19', sector: 'Alpha-7', class: 'Quadcopter (Autel EVO)', db: 79.5, freq: 340.0, conf: '97.2%', optMatch: 'TRUE (Thermal IR)', status: 'Target Escorted Away' },
      { id: 'INC-9036', time: '2026-09-11 09:20:00', sector: 'Delta-4', class: 'Micro Drone', db: 71.8, freq: 520.0, conf: '95.8%', optMatch: 'TRUE (RGB Visual)', status: 'Logged & Monitored' }
    ];

    this.render();
    this.initEvents();
  }

  initEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.render());
    }

    if (this.exportCsvBtn) {
      this.exportCsvBtn.addEventListener('click', () => this.exportCSV());
    }

    if (this.exportJsonBtn) {
      this.exportJsonBtn.addEventListener('click', () => this.exportJSON());
    }
  }

  render() {
    if (!this.tbody) return;

    const query = this.searchInput ? this.searchInput.value.toLowerCase() : '';
    const filtered = this.logs.filter(l => 
      l.id.toLowerCase().includes(query) ||
      l.class.toLowerCase().includes(query) ||
      l.sector.toLowerCase().includes(query) ||
      l.status.toLowerCase().includes(query)
    );

    this.tbody.innerHTML = filtered.map(item => `
      <tr>
        <td><span class="highlight-cyan">${item.id}</span></td>
        <td>${item.time}</td>
        <td>${item.sector}</td>
        <td><span class="${item.class.includes('Drone') || item.class.includes('Quadcopter') ? 'red' : 'emerald'}">${item.class}</span></td>
        <td><strong>${item.db} dB</strong></td>
        <td>${item.freq} Hz</td>
        <td><span class="badge badge-success">${item.conf}</span></td>
        <td>${item.optMatch}</td>
        <td><span class="badge ${item.status.includes('Jammer') ? 'badge-danger' : 'badge-cyan'}">${item.status}</span></td>
      </tr>
    `).join('');
  }

  exportCSV() {
    let csv = 'Incident ID,Timestamp,Sector,Threat Class,Max Sound dB,Freq Hz,AI Confidence,Optical Match,Status\n';
    this.logs.forEach(l => {
      csv += `"${l.id}","${l.time}","${l.sector}","${l.class}",${l.db},${l.freq},"${l.conf}","${l.optMatch}","${l.status}"\n`;
    });
    this.downloadFile('aeroguard_threat_logs.csv', 'text/csv', csv);
  }

  exportJSON() {
    const json = JSON.stringify(this.logs, null, 2);
    this.downloadFile('aeroguard_threat_logs.json', 'application/json', json);
  }

  downloadFile(filename, type, data) {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}
