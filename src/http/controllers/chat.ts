import User from '../../models/user';
import * as promise from 'bluebird';
import * as config from 'config';

const userController = promise.promisifyAll(User);

const chatAll = (socket: any, data: any) => {
    socket.emit('chatAll', data, true);
    socket.broadcast.emit('chatAll', data, false);
};

const getAuth = async (id: string) => {
    try {
        const d = await userController
            .findById(id)
            .select({ _id: 1, username: 1, email: 1, avatar_url: 1 });
        if (!d) {
            throw new Error('Not found.');
        }
        if (!d.avatar_url) {
            d.avatar_url = config.get('default-user-avatar');
        }
        return d;
    } catch (error) {
        console.error(error);
    }
};

export { chatAll, getAuth };
