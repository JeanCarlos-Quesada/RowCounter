/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
window.resizeTo(700, 470);

window.onload = async function () {
  const settings = await window.methods.getSettings();
  document.getElementById("CashierNumber").value = settings.cashier;
  document.getElementById("webSocketPort").value = settings.webSocketPort;
  document.getElementById("webSocketIP").value = settings.webSocketIP;
  document.getElementById("RowTimer").value =
    parseInt(settings.rowTimer) / 1000;
  document.getElementById("videoPathShow").value = settings.videoPath;
};

const saveSettings = async () => {
  let video = document.getElementById("videoPath").files;
  await window.methods.writeSettingsFile({
    cashier: document.getElementById("CashierNumber").value,
    webSocketPort: document.getElementById("webSocketPort").value,
    webSocketIP: document.getElementById("webSocketIP").value,
    videoPath:
      video.length != 0
        ? video[0].path
        : document.getElementById("videoPathShow").value,
    rowTimer: parseInt(document.getElementById("RowTimer").value) * 1000,
  });
  message("Configuraciones aplicadas correctamente", () => {
    window.location.reload();
  });
};

const sendNumber = async (reset) => {
  const settings = await window.methods.getSettings();

  let value = document.getElementById("RowNumber").value;
  if (value > 0 && value < 100) {
    sendMessage({ number: value, cashier: settings.cashier, reset });
  } else {
    message("Número fuera de rango");
  }
};

const validOnChange = (e) => {
  let value = e.value;
  if (value <= 0 || value >= 100) {
    e.value = 1;
  }
};

const resetNumber = () => {
  document.getElementById("RowNumber").value = 1;
  sendNumber(true);
};
