import { Request, Response } from 'express';
import * as Http from '../../util/http';
import * as jwt from 'jsonwebtoken';
import { Md5 } from 'md5-typescript';
import User from '../../models/user';
import Room from '../../models/room';
import { validationResult } from 'express-validator/check';
import * as config from 'config';
import { Types } from 'mongoose';

const signup = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Http.BadRequestResponse(res, { errors: errors.array() });
    }
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: Md5.init(req.body.password)
    });
    user.save()
        .then((rs: any) => {
            if (!rs) {
                return Http.InternalServerResponse(res);
            }
            // create a token
            const token = jwt.sign(
                { id: user._id },
                config.get('jwt.secret_key'),
                {
                    expiresIn: config.get('jwt.expired')
                }
            );
            console.log(token);
            return Http.SuccessResponse(res, {
                token: token,
                user: {
                    username: user.username,
                    email: user.email,
                    avatar_url: config.get('default-user-avatar')
                }
            });
        })
        .catch((e: any) => {
            console.error(e);
            return Http.InternalServerResponse(res);
        });
};

const signin = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Http.BadRequestResponse(res, { errors: errors.array() });
    }
    User.findOne({
        $or: [
            { email: req.body.username_or_email },
            { username: req.body.username_or_email }
        ],
        password: Md5.init(req.body.password)
    })
        .then((user: any) => {
            if (!user) {
                return Http.UnauthorizedResponse(res);
            }
            // create a token
            const token = jwt.sign(
                { id: user._id },
                config.get('jwt.secret_key'),
                {
                    expiresIn: config.get('jwt.expired')
                }
            );
            console.log(token);
            return Http.SuccessResponse(res, {
                token: token,
                user: {
                    username: user.username,
                    email: user.email,
                    avatar_url: user.avatar_url
                        ? user.avatar_url
                        : config.get('default-user-avatar')
                }
            });
        })
        .catch((err: any) => {
            console.error(err);
            return Http.InternalServerResponse(res);
        });
};

const addFriend = async (req: Request, res: Response) => {
    const authUser: any = req.headers.auth_user;

    try {
        const friend = await User.findOne({ username: req.params.username });
        if (friend == undefined) {
            return Http.NotFoundResponse(res, {
                msg: 'The user no longer exists.'
            });
        }
        if (friend._id.toString() == authUser._id) {
            return Http.BadRequestResponse(res, {
                msg: "Can't add friend with your self."
            });
        }
        const isAuthFriend = await User.findOne({
            _id: authUser._id,
            user_friends: { $elemMatch: { _id: friend._id } }
        });
        if (isAuthFriend) {
            return Http.SuccessResponse(res, {
                msg: 'The user has been added earlier.'
            });
        }
        const isTargetFriend = await User.findOne({
            _id: friend._id,
            user_friends: { $elemMatch: { _id: authUser._id } }
        });
        if (!isTargetFriend) {
            await User.updateOne(
                { _id: Types.ObjectId(authUser._id) },
                {
                    $push: {
                        user_friends: {
                            _id: friend._id,
                            status: 0
                        }
                    }
                }
            );
            return Http.SuccessResponse(res, {
                msg: 'Suggested, please wait for approval.'
            });
        } else {
            await User.updateOne(
                { _id: Types.ObjectId(authUser._id) },
                {
                    $push: {
                        user_friends: {
                            _id: friend._id,
                            status: 1
                        }
                    }
                }
            );
            await User.updateOne(
                {
                    _id: Types.ObjectId(friend._id),
                    user_friends: {
                        $elemMatch: { _id: Types.ObjectId(authUser._id) }
                    }
                },
                {
                    $set: { 'user_friends.$.status': 1 }
                }
            );
            // create Room
            const room = new Room({
                name: authUser.username + ',' + friend.username,
                users: [Types.ObjectId(authUser._id), Types.ObjectId(friend._id)]
            });
            await room.save();
            return Http.SuccessResponse(res, { msg: 'Added Friend Success.' });
        }
    } catch (error) {
        console.error(error);
        return Http.InternalServerResponse(res);
    }
};

const getProfile = async (req: Request, res: Response) => {
    let authID = '';
    const authorizationHeader = req.headers['authorization'];
    if (authorizationHeader != undefined) {
        const tmps = authorizationHeader.split(/Bearer /);
        if (tmps.length > 1) {
            const token = tmps[1];
            try {
                const decoded = jwt.verify(token, 'secret');
                authID = decoded.id;
            } catch (err) {
                Http.UnauthorizedResponse(res, {
                    msg:
                        "Can't authenticate your account. Please, try sign in again."
                });
                console.log("Can't get auth user", err);
            }
        }
    }

    try {
        const user = await User.aggregate([
            {
                $match: { username: req.params.username }
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
        if (!user[0]) {
            return Http.NotFoundResponse(res);
        }
        const isFriend = user[0].user_friends.find(element => {
            return element._id == authID;
        });
        return Http.SuccessResponse(res, {
            user: user[0],
            isSelf: authID == user[0]._id ? true : false,
            isFriend: !isFriend ? false : true
        });
    } catch (error) {
        console.error(error);
        return Http.InternalServerResponse(res);
    }
};

export { signup, signin, getProfile, addFriend };
