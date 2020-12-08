const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = 80;
//const HOST = "localhost";

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

const BUILD_PATH = "../www/build";
app.use(express.static(path.join(__dirname, BUILD_PATH)));
app.get(/.+/, (req,res) => {
   res.sendFile(path.join(__dirname, BUILD_PATH, 'index.html'))
});

/**
 * Start server
 */
app.listen(PORT, () => {
   console.log(`Starting Proxy at ${PORT}`);
});