const express = require("express");
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const router = require("./routes/route");
const { disconnect } = require("node:process");
const {
    addUser,
    findUser,
    getRoomUsers,
    removeUser,
} = require("./utils/users");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors({ origin: "*" }));
app.use(router);

io.on("connection", (socket) => {
    socket.on("join", ({ name, room }) => {
        socket.join(room);

        const { user } = addUser({ name, room });

        socket.emit("message", {
            data: {
                user: { name: "Admin" },
                message: `You are connected to room #${room}`,
            },
        });
        socket.to(user.room).emit("message", {
            data: {
                user: { name: "Admin" },
                message: `${name} has joined`,
            },
        });
        io.to(user.room).emit("room", {
            data: { users: getRoomUsers(user.room) },
        });
    });

    socket.on("sendMessage", ({ message, searchQuery }) => {
        const user = findUser(searchQuery);
        if (user) {
            io.to(user.room).emit("message", { data: { user, message } });
        }
    });
    socket.on("leftRoom", ({ searchQuery }) => {
        const user = removeUser(searchQuery);
        if (user) {
            const { room, name } = user;
            io.to(room).emit("message", {
                data: { user: { name: "Admin" }, message: `${name} has left` },
            });
            io.to(room).emit("room", {
                data: { users: getRoomUsers(room) },
            });
        }
    });
    io.on(disconnect, (socket) => {
        console.log("disconnect");
    });
});

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});
