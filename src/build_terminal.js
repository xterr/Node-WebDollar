import {Node, Blockchain} from './index';
import global from "consts/global";
import consts from "consts/const_global";
import termination from "./termination";


//                            light-node

Blockchain.createBlockchain("full-node", ()=>{}, async ()=>{

    await Node.NodeExpress.startExpress();

    if (consts.DEBUG)
        await Node.NodeServer.startServer();

    Node.NodeClientsService.startService();

    Node.NodeServer.startServer();

    setInterval(async function() {
        let sAddress = Blockchain.blockchain.mining.minerAddress;
        let balance = Blockchain.blockchain.accountantTree.getBalance(sAddress, undefined);
        balance = (balance === null) ? 0 : (balance / 10000);

        console.log('========================================');
        console.log('=============== BALANCE ================');
        console.log('========================================');
        console.log('');
        console.log(sAddress + ': ' + balance);
        console.log('');
        console.log('========================================');
        console.log('========================================');

    }, 10000)

}, ()=>{
});


process.on('SIGINT', async () => {

    await termination(Blockchain);

});
