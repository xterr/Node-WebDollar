import PoolProtocolList from "common/mining-pools/common/Pool-Protocol-List"
import NodesList from 'node/lists/Nodes-List'
import PoolProtocolList from "../../../common/Pool-Protocol-List";

class PoolDataConnectedMinerInstances extends PoolProtocolList{
    
    constructor(poolManagement){

        super();
        
        this.poolManagement = poolManagement;
        this.connectedMinerInstances = this.list;

    }


    startPoolDataConnectedMinerInstances(){
        if (this._deleteUnresponsiveMinersInterval === undefined)
            this._deleteUnresponsiveMinersInterval = setTimeout( this._deleteUnresponsiveMiners.bind(this), 20000 );
    }

    stopPoolDataConnectedMinerInstances(){
        clearTimeout(this._deleteUnresponsiveMinersInterval);
        this._deleteUnresponsiveMinersInterval = undefined;
    }

    _deleteUnresponsiveMiners(){

        let time = new Date().getTime()/1000;

        for (let i = this.connectedMinerInstances.length - 1; i >= 0; i--)
            if (time - this.connectedMinerInstances[i].dateActivity > 480) { //8 minutes

                try {
                    if (!this.poolManagement.poolSettings.poolUsePoolServers)
                        this.connectedMinerInstances[i].socket.disconnect();
                } catch (exception){

                }

                this.connectedMinerInstances.splice(i, 1);
            }


        setTimeout( this._deleteUnresponsiveMiners.bind(this), 20000 );
    }

    findElementBySocket(socket){

        for (let i=0; i<this.list.length; i++)
            if ( this.list[i].socket === socket )
                return i;

        return -1;

    }

    deleteElementBySocket(socket){

        let pos = this.findElementBySocket(socket);

        if (pos !== -1)
            this.list.splice(pos, 1);

    }
    
}

export default PoolDataConnectedMinerInstances