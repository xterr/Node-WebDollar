import NodesList from 'node/lists/nodes-list'
import NodeSignalingServerWaitlistObject from "./Node-Signaling-Server-Waitlist-Object"
import NodeSignalingServerProtocol from "./../Node-Signaling-Server-Protocol"
import SignalingServerRoomListConnections from '../signaling-server-room/Signaling-Server-Room-List-Connections'
import NodeSignalingServerWaitlistObjectType from "./Node-Signaling-Server-Waitlist-Object-Type"
import SignalingServerRoomConnectionObject from './../signaling-server-room/Signaling-Server-Room-Connection-Object';

class NodeSignalingServerService{

    constructor(){

        this.waitlistSlaves = []; //slaves
        this.waitlistMasters = [];

        this.started = false;

        NodesList.emitter.on("nodes-list/disconnected", (nodesListObject) => {
            this._deleteNode(nodesListObject.socket, this.waitlistMasters);
            this._deleteNode(nodesListObject.socket, this.waitlistSlaves);
        });

    }

    _deleteNode(socket, list){

        if (socket === undefined) return;

        for (let i=list.length-1; i>=0; i--)
            if ( list[i].socket.node.sckAddress.uuid === socket.node.sckAddress.uuid) {
                list.splice(i, 1);
                return;
            }

    }

    async registerSocketForSignaling(socket, acceptWebPeers = true){

        let waitlistObject = this.searchNodeSignalingServerWaitlist(socket);

        if (waitlistObject === null) {
            waitlistObject = new NodeSignalingServerWaitlistObject(socket, acceptWebPeers, );
            this.waitlistSlaves.push( waitlistObject )
        }

        return waitlistObject;
    }

    startConnectingWebPeers(){

        if ( this.started === true )
            return;

        this.started = true;

        this._connectWebPeers();
    }

    _findNodeSignalingServerWaitlist(socket, list){

        for (let i=0; i<list.length; i++)
            if (list[i].socket.node.sckAddress.uuid === socket.node.sckAddress.uuid)
                return i;

        return -1;
    }

    searchNodeSignalingServerWaitlist( socket ){

        let pos = this._findNodeSignalingServerWaitlist(socket, this.waitlistMasters);
        if (pos !== -1) return this.waitlistMasters[pos];

        pos = this._findNodeSignalingServerWaitlist(socket, this.waitlistSlaves );
        if (pos !== -1) return this.waitlistSlaves[pos];

        return null;
    }

    _connectWebPeers(){

        //TODO instead of using Interval, to use an event based Protocol

        //mixing users
        for (let i = 0; i < this.waitlistSlaves.length; i++)

            if (this.waitlistSlaves[i].acceptWebPeers) {

                let master = false;

                // Step 0 , finding two different clients
                for (let j = 0; j < this.waitlistMasters.length; j++)
                    if (this.waitlistMasters[j].acceptWebPeers) {

                        let previousEstablishedConnection = SignalingServerRoomListConnections.searchSignalingServerRoomConnection(this.waitlistSlaves[i].socket, this.waitlistMasters[j].socket);

                        if (previousEstablishedConnection === null || previousEstablishedConnection.status !== SignalingServerRoomConnectionObject.ConnectionStatus.peerConnectionError )
                            master = true;

                        NodeSignalingServerProtocol.connectWebPeer( this.waitlistSlaves[i].socket, this.waitlistMasters[j].socket, previousEstablishedConnection );

                    }

                if (! master ) {

                    for (let j = 0; j < this.waitlistSlaves.length; j++)
                        if (this.waitlistSlaves[j].acceptWebPeers) {

                            let previousEstablishedConnection = SignalingServerRoomListConnections.searchSignalingServerRoomConnection(this.waitlistSlaves[i].socket, this.waitlistSlaves[j].socket);
                            NodeSignalingServerProtocol.connectWebPeer( this.waitlistSlaves[i].socket, this.waitlistSlaves[j].socket, previousEstablishedConnection );

                        }

                }


            }


        setTimeout(this._connectWebPeers.bind(this), 2500);
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

                if (countMasters >= 2){

                    //slave connected to multiple masters

                    signalingWaitlistClient1.socket.disconnect();
                    return;

                } else if (countSlaves > 4 || !signalingWaitlistClient1.acceptWebPeers){

                    signalingWaitlistClient1.type = NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_MASTER;
                    this.waitlistMasters.push(signalingWaitlistClient1);

                }

            } else if (signalingWaitlistClient1.type === NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_MASTER){

                //converting master to slave

                if (countMasters >= 2){

                    this._deleteNode(signalingWaitlistClient1.socket, this.waitlistMasters);
                    this.waitlistSlaves.push(signalingWaitlistClient1);

                    signalingWaitlistClient1.socket.disconnect();

                }


            }

        }catch (exception){

        }


    }

}

export default new NodeSignalingServerService();