import * as Helper from './chat_helper';
import * as prConst from './const';

const chatAll = (socket: any, data: any) => {
    socket.emit('chatAll', data, true);
    socket.broadcast.emit('chatAll', data, false);
};

const refreshFriendsList = async (socket: any, clients: any) => {
    const friends = await Helper.getFriendsList(socket.user._id);
    const results = [];
    friends.forEach(elem => {
        if (
            clients.findIndex((client: any) => {
                return client.user._id == elem._id.toString();
            }) != -1
        ) {
            results.push({ user: elem, status: prConst.STATUS_IS_ACTIVE });
        } else {
            results.push({ user: elem, status: prConst.STATUS_IS_INACTIVE });
        }
    });
    socket.emit('refresh-friend-list', results);
};

const refreshFriendStatus = async (
    socket: any,
    status: number,
    clients: any
) => {
    const friends = await Helper.getFriendsList(socket.user._id);
    friends.forEach(elem => {
        const client = clients.find((client: any) => {
            return client.user._id == elem._id.toString();
        });
        // console.log(client);
        if (client) {
            client.emit('refresh-friend-status', {
                user: socket.user,
                status: status
            });
        }
    });
};

const joinRoomAfterSignin = async (socket: any) => {
    const rooms = await Helper.getRoomsOfUserById(socket.user._id);
    rooms.forEach(room => {
        console.log(`====> ${socket.user.username} >>> ${room._id}`);
        socket.join(room._id);
    });
};

const onSendMessage = (socket: any) => {
    socket.on('clientSendMessage', async data => {
        const saved = await Helper.saveMessage({
            message: data,
            user: socket.user
        });
        socket.broadcast.to(data.room_id).emit('serverMessage', {
            room_id: data.room_id,
            from_user: socket.user,
            message: {
                _id: saved._id,
                content: data.message,
                status: prConst.MSG_NOT_YET_SEEN
            }
        });
    });
};

const onClientLoadMessage = (socket: any) => {
    socket.on('loadMessage', async room_id => {
        const msgs = await Helper.getMessages({
            room_id: room_id,
            user: socket.user
        });
        socket.emit('loadMessage', { auth_user: socket.user, msg: msgs });
    });
};

export {
    chatAll,
    refreshFriendsList,
    refreshFriendStatus,
    joinRoomAfterSignin,
    onSendMessage,
    onClientLoadMessage
};
