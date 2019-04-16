import { validate, POST_SIGN_UP, POST_SIGN_IN } from './../util/validate';
import * as express from 'express';
import * as exampleController from '../http/controllers/example';
import * as userController from '../http/controllers/user';
import * as middleware from '../http/middleware/auth';

const router = express.Router();

router.use((req: express.Request, res: express.Response, next: () => void) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// routes here
router.get('/example', middleware.auth, exampleController.index);
router.post('/signup', validate(POST_SIGN_UP), userController.signup);
router.post('/signin', validate(POST_SIGN_IN), userController.signin);

export default router;
