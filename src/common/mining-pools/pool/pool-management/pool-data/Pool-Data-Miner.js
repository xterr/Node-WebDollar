import Serialization from 'common/utils/Serialization';
import BufferExtended from 'common/utils/BufferExtended';
import consts from 'consts/const_global';
import PoolDataMinerInstance from "./Pool-Data-Miner-Instance";

class PoolDataMiner{

    constructor(poolData, index, address, publicKey){

        this.poolData = poolData;

        this.index = index;
        this.address = address;

        this.instances = [];

        this.addInstance(publicKey);

        this.rewardTotal = 0;       //pending except last
        this.rewardConfirmed = 0;   //rewardConfirmed
        this.rewardConfirmedOther = 0;   //other money confirmed to be sent
        this.rewardSent = 0;        //rewardSent

    }

    addInstance(publicKey){

        if (publicKey === undefined) return;

        if (!Buffer.isBuffer(publicKey) || publicKey.length !== consts.ADDRESSES.PUBLIC_KEY.LENGTH) 
            throw {message: "public key is invalid"};

        let instance = this.findInstance(publicKey);
        if ( instance === null) {
            let instance = new PoolDataMinerInstance(this, publicKey);
            this.instances.push(instance);
        }

        return instance;

    }

    findInstance(publicKey){

        for (let i = 0; i < this.instances.length; i++)
            if (this.instances[i].publicKey.equals( publicKey) )
                return this.instances[i];

        return null;
    }

    serializeMiner(){

        let list = [];

        list.push(Serialization.serializeNumber1Byte(0x01) );
        list.push(this.address ); //20 bytes

        list.push ( Serialization.serializeNumber7Bytes(this.rewardTotal) );
        list.push ( Serialization.serializeNumber7Bytes(this.rewardConfirmedOther) );
        list.push ( Serialization.serializeNumber7Bytes(this.rewardSent) );

        list.push ( Serialization.serializeNumber4Bytes(this.instances.length) );

        for (let i=0; i<this.instances.length; i++)
            list.push(this.instances[i].serializeMinerInstance() );

        return Buffer.concat(list);

    }

    deserializeMiner( buffer, offset ){

        let version =  Serialization.deserializeNumber( BufferExtended.substr( buffer, offset, 1 ) );
        offset += 1;

        this.address = BufferExtended.substr(buffer, offset, consts.ADDRESSES.ADDRESS.LENGTH );
        offset += consts.ADDRESSES.ADDRESS.LENGTH;

        this.rewardTotal = Serialization.deserializeNumber( BufferExtended.substr( buffer, offset, 7 ) );
        offset += 7;

        this.rewardConfirmedOther = Serialization.deserializeNumber( BufferExtended.substr( buffer, offset, 7 ) );
        offset += 7;

        this.rewardSent = Serialization.deserializeNumber( BufferExtended.substr( buffer, offset, 7 ) );
        offset += 7;


        let len = Serialization.deserializeNumber( BufferExtended.substr( buffer, offset, 4 ) );
        offset += 4;

        this.instances = [];
        for (let i=0; i<len; i++){

            let instance = new PoolDataMinerInstance(this, undefined);
            offset = instance.deserializeMinerInstance(buffer, offset);

            this.instances.push(instance);
        }

        return offset;

    }


    calculateTotalReward(){

        let reward = 0;

        for (let i=0; i<this.instances.length; i++)
            for (let j = 0; j < this.poolData.blocksInfo.length - 2; j++)
                for (let q = 0; q<this.poolData.blocksInfo[j].blockInformationMinersInstances.length; q++)
                    if (this.poolData.blocksInfo[j].blockInformationMinersInstances[q].minerInstance === this.instances[i]){

                        reward += this.poolData.blocksInfo[j].blockInformationMinersInstances[q].reward;

                    }

        return reward;

    }

}

export default PoolDataMiner;