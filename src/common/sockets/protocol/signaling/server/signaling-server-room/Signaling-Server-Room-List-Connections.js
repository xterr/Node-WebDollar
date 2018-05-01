import SocketAddress from 'common/sockets/socket-address'
import NodesList from 'node/lists/nodes-list'
import NodesWaitlist from 'node/lists/waitlist/nodes-waitlist'
import SignalingServerRoomConnectionObject from './Signaling-Server-Room-Connection-Object';
import CONNECTIONS_TYPE from "node/lists/types/Connections-Type"
import NODES_TYPE from "node/lists/types/Nodes-Type"
/*
    The List is populated with Node Sockets who are available for WebRTC
 */

const uuid = require('uuid');

class SignalingServerRoomListConnections {

    // signalingRoom = []               - storing the connected sockets
    // events = []                      - used for callbacks

    constructor() {

        console.log("SignalingRoomList constructor");

        this.lastConnectionsId = 0;

        this.list = [];

        //{type: ["webpeer", "client"]}
        NodesList.emitter.on("nodes-list/disconnected", (result ) => { this._disconnectedNode( result ) });
    }

    registerSignalingServerRoomConnection(client1, client2, status) {

        if (client1 === null || client2 === null)
            return null;

        let connection = this.searchSignalingServerRoomConnection(client1, client2);

        if (connection === null) {

            let roomConnectionObject = new SignalingServerRoomConnectionObject(client1, client2, status, uuid.v4());

            this.list.push(roomConnectionObject);
            this.list.push(roomConnectionObject);

            return roomConnectionObject;

        } else {
            //it was established before, now I only change the status
            connection.status = status;
        }

        return connection;
    }

    searchSignalingServerRoomConnection(client1, client2) {

        client1 = client1.socket.sckAddress.uuid;
        client2 = client2.socket.sckAddress.uuid;

        //previous established connection
        for (let i = 0; i < this.list.length; i++)
            if ( (this.list[i].client1.sckAddress.uuid === client1 && this.list[i].client2.sckAddress.uuid === client2) ||
                 (this.list[i].client1.sckAddress.uuid === client2 && this.list[i].client2.sckAddress.uuid === client1))

                return this.list[i];

        return null;
    }

    searchSignalingServerRoomConnectionById(id){

        for (let i = 0; i < this.list.length; i++)
            if (this.list[i].id === id)
                return this.list[i];

        return null;
    }

    _disconnectedNode(nodesListObject){

        if ( [ CONNECTIONS_TYPE.CONNECTION_SERVER_SOCKET, CONNECTIONS_TYPE.CONNECTION_WEBRTC ].indexOf(nodesListObject.connectionType) < 0 ) return; // signaling service on webpeer

         let uuid = nodesListObject.socket.node.sckAddress.uuid;

        for (let i = this.list.length - 1; i >= 0; i--) {

            if (this.list[i].client1.socket.node.sckAddress.uuid === uuid) {
                this.list[i].client1 = {
                    socket: {
                        node: {
                            sckAddress: {
                                uuid: uuid,
                            },
                        }
                    },
                    deleted: true,
                };
            }

            if (this.list[i].client2.socket.node.sckAddress.uuid === uuid) {
                this.list[i].client2 = {

                    socket: {
                        node: {
                            sckAddress: {
                                uuid: uuid,
                            },
                        }
                    },

                    deleted: true,
                };
            }

            if (this.list[i].client1.deleted === true && this.list[i].client2.deleted === true)
                this.list.splice(i, 1);

        }


    }

    removeServerRoomConnection( connection ) {

        for (let i=0; this.list.length; i++)
            if ( this.list[i].id === connection.id ){
                this.list.splice(i,1);
                return;
            }

    }


}

export default new SignalingServerRoomListConnections();