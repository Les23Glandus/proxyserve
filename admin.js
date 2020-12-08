const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const PORT = process.env.ADMIN_PORT || 8080;

// Create Express Server
const app = express();
app.disable('x-powered-by');
app.set('view cache', true);
app.use(compression());

app.use(helmet({
   contentSecurityPolicy: false,
 }));


app.use(/.+/, createProxyMiddleware({
   target: "http://localhost:1337/",
   changeOrigin: true,
   pathRewrite: {
      '': '',
   },
}));

/**
 * Start server
 */
app.listen(PORT, () => {
   console.log(`Starting Proxy at ${PORT}`);
});