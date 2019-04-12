import { Request, Response } from 'express';
import * as Http from '../../util/http';
// import S3Handle from '../../util/aws_s3';

const index = (req: Request, res: Response) => {
    // const params = {
    //     Bucket: 'test-bucket',
    //     Body: 'something',
    //     Key: 'folder/docker' + Date.now()
    // };

    // S3Handle.S3Client.putObject(params, (err, data) => {
    //     // handle error
    //     if (err) {
    //         console.log('Error', err);
    //     }
    //     // success
    //     if (data) {
    //         console.log('Uploaded');
    //     }
    // });
    return res.render('index');
};

export { index };
