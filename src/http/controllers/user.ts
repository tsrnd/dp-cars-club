import { Request, Response } from 'express';
import * as Http from '../../util/http';
import * as jwt from 'jsonwebtoken';
import { Md5 } from 'md5-typescript';
import User from '../../models/user';
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

const addFriend = (req: Request, res: Response) => {
    const authUser: any = req.headers.auth_user;
    User.findOne({ username: req.params.username })
        .then(result => {
            if (result == undefined) {
                return Http.NotFoundResponse(res, { msg: 'User not found' });
            }
            if (result._id.toString() == authUser._id) {
                return Http.BadRequestResponse(res);
            }

            User.findOne({
                _id: authUser._id,
                user_friends: { $elemMatch: { _id: result._id } }
            })
                .then(data => {
                    console.log(authUser._id);
                    console.log(data);
                    if (data) {
                        return Http.SuccessResponse(res, { msg: 'Success' });
                    }
                    // if other also want to add friend with user
                    User.findOne({
                        _id: req.params.id,
                        user_friends: { $elemMatch: { _id: authUser._id } }
                    }).then(data => {
                        console.log('phat------' + data);
                        if (data == undefined) {
                            // if other haven't add friend with user yet
                            User.updateOne(
                                { _id: Types.ObjectId(authUser._id) },
                                {
                                    $push: {
                                        user_friends: {
                                            _id: result._id,
                                            status: 0
                                        }
                                    }
                                }
                            )
                                .then(rs => {
                                    return Http.SuccessResponse(res, {
                                        msg: 'Success'
                                    });
                                })
                                .catch(e => {
                                    console.error(e);
                                });
                        } else {
                            console.log('She/He also want to add friend you');
                            User.updateOne(
                                { _id: Types.ObjectId(authUser._id) },
                                {
                                    $push: {
                                        user_friends: {
                                            _id: result._id,
                                            status: 1
                                        }
                                    }
                                }
                            )
                                .then(rs => {
                                    return Http.SuccessResponse(res, {
                                        msg: 'Success'
                                    });
                                })
                                .catch(e => {
                                    console.error(e);
                                });

                            User.updateOne(
                                { _id: Types.ObjectId(result._id) },
                                {
                                    $push: {
                                        user_friends: {
                                            _id: authUser._id,
                                            status: 1
                                        }
                                    }
                                },
                                { upsert: true }
                            )
                                .then(rs => {
                                    return Http.SuccessResponse(res, {
                                        msg: 'Success'
                                    });
                                })
                                .catch(e => {
                                    console.error(e);
                                });
                        }
                    });
                })
                .catch(e => {
                    console.error(e);
                    return Http.InternalServerResponse(res);
                });
        })
        .catch(e => {
            console.error(e);
            return Http.InternalServerResponse(res);
        });
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
