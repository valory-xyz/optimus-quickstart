
const { setupDarwin, setupUbuntu } = require("./install")

ipcChannel = {
    send: function (channel, message) {
        console.log(`${channel} -> ${message}`)
    }
}

if (process.platform == "darwin") {
    setupDarwin(ipcChannel)
} else if (process.platform == "linux") {
    setupUbuntu(ipcChannel)
} else {
    throw new Error(`Unknown platform ${process.platform}`)
}