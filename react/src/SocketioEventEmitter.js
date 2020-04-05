class SocketioEventEmitter {
  constructor(io) {
    this.io = io
    this.playerSockets = new Map()
  }
  addPlayerToRoom = (socket, room, player) => {
    this.playerSockets.set(player, socket)
    socket.join(room, err => err ? console.error(err) : null)
  }
  toPlayer = (player, event, data) =>
    this.playerSockets.get(player).emit(event, data)
  toRoom = (room, event, data) =>
    this.io.to(room).emit(event, data)
}

module.exports = {SocketioEventEmitter}