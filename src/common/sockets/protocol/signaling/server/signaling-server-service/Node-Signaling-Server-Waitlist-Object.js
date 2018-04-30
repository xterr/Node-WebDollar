import NodeSignalingServerWaitlistObjectType from "./Node-Signaling-Server-Waitlist-Object-Type"

class NodeSignalingServerWaitlistObject{

    constructor(socket, acceptWebPeers){

        this.socket = socket;
        this.type = NodeSignalingServerWaitlistObjectType.NODE_SIGNALING_SERVER_WAITLIST_SLAVE;

        this.acceptWebPeers = acceptWebPeers;

    }


    set acceptWebPeers(acceptWebPeers){

        this._acceptWebPeers = acceptWebPeers;

    }

    get acceptWebPeers(){

        return this._acceptWebPeers;

    }



}

export default NodeSignalingServerWaitlistObject;