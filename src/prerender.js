const prerender = require('prerender');
require('dotenv').config();

//To install Chrome
//https://www.programmersought.com/article/2964546361/#Chrome_102

const server = prerender({
    "port":process.env.PRERENDER_PORT,
    "waitAfterLastRequest":400,
    "pageDoneCheckInterval":150,
    "logRequests":false,
    "pageLoadTimeout":5000
});

server.use(require('./prerenderCache'))
server.start();

module.exports = server