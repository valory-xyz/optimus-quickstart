const { setupDarwin } = require("./install")

ipcChannel = {
    send: function (channel, message) {
        console.log(`${channel} -> ${message}`)
    }
}

setupDarwin(ipcChannel)