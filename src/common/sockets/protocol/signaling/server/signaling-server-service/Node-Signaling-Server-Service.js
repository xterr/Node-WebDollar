import NodesList from 'node/lists/nodes-list'
import NodeSignalingServerWaitlistObject from "./Node-Signaling-Server-Waitlist-Object"
import NodeSignalingServerProtocol from "./../Node-Signaling-Server-Protocol"
import SignalingServerRoomListConnections from '../signaling-server-room/Signaling-Server-Room-List-Connections'
import NodeSignalingServerWaitlistObjectType from "./Node-Signaling-Server-Waitlist-Object-Type"
import SignalingServerRoomConnectionObject from './../signaling-server-room/Signaling-Server-Room-Connection-Object';

class NodeSignalingServerService{

    constructor(){

        this.waitlist = [];
        this.started = false;

        NodesList.emitter.on("nodes-list/disconnected", async (nodesListObject) => {
            await this._desinitializeNode(nodesListObject.socket);
        });

    }

    _desinitializeNode(socket){

        for (let i=this.waitlist.length-1; i>=0; i--)
            if ( this.waitlist[i].socket.node.sckAddress.matchAddress(socket.node.sckAddress, ["uuid"] ) ){
                this.waitlist.splice(i,1);
                return;
            }

    }

    async registerSocketForSignaling(socket, acceptWebPeers = true){

        let waitlistObject = this.searchNodeSignalingServerWaitlist(socket);

        if (waitlistObject === null) {
            waitlistObject = new NodeSignalingServerWaitlistObject(socket, acceptWebPeers, );
            this.waitlist.push( waitlistObject )
        }

        return waitlistObject;
    }

    startConnectingWebPeers(){

        if ( this.started === true )
            return;

        this.started = true;

        this._connectWebPeers();
    }

    findNodeSignalingServerWaitlist(socket){
        for (let i=0; i<this.waitlist.length; i++)
            if (this.waitlist[i].socket.node.sckAddress.matchAddress(socket.node.sckAddress, ["uuid"])){
                return i;
            }
        return -1;
    }

    searchNodeSignalingServerWaitlist(socket){
        let pos = this.findNodeSignalingServerWaitlist(socket);
        if (pos !== -1) return this.waitlist[pos];

        return null;
    }

    _connectWebPeers(){

        //TODO instead of using Interval, to use an event based Protocol

        //mixing users
        for (let i = 0; i < this.waitlist.length; i++) {

            if (!this.waitlist[i].acceptWebPeers)
                continue;

            for (let j = i+1; j < this.waitlist.length; j++){

                if (!this.waitlist[j].acceptWebPeers)
                    continue;

                // Step 0 , finding two different clients
                // clients are already already with socket

                //shuffling them, the sockets to change the orders
                let client1, client2 = null;

                if (Math.random() > 0.5) {

                    client1 = this.waitlist[i];
                    client2 = this.waitlist[j];

                } else {

                    client1 = this.waitlist[j];
                    client2 = this.waitlist[i];

                }

                if (client1.type === NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_MASTER && client2.type === NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_MASTER){
                    continue;
                }

                NodeSignalingServerProtocol.connectWebPeer( client1.socket, client2.socket );

            }
        }


        setTimeout(this._connectWebPeers.bind(this), 2000);
    }

    recalculateSignalingWaitlistTypeFromConnection(connection) {

        let waitlist = this.searchNodeSignalingServerWaitlist(connection.client1);
        this.recalculateSignalingWaitlistType(waitlist);

        waitlist = this.searchNodeSignalingServerWaitlist(connection.client2);
        this.recalculateSignalingWaitlistType(waitlist);

    }

    recalculateSignalingWaitlistType(signalingWaitlistClient1){

        if (signalingWaitlistClient1 === null) return;

        try{

            let countSlaves = 0;
            let countMasters = 0;

            for (let i = 0; i<SignalingServerRoomListConnections.list.length; i++){


                let connection = SignalingServerRoomListConnections.list[i];
                if (connection.status !== SignalingServerRoomConnectionObject.ConnectionStatus.peerConnectionEstablished && connection.status !== SignalingServerRoomConnectionObject.ConnectionStatus.peerConnectionAlreadyConnected )
                    continue;

                let client1, client2;

                if (connection.client1 === signalingWaitlistClient1.socket ){
                    client1 = SignalingServerRoomListConnections.list[i].client1;
                    client2 = SignalingServerRoomListConnections.list[i].client2;
                } else
                if (connection.client2 === signalingWaitlistClient1.socket ){
                    client1 = SignalingServerRoomListConnections.list[i].client2;
                    client2 = SignalingServerRoomListConnections.list[i].client1;
                }

                if (client2 !== undefined){

                    let signalingWaitlistClient2 = this.searchNodeSignalingServerWaitlist(client2);

                    if (signalingWaitlistClient2.type === NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_MASTER)
                        countMasters ++;
                    else
                    if (signalingWaitlistClient2.type === NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_SLAVE)
                        countSlaves ++;

                }

            }

            if (signalingWaitlistClient1.type === NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_SLAVE){

                if (countMasters >= 1){

                    if (countMasters > 2 || !signalingWaitlistClient1.acceptWebPeers ){

                        signalingWaitlistClient1.socket.disconnect();
                        return;

                    }

                } else if (countSlaves > 4 || !signalingWaitlistClient1.acceptWebPeers){

                    signalingWaitlistClient1.type = NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_MASTER;

                }

            } else if (signalingWaitlistClient1.type === NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_MASTER){

            }

        }catch (exception){

        }


    }

}

export default new NodeSignalingServerService();