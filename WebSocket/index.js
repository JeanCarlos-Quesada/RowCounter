const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Use Default Port (Y/N): ", (useDefault) => {
  if (useDefault.toUpperCase() == "Y") {
    initWebSocket(null);
    rl.close();
  } else {
    rl.question("Port Number: ", (port) => {
      initWebSocket(port);
      rl.close();
    });
  }
});

const initWebSocket = (port) => {
  //WebSocketImport
  const webSocketsServerPort = port ?? 8000;
  const webSocketServer = require("websocket").server;
  const http = require("http");

  //os
  var os = require("os");

  var networkInterfaces = os.networkInterfaces();

  // init web socket server
  const server = http.createServer();
  server.listen(webSocketsServerPort);
  const wsServer = new webSocketServer({
    httpServer: server,
  });

  // clients list
  const clients = {};
  let lastNumbers = [];

  /**
   * It takes a value and adds it to the beginning of the array.
   * @param value - The value to add to the list.
   */
  const addToList = (value) => {
    for (let i = lastNumbers.length; i > 0; i--) {
      lastNumbers[i] = lastNumbers[i - 1];
    }

    lastNumbers[0] = value;

    for (let i = 3; i < lastNumbers.length; i++) {
      lastNumbers.splice(i, 1);
    }
  };

  /**
   * It generates a random number between 1 and 65535, converts it to a string in base 16, and then
   * returns the first four characters of that string.
   * @returns A function that returns a string.
   */
  const getUniqueID = () => {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return s4() + s4() + "-" + s4();
  };

  /* Creating a websocket server. */
  wsServer.on("request", (request) => {
    var userID = getUniqueID();
    const connection = request.accept(null, request.origin);
    clients[userID] = connection;

    /* Sending the data to the client. */
    connection.on("message", (object) => {
      let data = JSON.parse(object.utf8Data);
      if (data.reset) {
        lastNumbers = [];
      }

      addToList(data);

      let response = {
        current: data,
        lastNumbers,
      };

      for (key in clients) {
        clients[key].sendUTF(JSON.stringify(response));
      }
    });
  });

  const firstNetwork = Object.keys(networkInterfaces)[0];
  console.log(
    `Web Socket running in ${networkInterfaces[firstNetwork][1].address}:${webSocketsServerPort}`
  );
};
