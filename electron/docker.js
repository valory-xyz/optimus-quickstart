const Docker = require("dockerode");
const docker = new Docker();

function isDockerRunning() {
  return new Promise((resolve, reject) => {
    docker.ping((err) => {
      if (err) {
        if (err.code === "ECONNREFUSED") {
          resolve(false); // Docker is not running
        } else {
          reject(err); // Error other than connection refused
        }
      } else {
        resolve(true); // Docker is running
      }
    });
  });
}

module.exports = { isDockerRunning };
