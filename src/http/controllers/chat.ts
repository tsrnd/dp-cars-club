import User from '../../models/user';
import * as promise from 'bluebird';

const userController = promise.promisifyAll(User);

const chatAll = (socket: any, data: any) => {
    socket.emit('chatAll', data, true);
    socket.broadcast.emit('chatAll', data, false);
};

const getAuth = async (id: string) => {
    try {
        return await userController.findById(id);
    } catch (error) {
        console.log(error);
    }
};

export {
    chatAll,
    getAuth
};
