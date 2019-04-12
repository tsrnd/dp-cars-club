import { check, body } from 'express-validator/check';
import User from '../models/user';

export const validate = (type: String) => {
    switch (type) {
        case POST_SIGN_UP:
            return [
                body('username').custom(d => {
                    if (d == undefined) {
                        return Promise.reject('Username is require.');
                    }
                    if (!d.match(/^[a-zA-Z0-9]+$/)) {
                        return Promise.reject('Invalid username.');
                    }
                    return User.findOne({ username: d }).then((user: any) => {
                        if (user) {
                            return Promise.reject('Username already in use.');
                        }
                    });
                }),
                check('password')
                    .isLength({ min: 8 })
                    .withMessage('Password must be least 8 chars long.'),
                check('password_confirm')
                    .isLength({ min: 8 })
                    .withMessage('Password confirm wrong.'),
                check('email')
                    .isEmail()
                    .withMessage('Invalid email address format.'),
                body('email').custom(e => {
                    return User.findOne({ email: e }).then((user: any) => {
                        if (user) {
                            return Promise.reject('E-mail already in use.');
                        }
                    });
                })
            ];
        case POST_LOGIN:
            return [
                check('email').isEmail(),
                check('password').isLength({ min: 8 })
            ];
        default:
            break;
    }
};

export const POST_SIGN_UP = 'POST_SIGN_UP';
export const POST_LOGIN = 'POST_LOGIN';
