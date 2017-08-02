module.exports = function(RED) {
    
    "use strict";
    //var WebSocket = require('ws');
    //var socket;
    var net = require('net');
    var client = new net.Socket();
    var connected = false;
    

    const NETSTRING_DELIMITER = ',';
    const NETSTRING_SEPARATOR = ':';
    
    const netstringify = (string, { encoding = 'utf-8', response = 'string' } = {}) => {

        let result = [];
        let input = [];

        if (!input) {
            return;
        }

        if (!Array.isArray(string)) {
            input.push(string);
        } else {
            input = string;
        }

        input.forEach((text) => {
            let netstring = [];
            netstring.push(new Buffer(`${text.length}${NETSTRING_SEPARATOR}`, encoding));
            netstring.push(new Buffer(text, encoding));
            netstring.push(new Buffer(NETSTRING_DELIMITER, encoding));
            netstring = Buffer.concat(netstring);
            result.push(netstring);
        });
        //For string result
        if (result.length > 0 && response === 'string') {
            result = result.map(netstring => netstring.toString(encoding));
            return result.join('');
        }
        //Return as buffer for all the other types.
        return Buffer.concat(result);
    };


    function connect(fn){
        connected = false;
   
        client.connect(9001, 'openface', function() {
            connected = true;
            if (fn){
                fn();
            }
        })
    }

    function OpenFace(n) {
        console.log("in new openface...");

        RED.nodes.createNode(this,n);
        var node = this;

        connect(function(){
            console.log("connected to openface!");
        });
    

        client.on("error", function(err){
            connected = false;
            setTimeout(function(){connect()}, 500);
        });

        client.on("message", function(msg){
            console.log("nice - seen message!!", msg);
        });
        
        client.on('uncaughtException', function (err) {
            connected = false;
            console.error(err.stack);
            setTimeout(function(){connect()}, 2000);
        });

        /*try{
            console.log("creating new websocket");

            socket = new WebSocket("ws:openface:9001");
            socket.binaryType = "arraybuffer";

            console.log("done creating new websocket");

            socket.onerror = function(err){
                console.log("errored creating scoket", err);
            }

            socket.onopen = function() {
                console.log("created socket");
            }
        
            socket.onclose = function(event){
                console.log("closed socket", event);
            }

            socket.onmessage = function(e) {
                console.log("got message",e);
                node.send("hello");
            }
        }catch(error){
            console.log("error connecting to socket", error);
        }*/

        this.on('input', function (msg) {
            console.log("seen something, sending to openface");
            //if (msg.dataURL){
            const data = JSON.stringify(msg);
            client.write(netstringify(data));
                /*if (socket){
                    try{
                        socket.send("ahello!!");
                    }catch(error){
                        console.log("error sending", error)
                    }
                }*/
            //}
        });
    }

    RED.nodes.registerType("openface",OpenFace); 
}

