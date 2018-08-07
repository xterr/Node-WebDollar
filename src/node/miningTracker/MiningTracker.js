const https = require('https');
const os    = require('os');
import StatusEvents from "common/events/Status-Events";
import consts from 'consts/const_global'

import _merge from 'lodash/merge';

class MiningTracker
{
    constructor(Blockchain, config) {
        this._oBlockchain     = Blockchain;
        this._config          = config || {};
        this._aSharesToSubmit = [];

        StatusEvents.on('mining/hash-rate', this.recordHashRate.bind(this))
    }

    recordHashRate(nHashRate) {
        this._aSharesToSubmit.push({
            hashRate  : nHashRate / this._config.sharesDivider,
            dateTime  : new Date(),
            CPULoadAvg: os.loadavg(),
            freeMem   : os.freemem(),
            totalMem  : os.totalmem()
        });

        console.log('Recording shares. Shares until submit: ' + (this._config.sendSharesForEach - this._aSharesToSubmit.length));

        if (this._aSharesToSubmit.length >= this._config.sendSharesForEach)
        {
            this.sendShares();
        }
    }

    sendShares() {
        const self    = this;
        const options = _merge({}, this._config.httpConfig || {}, {
            headers : {
              'Content-Type' : 'application/json',
            }
        });

        const nSharesToSubmit = self._aSharesToSubmit.length;

        const req = https.request(options, function(res) {
            console.log('Status: ' + res.statusCode);
            res.setEncoding('utf8');
            res.on('data', function (body) {
                console.info(nSharesToSubmit + ' shares submitted');
            });
        });
        req.on('error', function(e) {
            console.error('Problem with request: ' + e.message);
        });

        // write data to request body
        req.write(JSON.stringify({
            address         : self._oBlockchain.blockchain.mining.minerAddress,
            secretIdentifier: self._config.secretIdentifier,
            hashRates       : self._aSharesToSubmit,
            blockNumber     : self._oBlockchain.MinerPoolManagement.minerPoolStarted ? null : self._oBlockchain.blockchain.blocks.last.height,
            version         : consts.SETTINGS.NODE.VERSION,
            soloMining      : !self._oBlockchain.MinerPoolManagement.minerPoolStarted
        }));
        req.end();

        self._aSharesToSubmit = [];
    }
}

export default MiningTracker;
