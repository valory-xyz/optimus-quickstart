const net = require("net");

const portRange = { startPort: 39152, endPort: 65535 }; //only source dynamic and private ports https://www.arubanetworks.com/techdocs/AOS-S/16.10/MRG/YC/content/common%20files/tcp-por-num-ran.htm 

const isPortAvailable = async (port) => {
  return new global.Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        reject(err);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port, "localhost");
  });
};

const findAvailablePort = async (startPort, endPort) => {
  return new global.Promise((resolve, reject) => {
    const server = net.createServer();

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        if (startPort < endPort) {
          findAvailablePort(startPort + 1, endPort)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error("No available ports in the specified range"));
        }
      } else {
        reject(err);
      }
    });

    server.on("listening", () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });

    server.listen(startPort, "localhost");
  });
};

module.exports = { isPortAvailable, portRange, findAvailablePort };
