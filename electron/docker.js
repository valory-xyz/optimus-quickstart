const Docker = require("dockerode");

const connectionRefusedCode = "ECONNREFUSED";

const docker = new Docker(
  process.platform === "win32"
    ? { socketPath: "//./pipe/docker_engine" }
    : { socketPath: "/var/run/docker.sock" },
);

function isDockerRunning() {
  return new Promise((resolve, reject) => {
    docker.ping((err) => {
      if (err) {
        if (err.code === connectionRefusedCode) {
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
