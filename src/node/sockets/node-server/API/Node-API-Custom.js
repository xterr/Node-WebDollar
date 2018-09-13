import Blockchain from "main-blockchain/Blockchain"
import BlockchainGenesis from 'common/blockchain/global/Blockchain-Genesis'
import WebDollarCoins from "common/utils/coins/WebDollar-Coins"
import InterfaceBlockchainAddressHelper from 'common/blockchain/interface-blockchain/addresses/Interface-Blockchain-Address-Helper'
import BufferExtended from "common/utils/BufferExtended";
import Serialization from "common/utils/Serialization";
import consts from 'consts/const_global';

class NodeAPICustom{

    constructor(){

    }

    blockHeight(req, res) {
        let nBlockHeight = parseInt(req.blockHeight);
        let oBlock       = Blockchain.blockchain.blocks[nBlockHeight];

        if (typeof oBlock === "undefined")
        {
            throw "Block not found or invalid block number";
        }

        return {result: true, block: this._processBlock(oBlock)};
    }

    blockHeights(req, res) {
        let aBlockHeights = req.blockHeights.split(',');

        // unique heights
        aBlockHeights = Array.from(new Set(aBlockHeights));

        if (aBlockHeights.length > 100)
        {
            throw 'Limit exceeded';
        }

        let aBlocks = [], nBlockHeight, oBlock, i;

        for (i in aBlockHeights)
        {
            nBlockHeight = parseInt(aBlockHeights[i]);

            if (nBlockHeight > Blockchain.blockchain.blocks.length)
            {
                continue;
            }

            oBlock = Blockchain.blockchain.blocks[nBlockHeight];

            if (typeof oBlock === "undefined") {
                continue;
            }

            aBlocks.push(this._processBlock(oBlock));
        }

        return {result: true, blocks: aBlocks};
    }

    blockStartingWithHeight(req, res) {
        let aBlocks           = [], nBlockHeight, oBlock;
        let nStartBlockHeight = parseInt(req.startBlockHeight);
        let nEndBlockHeight   = nStartBlockHeight + 100;

        for (nBlockHeight=nStartBlockHeight; nBlockHeight<=nEndBlockHeight; nBlockHeight++)
        {
            // break if currentBlockHeight is smaller than our desired height
            // or if the block cannot be retrieved at the desired height
            // so we can return consecutive blocks each time (even if the returned number is smaller than 50)

            if (nBlockHeight > Blockchain.blockchain.blocks.length)
            {
                break;
            }

            oBlock = Blockchain.blockchain.blocks[nBlockHeight];

            if (typeof oBlock === "undefined")
            {
                break;
            }

            aBlocks.push(this._processBlock(oBlock));
        }

        return {result: true, blocks: aBlocks};
    }

    _processBlock(oBlock) {
        let transactions       = [], i;
        let nBlockTimestampRaw = oBlock.timeStamp;
        let nBlockTimestamp    = nBlockTimestampRaw + BlockchainGenesis.timeStampOffset;
        let oBlockTimestampUTC = new Date(nBlockTimestamp * 1000);

        for (i=0; i < oBlock.data.transactions.transactions.length; i++)
        {
            let oTransaction = oBlock.data.transactions.transactions[i];
            let nInputSum    = oTransaction.from.calculateInputSum();
            let nOutputSum   = oTransaction.to.calculateOutputSum();

            let aTransaction = {
                trx_id         : oTransaction.txId.toString('hex'),
                version        : oTransaction.version,
                nonce          : oTransaction.nonce,
                time_lock      : oTransaction.timeLock,
                from_length    : oTransaction.from.addresses.length,
                to_length      : oTransaction.to.addresses.length,
                fee            : oTransaction.fee / WebDollarCoins.WEBD,
                fee_raw        : oTransaction.fee,
                timestamp      : oBlockTimestampUTC.toUTCString(),
                timestamp_UTC  : nBlockTimestamp,
                timestamp_block: nBlockTimestampRaw,
                timestamp_raw  : nBlockTimestampRaw,
                createdAtUTC   : oBlockTimestampUTC,
                block_id       : oBlock.height,
                from           : {trxs: [], addresses: [], amount: nInputSum  / WebDollarCoins.WEBD, amount_raw: nInputSum},
                to             : {trxs: [], addresses: [], amount: nOutputSum / WebDollarCoins.WEBD, amount_raw: nOutputSum},
            };

            oTransaction.from.addresses.forEach((oAddress) => {
                aTransaction.from.trxs.push({
                    trx_from_address   : BufferExtended.toBase(InterfaceBlockchainAddressHelper.generateAddressWIF(oAddress.unencodedAddress)),
                    trx_from_pub_key   : oAddress.publicKey.toString("hex"),
                    trx_from_signature : oAddress.signature.toString("hex"),
                    trx_from_amount    : oAddress.amount / WebDollarCoins.WEBD,
                    trx_from_amount_raw: oAddress.amount
                });

                aTransaction.from.addresses.push(BufferExtended.toBase(InterfaceBlockchainAddressHelper.generateAddressWIF(oAddress.unencodedAddress)));
            });

            oTransaction.to.addresses.forEach((oAddress) => {
                aTransaction.to.trxs.push({
                    trx_to_address   : BufferExtended.toBase(InterfaceBlockchainAddressHelper.generateAddressWIF(oAddress.unencodedAddress)),
                    trx_to_amount    : oAddress.amount / WebDollarCoins.WEBD,
                    trx_to_amount_raw: oAddress.amount
                });

                aTransaction.to.addresses.push(BufferExtended.toBase(InterfaceBlockchainAddressHelper.generateAddressWIF(oAddress.unencodedAddress)));
            });

            transactions.push(aTransaction);
        }

        let $oBlockData = {
            id             : oBlock.height,
            block_id       : oBlock.height,
            hash           : oBlock.hash.toString('hex'),
            nonce          : Serialization.deserializeNumber4Bytes_Positive(Serialization.serializeNumber4Bytes(oBlock.nonce)),
            nonce_raw      : oBlock.nonce,
            version        : oBlock.version,
            previous_hash  : oBlock.hashPrev.toString('hex'),
            timestamp      : oBlockTimestampUTC.toUTCString(),
            timestamp_UTC  : nBlockTimestamp,
            timestamp_block: nBlockTimestampRaw,
            hash_data      : oBlock.data.hashData.toString('hex'),
            miner_address  : BufferExtended.toBase(InterfaceBlockchainAddressHelper.generateAddressWIF(oBlock.data._minerAddress)),
            trxs_hash_data : oBlock.data.transactions.hashTransactions.toString('hex'),
            trxs_number    : transactions.length,
            trxs           : transactions,
            block_raw      : BufferExtended.toBase(oBlock.serializeBlock().toString('hex')),
            reward         : oBlock.reward === null ? 0 : oBlock.reward / WebDollarCoins.WEBD,
            reward_raw     : oBlock.reward === null ? 0 : oBlock.reward,
            createdAtUTC   : oBlockTimestampUTC
        };

        return this._processBlockDataForForks($oBlockData, oBlock);
    }

