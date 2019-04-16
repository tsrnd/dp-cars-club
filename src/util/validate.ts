import { check, body } from 'express-validator/check';
import User from '../models/user';

export const validate = (type: String) => {
    switch (type) {
        case POST_SIGN_UP:
            return [
                body('username').custom(d => {
                    if (d == undefined) {
                        return Promise.reject('Username is required.');
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
                body('password_confirm').custom((d, { req }) => {
                    if (d !== req.body.password) {
                        throw new Error(
                            'Password confirmation does not match password'
                        );
                    }
                    return true;
                }),
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
        case POST_SIGN_IN:
            return [
                check('password')
                    .isLength({ min: 8 })
                    .withMessage('Password must be least 8 chars long.'),
                check('username_or_email').custom(d => {
                    if (!d) {
                        throw new Error('Username or Email is required.');
                    }
                    return true;
                })
            ];
        default:
            break;
    }
};

export const POST_SIGN_UP = 'POST_SIGN_UP';
export const POST_SIGN_IN = 'POST_SIGN_IN';
