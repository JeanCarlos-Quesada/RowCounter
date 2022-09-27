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
