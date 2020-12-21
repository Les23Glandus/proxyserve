const prerender = require('prerender');
require('dotenv').config();

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