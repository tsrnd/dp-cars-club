import { Response } from 'express';
export let InternalServerResponse = (
    res: Response,
    data: any = { msg: 'Internal Server Error' }
) => {
    res.status(500).end(JSON.stringify(data));
};

export let BadRequestResponse = (
    res: Response,
    data: any = { msg: 'Bad Request' }
) => {
    res.status(400).end(JSON.stringify(data));
};

export let UnauthorizedResponse = (
    res: Response,
    data: any = { msg: 'Unauthorized' }
) => {
    res.status(401).end(JSON.stringify(data));
};

export let ForbiddenResponse = (
    res: Response,
    data: any = { msg: 'Forbidden' }
) => {
    res.status(403).end(JSON.stringify(data));
};

export let SuccessResponse = (res: Response, data: any) => {
    res.status(200).end(JSON.stringify(data));
};

export let NotFoundResponse = (
    res: Response,
    data: any = { msg: 'Not Found' }
) => {
    res.status(400).end(JSON.stringify(data));
};