    _processBlockDataForForks($oBlockData, $oBlock) {
        let $oForkInfo = consts.HARD_FORKS.DATA[$oBlock.height];

        if (typeof $oForkInfo === 'undefined')
        {
            return $oBlockData;
        }

        if ($oBlock.height === consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY)
        {
            let $aAddressBalanceReduction = consts.HARD_FORKS.DATA[$oBlock.height].ADDRESS_BALANCE_REDUCTION;
            let nInputSum                 = 0;
            let nOutputSum                = consts.HARD_FORKS.DATA[$oBlock.height].GENESIS_ADDRESSES_CORRECTION.TO.BALANCE;

            let aTransaction = {
                trx_id         : 'virtual_tx_' + consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY + '_1',
                isVirtual      : true,
                version        : 1,
                nonce          : 1,
                time_lock      : consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY - 1,
                from_length    : 0,
                to_length      : 0,
                fee            : 0,
                fee_raw        : 0,
                timestamp      : $oBlockData['timestamp'],
                timestamp_UTC  : $oBlockData['timestamp_UTC'],
                timestamp_block: $oBlockData['timestamp_block'],
                timestamp_raw  : $oBlockData['timestamp_block'],
                createdAtUTC   : $oBlockData['createdAtUTC'],
                block_id       : $oBlock.height,
                from           : {trxs: [], addresses: [], amount: 0, amount_raw: 0},
                to             : {trxs: [], addresses: [], amount: nOutputSum / WebDollarCoins.WEBD, amount_raw: nOutputSum},
            };

            let i = 0;
            for (let sAddress in $aAddressBalanceReduction)
            {
                aTransaction.from.trxs.push({
                    trx_from_address   : sAddress,
                    trx_from_pub_key   : 'pubKey_virtual_tx_' + consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY + '_1' + '_' + i,
                    trx_from_signature : 'signature_virtual_tx_' + consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY + '_1' + '_' + i,
                    trx_from_amount    : - $aAddressBalanceReduction[sAddress] / WebDollarCoins.WEBD,
                    trx_from_amount_raw: - $aAddressBalanceReduction[sAddress]
                });

                aTransaction.from.addresses.push(sAddress);

                nInputSum += - $aAddressBalanceReduction[sAddress];

                ++i;
            }

            aTransaction.from_length = aTransaction.from.addresses.length;

            aTransaction.to.trxs.push({
                trx_to_address   : consts.HARD_FORKS.DATA[$oBlock.height].GENESIS_ADDRESSES_CORRECTION.TO.ADDRESS,
                trx_to_amount    : consts.HARD_FORKS.DATA[$oBlock.height].GENESIS_ADDRESSES_CORRECTION.TO.BALANCE / WebDollarCoins.WEBD,
                trx_to_amount_raw: consts.HARD_FORKS.DATA[$oBlock.height].GENESIS_ADDRESSES_CORRECTION.TO.BALANCE
            });

            aTransaction.to.addresses.push(consts.HARD_FORKS.DATA[$oBlock.height].GENESIS_ADDRESSES_CORRECTION.TO.ADDRESS);
            aTransaction.to_length = aTransaction.to.addresses.length;

            aTransaction.from.amount     = nInputSum / WebDollarCoins.WEBD;
            aTransaction.from.amount_raw = nInputSum;

            $oBlockData.trxs_number = 1;
            $oBlockData.trxs.push(aTransaction);
        }

        return $oBlockData;
    }

    pendingTransactions(req, res) {
        let aTransactions = [];

        Blockchain.blockchain.transactions.pendingQueue.list.forEach((oTransaction) => {
            console.log(oTransaction);
            aTransactions.push(oTransaction.toJSON());
        })

        return {result: true, transactions: aTransactions};
    }
}

export default new NodeAPICustom();
