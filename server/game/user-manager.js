/**
 * UserManager - Manages online users
 * Tracks connected users and broadcasts updates
 */
export class UserManager {
  constructor(io) {
    this.io = io;
    this.onlineUsers = new Map(); // socketId -> playerName
  }

  /**
   * Adds a user to the online list
   * @param {string} socketId 
   * @param {string} playerName 
   */
  addUser(socketId, playerName) {
    this.onlineUsers.set(socketId, playerName);
    this.broadcastOnlineUsers();
  }

  /**
   * Removes a user from the online list
   * @param {string} socketId 
   */
  removeUser(socketId) {
    this.onlineUsers.delete(socketId);
    this.broadcastOnlineUsers();
  }

  /**
   * Gets list of all online users
   * @returns {Array<string>}
   */
  getOnlineUsers() {
    return Array.from(this.onlineUsers.values());
  }

  /**
   * Broadcasts online users to all connected clients
   */
  broadcastOnlineUsers() {
    const users = this.getOnlineUsers();
    this.io.emit("online_users_updated", { users });
  }
}
