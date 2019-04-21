import * as Helper from './chat_helper';

const STATUS_IS_ACTIVE = 1;
const STATUS_IS_INACTIVE = 0;

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
            results.push({ user: elem, status: STATUS_IS_ACTIVE });
        } else {
            results.push({ user: elem, status: STATUS_IS_INACTIVE });
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

export {
    chatAll,
    refreshFriendsList,
    refreshFriendStatus,
    STATUS_IS_ACTIVE,
    STATUS_IS_INACTIVE
};
