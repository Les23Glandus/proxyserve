const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = 3180;
const HOST = "localhost";

// Create Express Server
const app = express();
app.disable('x-powered-by');
app.set('view cache', true);
app.use(compression());

app.use(helmet({
   contentSecurityPolicy: false,
 }));


app.use(/^\/(api|uploads)\/.+/, createProxyMiddleware({
   target: "http://localhost:1337/",
   changeOrigin: true,
   pathRewrite: {
      '^/api': '',
   },
}));

/*
app.use(/^\/(dev|static)\/.+/, createProxyMiddleware({
   target: "http://localhost:3000/",
   changeOrigin: false,
   pathRewrite: {
      '^/dev': '',
   },
}));
*/

const BUILD_PATH = "../www/build";
app.use(express.static(path.join(__dirname, BUILD_PATH)));
app.get(/.+/, (req,res) => {
   res.sendFile(path.join(__dirname, BUILD_PATH, 'index.html'))
});


/*
app.use(function (req, res, next) {
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Credentials', true);
   res.setHeader('Content-Security-Policy', "default-src 'self'");
   next();
 });
/**
 * Start server
 */
app.listen(PORT, HOST, () => {
   console.log(`Starting Proxy at ${HOST}:${PORT}`);
});