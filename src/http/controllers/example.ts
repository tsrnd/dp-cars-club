import { Request, Response } from 'express';
import * as Http from '../../util/http';

const index = (req: Request, res: Response) => {
    res.render('index');
};

export { index };
