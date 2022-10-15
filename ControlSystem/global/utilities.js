const showLoader = () => {
  document.getElementById("loader").style.display = "grid";
};

const hiddenLoader = () => {
  document.getElementById("loader").style.display = "none";
};

const message = (message, callback) => {
  document.getElementById("message-container").style.display = "grid";
  document.getElementById("message").innerText = message;

  document.getElementById("message-button").onclick = () => {
    hiddenMessage();
    callback();
  };
};

const hiddenMessage = () => {
  document.getElementById("message-container").style.display = "none";
  document.getElementById("message").innerText = "";
};

const setLogo = async () => {
  const settings = await window.methods.getSettings();
  let fileType = settings.logo.logoPath.match(/.[0-9A-z]+$/)[0];
  let dataType;

  switch (fileType) {
    case ".png":
      dataType = "data:image/png;base64,";
      break;
    case ".svg":
      dataType = "data:image/svg+xml;base64,";
      break;
    default:
      dataType = "data:image/jpeg;base64,";
      break;
  }

  window.methods
    .readFileBase64(settings.logo.logoPath, settings.logo.join)
    .then((data) => {
      let logos = document.getElementsByClassName("Logo");
      let logo;

      if (".svg") {
        logo = document.createElement("object");
        logo.setAttribute("data", `${dataType}${data}`);
      } else {
        logo = document.createElement("img");
        logo.setAttribute("src", `${dataType}${data}`);
      }

      for (let i = 0; i < logos.length; i++) {
        logos[i].innerHTML = "";
        logos[i].appendChild(logo);
      }
    })
    .catch((error) => {
      message("No se logró cargar el logo");
      hiddenLoader();
    });
};
