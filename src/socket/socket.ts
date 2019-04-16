import * as SocketIO from 'socket.io';
import * as SocketJWT from 'socketio-jwt';
import * as chat from '../http/controllers/chat';

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

        io.on('connection',
            SocketJWT.authorize({
                secret: 'secret',
                required: false
            })
        ).on('authenticated', async function (socket: any) {
            const auth = await chat.getAuth(socket.decoded_token.id);

            socket.on('chatAll', function (data: any) {
                data.auth = auth;
                chat.chatAll(socket, data);
            });
        });
    }

    public getServer() {
        return this.server;
    }
}

export default Socket;
