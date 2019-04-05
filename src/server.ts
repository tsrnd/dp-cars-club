import app from './app';
import * as util from 'util';

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(util.format('Server is running on port %d', port));
});
