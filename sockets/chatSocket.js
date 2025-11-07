// sockets/chatSocket.js
export const chatSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join chat room
    socket.on("joinRoom", (chatRoomId) => {
      socket.join(chatRoomId);
    });

    // Send & broadcast message
    socket.on("sendMessage", (data) => {
      const { chatRoomId, message } = data;
      io.to(chatRoomId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
