import { Types } from 'mongoose';
import User from '../../models/user';
import * as promise from 'bluebird';
import * as config from 'config';
import Room from '../../models/room';
import Message from '../../models/message';
import * as prConst from './const';

const userModel = promise.promisifyAll(User);
const roomModel = promise.promisifyAll(Room);

const getAuth = async (id: string) => {
    try {
        const d = await userModel
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
const getFriendsList = async (id: string) => {
    try {
        const d = await userModel.aggregate([
            {
                $match: { _id: Types.ObjectId(id) }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    avatar_url: 1,
                    user_friends: {
                        $filter: {
                            input: '$user_friends',
                            as: 'user_friend',
                            cond: {
                                $eq: ['$$user_friend.status', 1]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_friends._id',
                    foreignField: '_id',
                    as: 'user_friends'
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    avatar_url: {
                        $ifNull: [
                            '$avatar_url',
                            config.get('default-user-avatar')
                        ]
                    },
                    'user_friends._id': 1,
                    'user_friends.username': 1,
                    'user_friends.email': 1,
                    'user_friends.avatar_url': {
                        $ifNull: [
                            '$avatar_url',
                            config.get('default-user-avatar')
                        ]
                    }
                }
            }
        ]);
        const data = await getRoomsForFriendsList(d[0]);
        return data.user_friends;
    } catch (error) {
        console.error(error);
    }
};

const getRoomsForFriendsList = async (data: any) => {
    try {
        for (const index of data.user_friends.keys()) {
            const room = await roomModel.findOne({
                $or: [
                    {
                        name:
                            data.username +
                            ',' +
                            data.user_friends[index].username
                    },
                    {
                        name:
                            data.user_friends[index].username +
                            ',' +
                            data.username
                    }
                ]
            });
            if (room) {
                data.user_friends[index].room_id = room._id;
            }
        }
        return data;
    } catch (error) {
        console.error(error);
    }
};

const getRoomsOfUserById = async (id: any) => {
    try {
        const rooms = await Room.find({
            users: Types.ObjectId(id)
        });
        return rooms;
    } catch (error) {
        console.log(error);
    }
};

const saveMessage = async data => {
    try {
        const msg = new Message({
            room_id: data.message.room_id,
            message: data.message.message,
            user: {
                _id: data.user._id,
                username: data.user.username,
                avatar_url: data.user.avatar_url
            },
            status: prConst.MSG_NOT_YET_SEEN
        });
        await msg.save();
    } catch (error) {
        console.error(error);
    }
};

const getMessages = async data => {
    try {
        const room = await Room.findOne({
            _id: data.room_id,
            users: data.user._id
        });
        if (!room) {
            throw new Error('User is not member of room ' + data.room_id);
        }

        const messages = await Message.find({
            room_id: Types.ObjectId(data.room_id)
        })
            .sort({ created_at: -1 })
            .limit(20);
        // await Message.updateOne(
        //     {
        //         room_id: Types.ObjectId(data.room_id)
        //     },
        //     {
        //         $set: { status: prConst.MSG_SEEN }
        //     }
        // );
        console.log(messages);
        return messages;
    } catch (error) {
        // We will handle later.
        console.log(error);
    }
};

export {
    getAuth,
    getFriendsList,
    getRoomsOfUserById,
    saveMessage,
    getMessages
};
