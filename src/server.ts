import app from './app';
import * as util from 'util';
import { Server } from 'http';
import Socket from './socket/socket';

const port = process.env.PORT || 3000;

var http = new Server(app);
var server = new Socket(http).getServer();

server.listen(port, () => {
    console.log(util.format('Server is running on port %d', port));
});
