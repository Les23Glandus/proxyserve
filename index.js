const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const myCache = require("./src/myCache");
const bodyParser = require('body-parser');
require('dotenv').config();

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


app.use("/clear-cache-23", myCache.clearCache);
app.use(myCache.routes, myCache.use);
 
app.use(/^\/(api|uploads)\/.+/, createProxyMiddleware({
    target: "http://localhost:1337/",
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes:myCache.onProxyRes,
    pathRewrite: {
       '^/api': '',
      },
   }));

   
app.use(myCache.routes, myCache.use);
   
const BUILD_PATH = "../www/build";
app.use(require('prerender-node').set('prerenderToken',process.env.prerenderToken)); //See https://prerender.io/
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