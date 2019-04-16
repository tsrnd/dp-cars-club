import app from './app';
import * as util from 'util';
import { Server } from 'http';
import Socket from './socket/socket';

const port = process.env.PORT || 3000;

const http = new Server(app);
const server = new Socket(http).getServer();

server.listen(port, () => {
    console.log(util.format('Server is running on port %d', port));
});
