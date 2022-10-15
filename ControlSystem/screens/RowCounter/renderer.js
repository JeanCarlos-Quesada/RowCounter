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
  setLogo();
  let i = 0;
  let isFirst = true;

  const nextVideo = async () => {
    const settings = await window.methods.getSettings();

    if (settings.videoPath) {
      const videos = await window.methods.getAllVideos(settings.videoPath);

      window.methods
        .readFileBase64(`${settings.videoPath}\\${videos[i]}`)
        .then((data) => {
          let video = document.getElementById("video");
          video.addEventListener("ended", nextVideo, false);
          if (videos.length != 1 || isFirst) {
            video.src = `data:video/mp4;base64,${data}`;
            isFirst = false;
            i += 1;
            if (i == videos.length) {
              i = 0;
            }
          } else {
            video.currentTime = 0;
          }

          hiddenLoader();
          video.play();
        })
        .catch((error) => {
          message("No se logró cargar el video");
          hiddenLoader();
        });
    } else {
      message("No hay videos configurados");
      hiddenLoader();
    }
  };

  nextVideo();
};
