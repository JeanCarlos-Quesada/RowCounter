const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Ficha Inicial (Optional): ", (row) => {
  rl.question("Cajero Inicial (Optional): ", (cashier) => {
    rl.question("Use Default Port (Y/N): ", (useDefault) => {
      if (useDefault.toUpperCase() == "Y") {
        initWebSocket(null, row, cashier);
        rl.close();
      } else {
        rl.question("Port Number: ", (port) => {
          initWebSocket(port, row, cashier);
          rl.close();
        });
      }
    });
  });
});

const initWebSocket = (port, row, cashier) => {
  //WebSocketImport
  const webSocketsServerPort = port ?? 8000;
  const webSocketServer = require("websocket").server;
  const http = require("http");

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

  if (row || cashier) {
    addToList({ number: row, cashier: cashier, reset: false });
  }

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
      let response;

      if (data.reset) {
        lastNumbers = [];

        response = {
          current: { number: 0, cashier: null },
          lastNumbers,
          isFirst: true,
        };
      } else {
        addToList(data);

        response = {
          current: data,
          lastNumbers,
          isFirst: false,
        };
      }

      for (key in clients) {
        clients[key].sendUTF(JSON.stringify(response));
      }
    });

    setTimeout(() => {
      let response;
      let tmp = lastNumbers[0];

      if (tmp) {
        response = {
          current: tmp,
          lastNumbers,
          isFirst: true,
        };
      } else {
        response = {
          current: { number: 0, cashier: null },
          lastNumbers,
          isFirst: true,
        };
      }

      connection.sendUTF(JSON.stringify(response));
    }, 500);
  });

  console.log(`Web Socket running`);
};
