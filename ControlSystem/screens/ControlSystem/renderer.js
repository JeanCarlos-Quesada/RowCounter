/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
window.resizeTo(700, 250);

const nexNumber = async (reset) => {
  const settings = await window.methods.getSettings();

  let value = parseInt(document.getElementById("RowNumber").value);
  if (!reset) {
    value += 1;

    value = value >= 100 || value <= 0 ? 1 : value;
  }

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
  nexNumber(true);
};
