import * as SocketIO from 'socket.io';
import * as SocketJWT from 'socketio-jwt';
import * as chatCtrl from '../http/controllers/chat';
import * as chatHelper from '../http/controllers/chat_helper';
import * as config from 'config';

class Socket {
    private server: any;
    private io: any;

    constructor(server: any) {
        this.server = server;
        this.io = SocketIO(this.server);
        this.config();
    }

    private config() {
        const io = this.io;
        const clients = [];

        io.on(
            'connection',
            SocketJWT.authorize({
                secret: config.get('jwt.secret_key'),
                required: false
            })
        ).on('authenticated', async function(socket: any) {
            const auth = await chatHelper.getAuth(socket.decoded_token.id);

            socket.on('chatAll', function(data: any) {
                data.auth = auth;
                chatCtrl.chatAll(socket, data);
            });
            socket.user = auth;
            clients.push(socket);
            console.log('push', socket.user.username, ' ', socket.id);
            // emit refresh friends list

            clients.forEach((e, index) => {
                console.log(e.user.username, index);
            });
            chatCtrl.refreshFriendStatus(
                socket,
                chatCtrl.STATUS_IS_ACTIVE,
                clients
            );
            chatCtrl.refreshFriendsList(socket, clients);
            // on disconnect
            socket.on('disconnect', () => {
                const index = clients.findIndex(elem => {
                    return elem.id == socket.id;
                });
                if (index != -1) {
                    clients.splice(index, 1);
                }
                chatCtrl.refreshFriendStatus(
                    socket,
                    chatCtrl.STATUS_IS_INACTIVE,
                    clients
                );
            });
            socket.on;
        });
    }

    public getServer() {
        return this.server;
    }
}

export default Socket;
