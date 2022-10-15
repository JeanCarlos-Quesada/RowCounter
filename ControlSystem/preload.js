/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge } = require("electron");
const fs = require("fs");
const path = require("path");

var showRowTimer = null;

const getSettingsGlobal = async () => {
  let filePath = "";
  let settings = null;

  try {
    filePath = path.join(__dirname, "../settings.json");
    settings = JSON.parse(await fs.readFileSync(filePath));
  } catch (err) {
    filePath = path.join(__dirname, "settings.json");
    settings = JSON.parse(await fs.readFileSync(filePath));
  }

  return settings;
};

contextBridge.exposeInMainWorld("methods", {
  readFileBase64: async (filePath, joinPath) => {
    if (joinPath) {
      filePath = path.join(__dirname, filePath);
    }
    return await fs.readFileSync(filePath, { encoding: "base64" });
  },
  writeSettingsFile: async (data) => {
    let savePath = path.join(__dirname, "../settings.json");
    return await fs.writeFileSync(savePath, JSON.stringify(data));
  },
  getSettings: async () => {
    return await getSettingsGlobal();
  },
  spiker: async (data) => {
    const settings = await getSettingsGlobal();
    clearTimeout(showRowTimer);
    let video = document.getElementById("video");
    let speech = `${data.number} a caja ${data.cashier}`;

    const hiddenRowCounter = () => {
      document.getElementById("left").classList.remove("show-left");
      document.getElementById("right").classList.remove("hidden-right");
    };

    const showRowCounter = () => {
      video.pause();
      document.getElementById("left").classList.add("show-left");
      document.getElementById("right").classList.add("hidden-right");

      showRowTimer = setTimeout(() => {
        video.play();
        hiddenRowCounter();
      }, settings.rowTimer);
    };

    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis
      .getVoices()
      .filter((x) => x.lang.includes("es-"));

    msg.voice = voices[voices.length - 1]; // Note: some voices don't support altering params
    msg.voiceURI = "native";
    msg.volume = 1; // 0 to 1
    msg.rate = 1; // 0.1 to 10
    msg.pitch = 1; //0 to 2
    msg.text = speech;
    // msg.lang = voices[voices.length - 1].lang;

    showRowCounter();
    speechSynthesis.speak(msg);
  },
  getAllVideos: async (videosPath) => {
    return await fs.readdirSync(videosPath).filter((x) => x.includes(".mp4"));
  },
});

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
