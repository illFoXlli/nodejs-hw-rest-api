const http = require('http');

const server = http.createServer();

server.on("request", (req, res)=> {
    res.end("kzkzkzkkz")
})

server.listen( 3000, "93.76.213.218", ()=> console.log("сервер работает"))