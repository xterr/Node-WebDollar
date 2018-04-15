import consts from 'consts/const_global'
import BufferExtended from "common/utils/BufferExtended"

class BlockchainGenesis{

    constructor(){

        this.hashPrev = new Buffer("A4152317E8CD02C6FE31D2970AE5F614BF0EB36367E16AF5610F0D043387AC82", "hex");

        this.timeStamp = 0;
        this.timeStampOffset = 1523697509;

        this.difficultyTarget = new Buffer ( "00498112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", "hex" ); //hard difficulty

        this.address = BufferExtended.fromBase("WEBD$gBzsiV+$FARK8qSGqs09V6AEDBi#@fP6n7$"); // genesis address
    }

    validateGenesis(block){

        if ( block.timeStamp.length !== this.timeStamp.length )
            throw {message: "Timestamp doesn't match", timestamp: block.timeStamp};

        if ( block.timeStamp > 0x000FFFFF)
            throw {message: "Timestamp is too old ", timestamp: block.timeStamp};

        if (block.timeStamp < 0)
            throw {message: "Timestamp is invalid", timeStamp: block.timeStamp}
    }

    getLevel(){

        return 0;
    }

}

export default new BlockchainGenesis();