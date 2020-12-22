const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const myCache = require("./src/myCache");
const prerender = require('prerender-node');
require('dotenv').config();

const PORT = process.env.PORT;


/**
 * Init express
 */
const app = express();
app.disable('x-powered-by');
app.set('view cache', true);
app.use(compression());
app.use(helmet({
   contentSecurityPolicy: false,
 }));


/**
 * Cache Strapi answers
 */
 app.use("/clear-cache-23", myCache.clearCache);
 app.use(myCache.routes, myCache.use);
 
/**
 * Proxy to strapi
 */
 app.use(/^\/(api)\/.+/, createProxyMiddleware({
   target: "http://localhost:1337/",
   changeOrigin: true,
   selfHandleResponse: true,
   onProxyRes:myCache.onProxyRes,
   pathRewrite: {
      '^/api': '',
     },
}));   
app.use(/^\/uploads\/.+/, createProxyMiddleware({
   target: "http://localhost:1337/",
   changeOrigin: true,
   pathRewrite: {
      '^/api': '',
      },
   }));   

/**
 * Prerender.io
 */
/*
*/
prerender.set('prerenderToken',process.env.PRERENDER_TOKEN)
         .set('prerenderServiceUrl', 'http://localhost:'+process.env.PRERENDER_PORT+'/');
app.use(prerender); //See https://prerender.io/

/**
 * Static files
 */
const BUILD_PATH = process.env.BUILD_PATH;
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