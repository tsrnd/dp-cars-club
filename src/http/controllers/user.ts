import { Request, Response } from 'express';
import * as Http from '../../util/http';
import * as jwt from 'jsonwebtoken';
import { Md5 } from 'md5-typescript';
import User from '../../models/user';
import { validationResult } from 'express-validator/check';
import * as config from 'config';

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

const getProfile = (req: Request, res: Response) => {
    res.render('');
};

export { signup, signin, getProfile };
