import InterfaceBlockchainMining from "../Interface-Blockchain-Mining";
import InterfaceBlockchainBlock from "common/blockchain/interface-blockchain/blocks/Interface-Blockchain-Block";
const Spawn = require('threads').spawn;

class InterfaceBlockchainBackboneMining extends InterfaceBlockchainMining {


    //backbone mining is the same with InterfaceBlockchainMining

    constructor(blockchain, minerAddress, miningFeeThreshold){

        super(blockchain, minerAddress, miningFeeThreshold);

        this.WORKER_NONCES_WORK = 200;

        this.block = undefined;
        this.undefined = undefined;
        this._workerResolve = undefined;
    }

    async mineNonces(){

        const T = Spawn( ([input]) => {
            return new Promise(async (resolve) => {

                try {
                    for (let i = 0; i < input.WORKER_NONCES_WORK; i++) {
                        if (input._nonce > 0xFFFFFFFF || !input.started || input.reset) {
                            setTimeout(() => resolve({
                                output: input,
                                resolve: {result: false}
                            }), 1);
                            return false;
                        }

                        let hash = 0;//await InterfaceBlockchainBlock.computeHashStatic(input._nonce, input.height, input.difficultyTargetPrev, input.computedBlockPrefix, input.nonce);

                        //console.log('Mining WebDollar Argon2 - this._nonce', this._nonce, hash.toString("hex") );
                        if (/*hash.compare(input.difficulty)*/ 0 <= 0) {

                            setTimeout(() => resolve({
                                output: input, 
                                resolve: {
                                    result: true,
                                    nonce: input._nonce,
                                    hash: hash,
                                }
                            }), 1);
                            return;
                        }

                        input._nonce++;
                        input._hashesPerSecond++;

                    }

                } catch (exception){
                    console.log("mineNonces returned error", exception);
                    return false;
                }

                setTimeout(() => resolve({output: input, resolve: {result: false} }), 1);
            })
        }).on('message', (response) => {
            console.log('sum = ', response);
            
            this._workerResolve(response.resolve);
            this._nonce = response.output._nonce;
            this._hashesPerSecond = response.output._hashesPerSecond;
            
            
            T.kill();
            setTimeout( async () => { return await this.mineNonces() }, 10);
        });
        
        T.send([{
            difficulty: this.difficulty,
            _nonce: this._nonce,
            WORKER_NONCES_WORK: this.WORKER_NONCES_WORK,
            _hashesPerSecond: this._hashesPerSecond,
            started: this.started,
            reset: this.reset,
            height: this.block.height,
            difficultyTargetPrev: this.block.difficultyTargetPrev,
            computedBlockPrefix: this.block.computedBlockPrefix,
            nonce: this.block.nonce
        }]);

    }

    mine(block, difficultyTarget){

        this.block = block;
        this.difficulty = difficultyTarget;

        let promiseResolve = new Promise ( (resolve)=>{


            this._workerResolve = resolve;
            setTimeout(async () => {return await this.mineNonces() }, 10);


        } );

        return promiseResolve;

    }


}

export default InterfaceBlockchainBackboneMining