/**
 * It opens a websocket connection to a server, and when it receives a message, it parses the message
 * and calls two functions.
 */
const initWS = async () => {
  const settings = await window.methods.getSettings();
  const wsUrl = `ws://${settings.webSocketIP}:${settings.webSocketPort}`;
  const socket = new WebSocket(wsUrl);

  socket.addEventListener("error", (event) => {
    message("Error de conexión al web socket");
    hiddenLoader();
  });

  // Connection opened
  socket.addEventListener("open", (event) => {
    console.log("Connection opened");
    window.wbSocket = socket;
    hiddenLoader();
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    window.socketData = JSON.parse(event.data);
    changeInputNumber();
    changeListNumber();
  });
};

if (window.wbSocket == null) {
  showLoader();
  initWS();
}

const sendMessage = (message) => {
  window.wbSocket.send(JSON.stringify(message));
};

const changeInputNumber = () => {
  try {
    document.getElementById("RowNumber").value = window.socketData.current.number;
  } catch (error) {}
};

const changeListNumber = async () => {
  try {
    let listContainer = document.getElementById("rowNumberList");
    if (listContainer != null) {
      if (!window.socketData.isFirst) {
        window.methods.spiker(window.socketData.current);
      }else{
        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis
          .getVoices()
          .filter((x) => x.lang.includes("es-"));
    
        msg.voice = voices[voices.length - 1]; // Note: some voices don't support altering params
        msg.voiceURI = "native";
        msg.volume = 0; // 0 to 1
        msg.rate = 1; // 0.1 to 10
        msg.pitch = 1; //0 to 2
        msg.text = 'primera conexión';

        speechSynthesis.speak(msg);
      }
      
      let list = window.socketData.lastNumbers;

      document.getElementById("row-number-alone").innerText =
        window.socketData.current.number;
      document.getElementById(
        "cashier-number"
      ).innerText = `Caja ${window.socketData.current.cashier}`;

      setTimeout(() => {
        listContainer.innerHTML = "";

        list.forEach((element) => {
          let div = document.createElement("div");

          let number = document.createElement("h1");
          number.innerText = element.number;

          let cashier = document.createElement("h3");
          cashier.innerText = `Caja ${element.cashier}`;

          div.appendChild(number);
          div.appendChild(cashier);

          listContainer.appendChild(div);
        });
      }, 1500);
    }
  } catch (error) {}
};
