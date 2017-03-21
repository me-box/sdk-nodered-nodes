/**
 * Copyright 2016 Tom Lodge
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/



module.exports = function(RED) {
    "use strict";
    
    var ipc = require('node-ipc');
    ipc.config.id   = 'webserver';
    ipc.config.retry= 1500;
    ipc.config.silent=true;
    // require any external libraries we may need....
    //var foo = require("foo-library");

    // The main node definition - most things happen in here
    function CompanionApp(n) {
    
        console.log("fresh load of companion app");
        // Create a RED node
        RED.nodes.createNode(this,n);
		//'mqtt://mosquitto:1883'
        //client = mqtt.connect('mqtt://mosquitto:1883');
       
        
        ipc.connectTo(
            'webserver',
             function(){
             ipc.of.webserver.on(
                'connect',
                function(){
                    
                }
            );
        });

       
        // Store local copies of the node configuration (as defined in the .html)
        this.appId = n.appId;
		this.layout = n.layout;
		
        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;
		
		var fallbackId = (1+Math.random()*42949433295).toString(16);
		
		let init = false;
        // respond to inputs....
        this.on('input', function (m) {
			
            var msg = {}
			/*if (!init){
				console.log("sending reset!");
        		sendmessage(ipc, {channel:node.appId, type:"control", payload:{command:"reset"}});
        		init = true;
        	} */ 	
			msg.channel = node.appId;
			msg.sourceId = m.sourceId || fallbackId;
			msg.type = "data";
            msg.layout = node.layout;// || [[]];
            
            msg.payload = {
                id:   node.id,
                name: node.name || "app", 
                view: m.type || "text", 
                data: m.payload, 
            	channel: node.appId, //the websocket room that will receive the msg
            }
            sendmessage(ipc, msg);
        });

        this.on("close", function() {
        	sendmessage(ipc, {channel:node.appId, type:"control", payload:{command:"reset", channel:node.appId}});
        	ipc.of.webserver.destroy;
        });
    }
    
    function sendmessage(ipc, msg){
		try{
		   //console.log(msg);
		   ipc.of.webserver.emit(
							'message',  //any event or message type your server listens for 
							JSON.stringify(msg)
						)
			//client.publish(MQTT_APP_CHANNEL, JSON.stringify(msg));
		}catch(err){
			console.log(err);
		}
	}

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("app",CompanionApp);

}