const { trimStr } = require("./trimStr");

let users = [];

const addUser = (user) => {
    const isExist = findUser(user);

    !isExist && users.push(user);

    const currentUser = isExist || user;

    return { isExist: !!isExist, user: currentUser };
};

const findUser = (user) => {
    const userName = trimStr(user.name);
    const userRoom = trimStr(user.room);

    return users.find(
        (u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom
    );
};

const removeUser = (user) => {
    const found = findUser(user);

    if (found) {
        users = users.filter(
            (u) =>
                (u.room === found.room && u.name !== found.name) ||
                u.room !== found.room
        );
    }

    return found;
};

const getRoomUsers = (room) => users.filter((u) => u.room === room);

module.exports = { addUser, findUser, getRoomUsers, removeUser };
