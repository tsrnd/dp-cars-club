import { validate, POST_SIGN_UP, POST_SIGN_IN } from './../util/validate';
import * as express from 'express';
import * as exampleController from '../http/controllers/example';
import * as userController from '../http/controllers/user';

const router = express.Router();

router.use((req: express.Request, res: express.Response, next: () => void) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// routes here
router.get('/example', exampleController.index);
router.get('/signup', validate(POST_SIGN_UP), userController.signup);
router.get('/signin', validate(POST_SIGN_IN), userController.signin);

export default router;
