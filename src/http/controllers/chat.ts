import User from '../../models/user';

const chatAll = (endPoint: any, socket: any, data: any) => {
    User.findById(data.authID, (error: any, auth: any) => {
        if (error) {
            console.log(error);
        }
        socket.emit('chatAll', data, auth, true)
        socket.broadcast.emit('chatAll', data, auth, false);
    });
};

export { chatAll };
