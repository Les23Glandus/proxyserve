const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = 3000;
const HOST = "localhost";

// Create Express Server
const app = express();

app.get('/', (req, res, next) => {
   res.send('This is a proxy service which proxies to Billing and Account APIs.');
});


app.use('/test', createProxyMiddleware({
   target: "http://127.0.0.1:4000/",
   changeOrigin: true,
   pathRewrite: {
       [`^/json_placeholder`]: '',
   },
}));

app.listen(PORT, HOST, () => {
   console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
/*
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Je suis sur le serveur 1');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/