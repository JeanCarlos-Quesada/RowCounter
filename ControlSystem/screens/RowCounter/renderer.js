/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
window.resizeTo(1200, 900);

window.onload = async function () {
  showLoader();
  const settings = await window.methods.getSettings();
  window.methods
    .readFileBase64(settings.videoPath)
    .then((data) => {
      document.getElementById("video").src = `data:video/mp4;base64,${data}`;
      hiddenLoader();
    })
    .catch(() => {
      message("No se logró cargar el video");
      hiddenLoader();
    });
};

