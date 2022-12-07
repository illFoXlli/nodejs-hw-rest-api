const http = require('http');

const server = http.createServer();

server.on("request", (req, res)=> {
    res.end("kzkzkzkkz")
})

server.listen( 3333, ()=> console.log("сервер работает"))