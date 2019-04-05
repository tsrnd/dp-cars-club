import { Request, Response } from 'express';

const index = (req: Request, res: Response) => {
    return res.render('index', { title: 'Welcome to cars club.' });
};

export { index };
