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
const gTTS = require("gtts");

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
  readFileBase64: async (path) => {
    return await fs.readFileSync(path, { encoding: "base64" });
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
    let filePath = path.join(
      __dirname,
      `../voice_${data.number}_a_caja_${data.cashier}.mp3`
    );
    let gtts = new gTTS(speech, "es");

    const hiddenRowCounter = () => {
      document.getElementById("left").classList.remove("show-left");
      document.getElementById("right").classList.remove("hidden-right");
    };

    const showRowCounter = () => {
      video.pause();
      document.getElementById("left").classList.add("show-left");
      document.getElementById("right").classList.add("hidden-right");
      setTimeout(() => {
        let audio = new Audio(filePath);
        audio.play().then(() => {
          fs.unlinkSync(
            path.join(
              __dirname,
              `../voice_${data.number}_a_caja_${data.cashier}.mp3`
            ),
            () => {}
          );
        });
      }, 500);

      showRowTimer = setTimeout(() => {
        video.play();
        hiddenRowCounter();
      }, settings.rowTimer);
    };

    gtts.save(filePath, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      showRowCounter();
    });
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
