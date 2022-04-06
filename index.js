const { response } = require("express");
const http = require ("http");
const app = require ("express")();
app.get("/", (req, res)=> res.sendFile(__dirname + "/index.html"))

app.listen(9091, () => console.log("Listening on http port 9091"))
const { client } = require("websocket");
const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening on 9090..."));

//hashmap
const clients = {};
const games = {};
const wsServer = new websocketServer({
    "httpServer": httpServer
})
wsServer.on("request", request => {

    //connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log ("opened"))
    connection.on("close", () => console.log ("closed"))

    connection.on("message", message => {

        const result = JSON.parse(message.utf8Data)

        //I have received a message from the client
        //a User wants to create a new game
        if(result.method === "create")
        {
            const clientID = result.clientID;
            const gameID = guid();
            games[gameID] = {
                "id": gameID,
                "balls": 20,
                "clients": []
            }
            const payLoad = {
                "method": "create",
                "game": games[gameID]
            }
            const con = clients[clientID].connection;
            con.send(JSON.stringify(payLoad));
        }

        //Client Join request
        if(result.method === "join")
        {
            const clientID = result.clientID;
            const gameID = result.gameID;
            const game = games [gameID];
            if(game.clients.length>=3)
            {
                //max player reached
            }
            const color = {"0": "Red", "1": "Green", "2": "Blue"}[game.clients.length]
            game.clients.push({
                "clientID": clientID,
                "color": color
            })

            const payLoad = {
                "method": "join",
                "game": game
            }
            
            //loop through all Clients
            game.clients.forEach(c => {
                clients[c.clientID].connection.send(JSON.stringify(payLoad))
            });

        }

    })

    //generate ClientID
    const clientID = guid();

    //Mapping ClientID / Connection
    clients[clientID] = {
        "connection": connection
    }

    const payLoad = {
        "method": "connect",
        "clientID": clientID
    }

    //Client Connect information
    connection.send(JSON.stringify(payLoad))

})


function GenerateClientID() {

    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

const guid = () => (GenerateClientID() + GenerateClientID() + "-" + GenerateClientID() + "-4" + GenerateClientID().substr(0,3) + "-" + GenerateClientID() + "-" + GenerateClientID() + GenerateClientID() + GenerateClientID()).toLowerCase();
