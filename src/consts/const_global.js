const uuid = require('uuid');
import FallBackNodesList from 'node/sockets/node-clients/service/discovery/fallbacks/fallback_nodes_list';
const BigNumber = require('bignumber.js');
const BigInteger = require('big-integer');

let consts = {

    DEBUG: false,
    OPEN_SERVER: true,

};

consts.BLOCKCHAIN = {

    DIFFICULTY:{
        NO_BLOCKS : 10,
        TIME_PER_BLOCK : 40, //in s, timestamp in UNIX format
    },

    TIMESTAMP:{
        VALIDATION_NO_BLOCKS: 10,
        NETWORK_ADJUSTED_TIME_MAXIMUM_BLOCK_OFFSET: 10*60,
        NETWORK_ADJUSTED_TIME_NODE_MAX_UTC_DIFFERENCE: 10*60,
    },

    BLOCKS_POW_LENGTH: 32,
    BLOCKS_MAX_TARGET: new BigNumber("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
    BLOCKS_MAX_TARGET_BIG_INTEGER: new BigInteger("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", 16),
    BLOCKS_MAX_TARGET_BUFFER: Buffer.from("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", "hex"),
    BLOCKS_NONCE : 4,

    LIGHT:{

        VALIDATE_LAST_BLOCKS: 10 , //overwrite below
        SAFETY_LAST_BLOCKS: 40, //overwrite below

        SAFETY_LAST_BLOCKS_DELETE_BROWSER: 500, //overwrite below
        SAFETY_LAST_BLOCKS_DELETE_NODE: 100, //overwrite below

        SAFETY_LAST_ACCOUNTANT_TREES: 50, //overwrite below
        SAFETY_LAST_ACCOUNTANT_TREES_TO_DELETE: 150, //overwrite below

        SAFETY_LAST_BLOCKS_DELETE: undefined,

        GZIPPED: true,

    },

    FORKS:{

        //forks larger than this will not be accepted
        IMMUTABILITY_LENGTH: 10,

    },

    HARD_FORKS : {

        TRANSACTIONS_BUG_2_BYTES: 46950,

        TRANSACTIONS_OPTIMIZATION: 153060,
        DIFFICULTY_TIME_BIGGER: 153060,
        WALLET_RECOVERY: 153060,

        DIFFICULTY_REMOVED_CONDITION: 161990,

    }

};

consts.BLOCKCHAIN.LIGHT.SAFETY_LAST_BLOCKS_DELETE = (process.env.BROWSER ? consts.BLOCKCHAIN.LIGHT.SAFETY_LAST_BLOCKS_DELETE_BROWSER : consts.BLOCKCHAIN.LIGHT.SAFETY_LAST_BLOCKS_DELETE_NODE );

consts.BLOCKCHAIN.LIGHT.VALIDATE_LAST_BLOCKS = consts.BLOCKCHAIN.DIFFICULTY.NO_BLOCKS * 2 ;
consts.BLOCKCHAIN.LIGHT.SAFETY_LAST_BLOCKS = consts.BLOCKCHAIN.LIGHT.VALIDATE_LAST_BLOCKS + 2* consts.BLOCKCHAIN.DIFFICULTY.NO_BLOCKS ;

consts.MINI_BLOCKCHAIN = {

    TOKENS: {

        OTHER_TOKENS:{
            LENGTH: 24,
            ACTIVATED: -1, // not activated
        },

        WEBD_TOKEN:{
            LENGTH: 1,
            VALUE: 0x01,
        }

    }
};


consts.POPOW_PARAMS={
    m: 30, //length proof Pi for validating the Genesis

    k: 30, //length proof Xi for Accountant Tree
    k1: 30, //length

    d: 0.5,

    ACTIVATED : true,
};


consts.TRANSACTIONS = {

    VERSIONS:{
        SCHNORR_VERSION: 0x01,
    },

    SIGNATURE_SCHNORR:{
        LENGTH : 64
    },

};

consts.SPAM_GUARDIAN = {

    TRANSACTIONS:{
        MAXIMUM_IDENTICAL_INPUTS: 10,
        MAXIMUM_IDENTICAL_OUTPUTS: 255,
    }

};

consts.ADDRESSES = {

    PRIVATE_KEY:{
        WIF:{
            VERSION_PREFIX : "80", //it is in HEX
            CHECK_SUM_LENGTH : 4, //in bytes
        },
        LENGTH : 64, //ending BASE64 HEX
    },
    PUBLIC_KEY:{
        LENGTH : 32, //ending BASE64 HEX
    },

    ADDRESS:{

        USE_BASE64 : true,

        LENGTH : 20,

        WIF:{
            LENGTH: 0,

            VERSION_PREFIX : "00", //ending BASE64 HEX
            CHECK_SUM_LENGTH : 4, //in bytes   //ending BASE64 HEX

            PREFIX_BASE64 : "584043fe", //BASE64 HEX  WEBD$
            //WEBD  584043
            //WEBD$ 584043FF

            SUFFIX_BASE64 : "FF", //ending BASE64 HEX
            //#w$ EC3F
            //%#$ 8FBF

            PREFIX_BASE58 : "00", //BASE58 HEX and it will be converted to Base64/58
            SUFFIX_BASE58 : "",
        }

    },

};

let prefix = ( consts.ADDRESSES.ADDRESS.USE_BASE64 ? consts.ADDRESSES.ADDRESS.WIF.PREFIX_BASE64 : consts.ADDRESSES.ADDRESS.WIF.PREFIX_BASE58);
let suffix = ( consts.ADDRESSES.ADDRESS.USE_BASE64 ? consts.ADDRESSES.ADDRESS.WIF.SUFFIX_BASE64 : consts.ADDRESSES.ADDRESS.WIF.SUFFIX_BASE58);
consts.ADDRESSES.ADDRESS.WIF.LENGTH = consts.ADDRESSES.ADDRESS.LENGTH + consts.ADDRESSES.ADDRESS.WIF.CHECK_SUM_LENGTH + consts.ADDRESSES.ADDRESS.WIF.VERSION_PREFIX.length/2 + prefix.length/2 + suffix.length/2;

consts.HASH_ARGON2_PARAMS = {
    salt: 'Satoshi_is_Finney',
    saltBuffer: Buffer.from("Satoshi_is_Finney"),
    time: 2,
    memPower: 8,
    memBytes: 256,
    parallelism: 2,
    //argon2d
    algoNode: 0,
    algoBrowser: 0,
    hashLen: 32,
    distPath: 'https://antelle.github.io/argon2-browser/dist'
};

// change also to Browser-Mining-WebWorker.js

//DATABASE NAMES
consts.DATABASE_NAMES = {

    DEFAULT_DATABASE: "defaultDB"+(process.env.INSTANCE_PREFIX||""),

    WALLET_DATABASE: "defaultDB2"+(process.env.INSTANCE_PREFIX||""),

    //TODO IT SHOULD BE REPLACED with "walletDB",

    BLOCKCHAIN_DATABASE:{
        FOLDER:"blockchainDB3"+(process.env.INSTANCE_PREFIX||""),
        FILE_NAME : 'blockchain4.bin',
    },

    POOL_DATABASE: "poolDB"+(process.env.INSTANCE_PREFIX||""),
    SERVER_POOL_DATABASE: "serverPoolDB"+(process.env.INSTANCE_PREFIX||""),
    MINER_POOL_DATABASE: "minerPoolDB"+(process.env.INSTANCE_PREFIX||""),

    VALIDATE_DATABASE: "validateDB"+(process.env.INSTANCE_PREFIX||""),
    TESTS_DATABASE: "testDB"+(process.env.INSTANCE_PREFIX||""),
    TRANSACTIONS_DATABASE: "transactionsDB"+(process.env.INSTANCE_PREFIX||"")

};

consts.MINING_POOL_TYPE = {

    MINING_POOL_DISABLED: 0,

    MINING_POOL_SERVER: 1,
    MINING_POOL: 2,
    MINING_POOL_MINER: 3,

};

consts.MINING_POOL = {

    MINING_POOL_STATUS : (process.env.MINING_POOL_STATUS || consts.MINING_POOL_TYPE.MINING_POOL_DISABLED),

    MINING:{
        MINING_POOL_MINIMUM_PAYOUT: 200000,
        FEE_PER_BYTE: 600, // in WEBD
        MAXIMUM_BLOCKS_TO_MINE_BEFORE_ERROR: 13
    },

    CONNECTIONS:{

        NO_OF_IDENTICAL_IPS: 80,

    },

    SEMI_PUBLIC_KEY_CONSENSUS: undefined, //undefined or an array of SEMI_PUBLIC_KEYS



};

consts.SETTINGS = {

    UUID: uuid.v4(),

    NODE: {

        VERSION: "1.197.1",

        VERSION_COMPATIBILITY: "1.174",
        VERSION_COMPATIBILITY_POOL_MINERS: "1.174",

        VERSION_COMPATIBILITY_UPDATE: "",
        VERSION_COMPATIBILITY_UPDATE_BLOCK_HEIGHT: 0,

        PROTOCOL: "WebDollar",
        SSL: true,

        PORT: 80, //port
        MINER_POOL_PORT: 8086, //port

    },

    PARAMS: {
        FALLBACK_INTERVAL: 10 * 1000,                     //miliseconds
        STATUS_INTERVAL: 40 * 1000,
        LATENCY_CHECK: 5*1000,
        MAX_ALLOWED_LATENCY: 10*1000,  //miliseconds
        CONCURRENCY_BLOCK_DOWNLOAD_MINERS_NUMBER: (process.env.BROWSER? 10 : 30),


        WAITLIST: {
            TRY_RECONNECT_AGAIN: 30 * 1000,             //miliseconds
            INTERVAL: 2 * 1000,                         //miliseconds

            //banned nodes
            BLOCKED_NODES: [ ], //addresses that will be blocked example: "domain.com"
        },

        SIGNALING: {
            SERVER_PROTOCOL_CONNECTING_WEB_PEERS_INTERVAL: 2 * 1000,
        },

        MAX_SIZE: {
            BLOCKS_MAX_SIZE_BYTES : 1 * 1024 * 1024 ,       // in bytes
            SOCKET_MAX_SIZE_BYRES : 3 * 1024 * 1024 + 50,    // in bytes

            SPLIT_CHUNKS_BUFFER_SOCKETS_SIZE_BYTES: 32 * 1024, //32 kb
            MINIMUM_SPLIT_CHUNKS_BUFFER_SOCKETS_SIZE_BYTES: 32 *1024, //32 kb
        },

        WALLET:{
            VERSION: "0.1"
        },

        CONNECTIONS:{

            NO_OF_IDENTICAL_IPS: 20,

            SOCKETS_TO_PROPAGATE_NEW_BLOCK_TIP: 100,

            TERMINAL:{

                CLIENT: {

                    MAX_SOCKET_CLIENTS_WAITLIST: 3,
                    MAX_SOCKET_CLIENTS_WAITLIST_FALLBACK: 3,

                    MIN_SOCKET_CLIENTS_WAITLIST: 0,
                    MIN_SOCKET_CLIENTS_WAITLIST_FALLBACK: 2,

                    SERVER_OPEN:{
                        MAX_SOCKET_CLIENTS_WAITLIST: 5,
                        MAX_SOCKET_CLIENTS_WAITLIST_FALLBACK: 3,
                    },

                    SSL:{
                        MAX_SOCKET_CLIENTS_WAITLIST_WHEN_SSL: 20,
                        MAX_SOCKET_CLIENTS_WAITLIST_FALLBACK_WHEN_SSL: 10,
                    },
                },


                SERVER: {
                    MAXIMUM_CONNECTIONS_FROM_TERMINAL: 400,
                    MAXIMUM_CONNECTIONS_FROM_BROWSER: 0,

                    MAXIMUM_CONNECTIONS_FROM_BROWSER_POOL: 2000,
                    MAXIMUM_CONNECTIONS_FROM_TERMINAL_POOL: 2000,

                    TERMINAL_CONNECTIONS_REQUIRED_TO_DISCONNECT_FROM_FALLBACK: 10,
                },

            },

            BROWSER:{

                CLIENT: {
                    MAXIMUM_CONNECTIONS_IN_BROWSER_WAITLIST: 4,
                    MAXIMUM_CONNECTIONS_IN_BROWSER_WAITLIST_FALLBACK: 2,

                    MIN_SOCKET_CLIENTS_WAITLIST: 0,
                    MIN_SOCKET_CLIENTS_WAITLIST_FALLBACK: 1,
                },

                SERVER: {},

                WEBRTC: {
                    MAXIMUM_CONNECTIONS: 13,
                },

            },

            COMPUTED: {
                CLIENT:{

                },
                SERVER:{

                },
            },

            FORKS:{
                MAXIMUM_BLOCKS_TO_DOWNLOAD: 300,
                MAXIMUM_BLOCKS_TO_DOWNLOAD_TO_USE_SLEEP: 30,
            },

            TIMEOUT: {
                WAIT_ASYNC_DISCOVERY_TIMEOUT: 7500,
            }

        },

    },

    MEM_POOL : {

        TIME_LOCK : {
            TRANSACTIONS_MAX_LIFE_TIME_IN_POOL_AFTER_EXPIRATION: 2 * consts.BLOCKCHAIN.LIGHT.VALIDATE_LAST_BLOCKS,
        },

        MAXIMUM_TRANSACTIONS_TO_DOWNLOAD: 100,

    }
};

consts.TERMINAL_WORKERS = {

    // file gets created on build
    CPU_WORKER_NONCES_WORK: 700,  //per seconds

    CPU_CPP_WORKER_NONCES_WORK: 0,  //per second   0 is undefined
    CPU_CPP_WORKER_NONCES_WORK_BATCH: 500,  //per second

    //NONCES_WORK should be way bigger than WORK_BATCHES


    //TODO
    GPU_WORKER_NONCES_WORK: 20000, //per blocks, should be batches x 10 seconds
    GPU_WORKER_NONCES_WORK_BATCH: 200, //per blocks

    /**
     * cpu
     * cpu-cpp
     * gpu
     */
    TYPE: "cpu", //cpu-cpp

    // file gets created on build
    PATH: './dist_bundle/terminal_worker.js',
    PATH_CPP: './dist_bundle/CPU/argon2-bench2',
    PATH_GPU: './dist_bundle/GPU/argon2-gpu-test',

    GPU_MODE: "opencl", //opencl
    GPU_MAX: 1,
    GPU_INSTANCES: 1,

    // make it false to see their output (console.log's, errors, ..)
    SILENT: true,

    // -1 disables multi-threading.
    //  0 defaults to number of cpus / 2.
    //
    //  Threading isn't used:
    //  - if it detects only 1 cpu.
    //  - if you use 0 and u got only 2 cpus.
    CPU_MAX: -1, //for CPU-CPP use, 2x or even 3x threads
};

if (process.env.MAXIMUM_CONNECTIONS_FROM_BROWSER !== undefined)
    consts.SETTINGS.PARAMS.CONNECTIONS.TERMINAL.SERVER.MAXIMUM_CONNECTIONS_FROM_BROWSER = process.env.MAXIMUM_CONNECTIONS_FROM_BROWSER;

if (process.env.MAXIMUM_CONNECTIONS_FROM_TERMINAL !== undefined)
    consts.SETTINGS.PARAMS.CONNECTIONS.TERMINAL.SERVER.MAXIMUM_CONNECTIONS_FROM_TERMINAL = process.env.MAXIMUM_CONNECTIONS_FROM_TERMINAL;


if ( consts.DEBUG === true ){

    consts.SETTINGS.NODE.VERSION = "3"+consts.SETTINGS.NODE.VERSION;
    consts.SETTINGS.NODE.VERSION_COMPATIBILITY = "3"+consts.SETTINGS.NODE.VERSION_COMPATIBILITY;
    consts.SETTINGS.NODE.SSL = false;
    consts.MINING_POOL.MINING.MAXIMUM_BLOCKS_TO_MINE_BEFORE_ERROR = 10000;

    consts.SETTINGS.NODE.PORT = 8085;

    //consts.BLOCKCHAIN.HARD_FORKS.TRANSACTIONS_BUG_2_BYTES = 100;

    FallBackNodesList.nodes = [{
        "addr": ["http://127.0.0.1:8085"],
    }];


}

consts.HARD_FORKS = {
    DATA: {
        153060: {
            BLOCK_NUMBER: 153060,
            ADDRESS_BALANCE_REDUCTION: {
               "WEBD$gCI4g2ePRP6oyfVdqF1e4f36CSEnjMus0D$":-72493010000,
               "WEBD$gAL20HcccJv#7yb7FAW4PBLF$GuznBNppj$":-59500000000,
               "WEBD$gCs#kIRWjk6VK1me23wVbVhcvifxNRH@kr$":-50002410000,
               "WEBD$gAUA2qpu@fdF8mbYiK09CrPepZ2kF3us+T$":-3410370000,
               "WEBD$gCNa0reZgVBZ4Ao9$Fdxg7jJT7t9IzZdHr$":-30000000000,
               "WEBD$gD$XiN5r1uVU#QgZRhM@en8dR1xLB@BEtf$":-331776851311,
               "WEBD$gAoKHsE#ofUgDR5nBXzz$d2osXUkQKG8YT$":-30000000000,
               "WEBD$gDvsqIt28D+JGYDgH3a$zfKdtnSDIoBfMj$":-30000000000,
               "WEBD$gBf3aFQ3x60Sy7IjKW11PKRBsBU7g$BtTP$":-5150200000,
               "WEBD$gDUF#9udyMBunHuckI#qy18NQQ@GXCyGFv$":-24849400000,
               "WEBD$gCvEEh7t36zJ1HwcywEtPg3uB+hwqv#6nr$":-15000000000,
               "WEBD$gB+jFjcYkZvSmN$4MrbooUmPkiIgpWMupT$":-7679600000,
               "WEBD$gDpL+ZrWG@FZ@W44AH5b@XKNL6Nm@EtrWP$":-27509492,
               "WEBD$gDqHf#7XqVXb3A+SThuM9YJ0Vk7APs9Sh3$":-11234900000,
               "WEBD$gCGdPQLohdeHQqa+ptoJ@QK2LCvN7IS5JX$":-144304338450,
               "WEBD$gAizMSPYd8bbEnj#msFfKhyGYKtc4eZq$f$":-500514150000,
               "WEBD$gBgoD@HGUkzJYKaT+9P06YHi42P13A5C@3$":-499484250000,
               "WEBD$gCyRA$hcf69sIeWy@Vqqv6gZY@i7tFywcL$":-1000000100000,
               "WEBD$gBBUX#hpTTM707GHUhH$EEchYmKumNm3V7$":-10000400000,
               "WEBD$gD7zdUjrGsQCdTxfYYBetGDPo$3hPdRfoj$":-158771170000,
               "WEBD$gD6N6#@M@Tur+q7a4GdMq0AGikucD06+S$$":-106544640000,
               "WEBD$gD+BhYnHP6Hq638Q#ULMAVK6hcx+1894or$":-146495900000,
               "WEBD$gDU+tP3@42@L9$Is463vDJi4IKrabPNNn$$":-312439297,
               "WEBD$gBCkW6zQQSwo0AQ95RcLtGIi$egexiFNzn$":-69999600000,
               "WEBD$gBwfMzq00SvfSZtiYDgZBPZDX+ECV0IuTf$":-9999800000,
               "WEBD$gD6kjAok9mL$r9eLPv1$LCCq39yai9Hi0f$":-60000000000,
               "WEBD$gDzwF0ArIz2UrWfk0n64Byc2KeIYnf8z3j$":-33721550,
               "WEBD$gC3bRwhM8cciLCJnnPtr22Not0N4N4LSW3$":-241290700000,
               "WEBD$gAuVnxLUbZc#tJ2Gm+Lqh6Qqr#ZJxVgQ#j$":-10000500000,
               "WEBD$gDjtNXangkzYJxRLWhBPwSSDMC0ha$gbCz$":-7200100000,
               "WEBD$gBkeL04WBpUdFfi6AAm$334VxLaHiu3x8r$":-120100000,
               "WEBD$gCt0MQmg0TP0CEICyKqzJjoAjzLkg$66$P$":-22589470,
               "WEBD$gBPJmvI1GScq6sck2o6U0jbrFe#SroRRnf$":-280000000000,
               "WEBD$gA4W9tWX3qH+mof5SUmK1PMVRno+Y9Q$Yb$":-48022350000,
               "WEBD$gCjc#Pa42$iAe1V@L4rbtGt@0WnBU@+35L$":-319999200000,
               "WEBD$gBvPUu9cpq8nMNZZe1ojGfkA8DZT87hmHH$":-200000000000,
               "WEBD$gBxgu5KhUgMyq70MxPsIDLmKghPhXLvJUH$":-13108410000,
               "WEBD$gC@AgTovodqqyBTmvcKrLayGLXU36@hraz$":-299999900000,
               "WEBD$gC3ubgck#m5U3TF@iN@FMSeK7AErZTERXv$":-269999800000,
               "WEBD$gAPIcafjmpsZDwIxfnS+6Lbbt45Pr@+pQT$":-150000000000,
               "WEBD$gARIJGw3PQ5NUG1FAqR@2x6UCwwi4qf7zX$":-149999900000,
               "WEBD$gCnnEZZqzSWYon456tYj+dy2o7kXuYp9Dj$":-78262480000,
               "WEBD$gApdUUz8oZUD@hHx4i00cM1x@QWeJy@Y33$":-10001300000,
               "WEBD$gCrP1BQqV0Qo@IotsUT3$DHmJsnkfmuKPP$":-182883970000,
               "WEBD$gDR5uT2L5ZDt93FB3ACwx@YXZMVPJvvRQj$":-45917418000,
               "WEBD$gAXv5@Zhq@tH3wFfhNgebN0yx7UP7$epsr$":-150000000000,
               "WEBD$gDj1dBsAjAUHDSmWvy$YV5wkFxPCV#QLaD$":-8803389,
               "WEBD$gDwzvvfITevWUIdgZqwoZcMeoMKepvn#Nr$":-120177480000,
               "WEBD$gBmVBdnZSVUbKphi@Q8I59N7YxLKgcUCQP$":-94162149990,
               "WEBD$gAhEJu3dVrA7JwS2rxiqqmfTWNmIT+BxRf$":-28744170000,
               "WEBD$gBimi+smpTQIVTLb37284BxMxev3mV#XJz$":-222422596978,
               "WEBD$gBpM63KeuGKLPY3vNT0bDdd1#aw4NXi9cL$":-93344030062,
               "WEBD$gBEGMkhAPFoL1vcF+yK1G0+uH0eDInoawb$":-251819829938,
               "WEBD$gD0@3NaJrALd4tf4G9+ikfZh$TUdPPMxR3$":-103404900000,
               "WEBD$gA3PjoZPNRI5DryGqZpRxJyUzbtGI2NVv3$":-359998980000,
               "WEBD$gBS@h+LUHLA#APB8eJbC8a3yqEGZdq0mKT$":-21348210011,
               "WEBD$gBRJ8PIKr0hvxkFt3Tj2hL@BpfIR7NFtUP$":-207464570000,
               "WEBD$gBxLoPf3ybmpGx0t5meR+Z$R9M9rCGDe5T$":-137182353011,
               "WEBD$gBQSyf58N6#JhE8c@nIp9Qr+CGUv+FWp2L$":-144499160000,
               "WEBD$gCAqs7bwLf8ku0C8Q+xtpKY9GiBophnbx7$":-239123450000,
               "WEBD$gCX@b7opCEWMNYN+91E1CuM7m@vLY3usTb$":-349999700000,
               "WEBD$gD2u2PFecv#fm0wYtcAcb0YRem9QsEGq@$$":-28680208611,
               "WEBD$gAzygvuF2zrtu3NoqFkUUfswidob8YPuGn$":-150000200000,
               "WEBD$gDxFq+B+zb8$YMB8ivofB95VnecR$NeLLH$":-11201240000,
               "WEBD$gCaUzkhg7nqaBqPIUKm5fU3g8it1GX3#tT$":-234120010000,
               "WEBD$gBnziQMgSNb2ruoi3$UAuhrjGM$h5j$Xy$$":-341230130000,
               "WEBD$gD+KWSZ2Di69H7DC4+kRN2AbCbDrXy7utz$":-171390530000,
               "WEBD$gAdNsLRkSP7xy+R#xja$4zradCd#w4RFR$$":-50972270000,
               "WEBD$gA649CP$DgMrm0rbnr3NVEE0G0AP4d5ua3$":-211175400000,
               "WEBD$gCU3ug3wLfmHVTGAcf26cfCgGatNzmRKH$$":-242997460000,
               "WEBD$gBbiWLyj8jiR4n@#D$2DrtLH$+ohfua@hL$":-200000100000,
               "WEBD$gAGk$Za$YZkxeT2f1oPjpo2HW954yQp7GD$":-149999600000,
               "WEBD$gBy1N+LDIuFTnkHriQgidPnUEMVb9MfWMr$":-230120000000,
               "WEBD$gCrEhDsa9Wv$@x3QkNd4jbNcb5bISk8Nyv$":-99373170892,
               "WEBD$gBJs7+TLZ@n+Q1qsCtGy8Nn01Mi6MGEIAv$":-223910140000,
               "WEBD$gCbdIAe5LWM1Xb4IP9Byz+$V2To0AC9t$n$":-11159574900,
               "WEBD$gBm0hR+aPZvfX@bMMMQ6fL05oA0x6ea3f$$":-391829170010,
               "WEBD$gCc8Z7ftdddLmgr1TEo+3m2hFWXitIXyZ$$":-200000000000,
               "WEBD$gAHL+#rzvXvvR7Kb@0f23g+mDgiPs$D0TP$":-271289460000,
               "WEBD$gAz4X9PX0ULTHhA2AKXBi$LnxnP#jUbt9$$":-231289595100,
               "WEBD$gCK7s97a26cFRcoPbuUWwBeowhbuWC6zxz$":-341239000000,
               "WEBD$gA90tUrPr5eMCP4GDXCiWnu06B7AympBdj$":-6125280000,
               "WEBD$gAVIvJkcgYPJqEgZbLEdM6Ek7envuKahez$":-24815230000,
               "WEBD$gAfhsHT@9UN9f6st4XYAkCbFFLenC4+ECH$":-21314860000,
               "WEBD$gDYYE0NY6iInHF4Zpq0P4CNxxA61iqbQ8b$":-10516425,
               "WEBD$gDzXma7QQmI7fEUz3KvVZCv$ve@b6m8+GT$":-41234880000,
               "WEBD$gBSxkSLKMXKT6bhYt6NIFg263@dWT@SZmL$":-23104190000,
               "WEBD$gC5R8X7Gx+2Kb3bR@T88KtgJh5vkfbSj+T$":-32218700000,
               "WEBD$gBGMtzDgCbt2JhNSDpVaz7D7qkKFx8MhUf$":-108970000,
               "WEBD$gBbPs8Gv6JCz7@KxjQ3@H@xp8vh7MeGMyH$":-49461919,
               "WEBD$gA21Vt6kkRp5JAVmhyLpo3bSB6$booRp53$":-199999700000,
               "WEBD$gDV0fZ3mqyISBMkF8WgyahxGT6YaoFj+cr$":-573590000,
               "WEBD$gBHyCPzLYNgx8NzxKzbHyp38c9aa#jhjif$":-499700000,
               "WEBD$gCPV@HU$MuqSi7pNbpzmQ8QLVhpobEVu8T$":-499900000,
               "WEBD$gC3hRqSB0$uCVGnLXYWwjyTMbznac#VFRj$":-499700000,
               "WEBD$gAtVASM@IUcS1r2Su6qcCzIHLS6ieEZF$7$":-2000000000,
               "WEBD$gAm+yjRtQbFguheGcLXC+oYpTLiF8D4ahP$":-500000000,
               "WEBD$gA#iyA+7PiHD@rZAQBLvCL0cNiJ#83y9eX$":-383455980000,
               "WEBD$gBBJnCJCf4$c#LRuFzm@u9q@bev6XkpbJv$":-8422396,
               "WEBD$gCFnrZ+kQfaaorL1#k58bb$DmI2FuKpqGP$":-220000000000,
               "WEBD$gB17T@oR2wD8qD8+aMNby9MceJ9q2zJX@j$":-49999900000,
               "WEBD$gBkoyiZqay9@EEwVM9NB7E#e6tdU4Ihboz$":-7813948,
               "WEBD$gB@KqDwI08#5$o9otmP8KytRTL35MvNz8f$":-38361910,
               "WEBD$gBxMqjDJRYpme+dPx1J0I8uZqU9q425p$$$":-2894484,
               "WEBD$gDRMhq32+WmDtYeutjMDNQGXAUECYRnwFn$":-134500000,
               "WEBD$gB@Ip5RDeQTiWaBZ4J2#WJxSWLYCvn2Z4H$":-9874207,
               "WEBD$gC+Z$NBVyK7A89G8g@@EDdd7VT0f6xke2$$":-9999200000,
               "WEBD$gCffq7YwMMwj3vto7xgU#WZcgmApX+BGu3$":-16283673,
               "WEBD$gCH9+bhxX4ATZ9jIC0j7KE0Q89ITGywUuz$":-11940689,
               "WEBD$gA7FdyqTnFWFaxuL3FBgBci6od97UXddgv$":-2652756,
               "WEBD$gB0Zvmd$8AoLgVf4IcEEexx6F+PzARRPEr$":-132480720000,
               "WEBD$gAWq@bFDn+4XUZP+u$I1y+yWkt#q#Db7VD$":-127070780000,
               "WEBD$gAIWP7063NES4JCozjVVHz50MaGte+CY33$":-139012740000,
               "WEBD$gCWv43BYS3DSGnaW1KbZWBhrV8b4u7oTJ$$":-227311340000,
               "WEBD$gASKTKyJuhbJ8NFqGkQSsUo$c9KSwmxixX$":-139107740000,
               "WEBD$gBRMpicC7HBjFFGwC9v6o7MQ5ILAq40ovL$":-129860620000,
               "WEBD$gBSu7peg@KhCI3@wgWriPG@7dzYovZR3AD$":-161370120000,
               "WEBD$gB#TZVrt@DLNREsSLSRoJEI5xbLa6ddGCH$":-61322310000,
               "WEBD$gDN1JaxGDVqqohDJfko8VI6v$GrgGfr+Rr$":-137878070000,
               "WEBD$gDxzNVw2tDey9v2vboZdY5Q5V5U9nNGr+$$":-157418940000,
               "WEBD$gC8CCLVkxBrFSfbP7nCcVsKYxcZCp#vzP3$":-198234410000,
               "WEBD$gD1wFizfTDKrSo@mjDFbQYwz6Lhu#8tTEn$":-166896190000,
               "WEBD$gC0Sm11z5zWfLygx5ICIVFH1+0jHit$odf$":-70719220000,
               "WEBD$gDk6mMd8oDYzL$8DYt7Sz5J8vXztcjevDT$":-2500000000,
               "WEBD$gD33iHJfp@wvyK+W+pLWArtsnKULogvoFn$":-9533475,
               "WEBD$gD2RPbxY2aDdeARyTtbC4E4nK@Fwji@aKD$":-6999800000,
               "WEBD$gCGBGwcTpnaTr2@gio7yyrThvi+yTeVWB7$":-15000100000,
               "WEBD$gBQrCvn5Q@Tg@0HeVdMwhKy5LJ7nWy$M+f$":-15000000000,
               "WEBD$gCMj3A$FxVxKRhYG8vkt0EjQ0Z05dCokHr$":-4640568,
               "WEBD$gAhRhbz180ia0i$5yijVPjMNZD0YH9oouD$":-6870936,
               "WEBD$gDkcRvzFLCUJdrG1rW1xv4GHjmAsDZn2sf$":-9999900000,
               "WEBD$gBp4e0DK$E9C@MMwm4tZC@KhvhITJ4+MPr$":-5714629,
               "WEBD$gBL6Hn+e9YVI4cq+gsFSbHArT@Y23xFN1H$":-10000000000,
               "WEBD$gAArIuXCHU6a6xzTH6D7a4S$smI4P0NIxL$":-141231850000,
               "WEBD$gCi8L4Vaf8iP0MhunDuaRH@AUDo@nb7avX$":-179827160000,
               "WEBD$gDC6REUPFdRxThPbjx@YtW5Eaw9C0apEQf$":-19286740000,
               "WEBD$gCqDQ9st8FdEQG61ZA3PGy7Nj4z5QKcSqn$":-280000100000,
               "WEBD$gDSd+tpb$iSZJTEIgqUT0zMdEZYda$vE6f$":-157289120000,
               "WEBD$gDdhxx8vd@bjgysGD1$a$vV8Y#KZa3I$$v$":-7265890000,
               "WEBD$gDHJSnzd668fsD4yNhzv0j38ANzFbvB6vz$":-269999300000,
               "WEBD$gDmq72gmMouQwhAWDK+wjAyvvRRFZyJLCX$":-140281470000,
               "WEBD$gD3WudTLr4kSRITpGharqUjz1PP0hxvdI3$":-39284670000,
               "WEBD$gAc6rAn#H2CzzgjZDDdBf1yRNf4vApeRq3$":-56275890000,
               "WEBD$gDpXFWDI9mmmTuh37RVAR5FGWRR5#L3MnH$":-9999900000,
               "WEBD$gCagYVpZhzCQ9zcGidBAvwgTU48kSGb78v$":-173857280000,
               "WEBD$gAk$$iUsgo4IhXZhuRS5f8sLX5S2AqEE@b$":-120347280000,
               "WEBD$gAQ+3dz3VYaCjCp5P#e$1Soapn#Qk7LiZb$":-182934560000,
               "WEBD$gDEgfy8hR1qpYV@JSaX5XzFBUkxXIEI3dX$":-132560980000,
               "WEBD$gBI#Eyw1BgP1IRmkeTIUURG6IFiITmPbmv$":-119385290000,
               "WEBD$gB3pU9dauUiBF1IZvvo#ytNMjNWERPI9dr$":-151920590000,
               "WEBD$gBi6+938WxuV7h4La6tJfTe11oGXKEarxH$":-179347650000,
               "WEBD$gBmixTZVcniKeamnV5u2$sIRyqUVwDc00b$":-10000000000,
               "WEBD$gBSe9a603w6rAMmVL4sEmgd35RXaSL1F53$":-137829120000,
               "WEBD$gAhD9TsWRHNKYKJNqVhnUZ9BM0ewjW+Den$":-5000100000,
               "WEBD$gAYIX8zoFX$a7qDycXX72pGQvn47xt3fDT$":-239827480000,
               "WEBD$gAyQEB2Im2WFNGghyQjCHaDXBKDeZL8wNz$":-349998800000,
               "WEBD$gAGD8R+dUoBBawcbZz4KvTDB1CntfMT01H$":-172839430000,
               "WEBD$gDc6aQ9s2UzsDgDCCAozS0yko9g91nWpLb$":-6909445,
               "WEBD$gDRhRUNccBHdE@nAoCVDtRnZMzCfg+VJSP$":-20273860000,
               "WEBD$gDLLEm+$LoVe6#YVD1vKEzvL7Sn$@mEBs7$":-151220100000,
               "WEBD$gCNc4HDG$muyALFU2jQ#W6n8KfyqNGoIjn$":-151238510000,
               "WEBD$gDhutwWAiR1@6ve0Zx82HpSYDPJQ4Nym8b$":-5000100000,
               "WEBD$gDzUg9Cp1AnuS2VIuXryMc9w0cgunyXZo3$":-9999900000,
               "WEBD$gA$YdXWCFiysHfFk3Nx$kAK7ULWY2mNUP$$":-9999900000,
               "WEBD$gBF8G5jzL4VqGxRju$G$cqx5wGeCo@6jAn$":-9999900000,
               "WEBD$gA7npK@#CUjgJDXeN+mV1JBKE@x6HfX96z$":-10984480000,
               "WEBD$gC2KYkbfa75xubnfe@qWGxxI#ggteFPncr$":-14999700000,
               "WEBD$gBE#$v6NioM+Mv#wYttU2wA8r0XKFh$K8r$":-15799800000,
               "WEBD$gCgNEoB$pXIaLjaIVqBjToHu02zx66g$hn$":-14199800000,
               "WEBD$gC7syvQJkaBVEqTpPqFpZSeqybKg1yEDhX$":-14999800000,
               "WEBD$gDTuta10xebyc4hqIEofSvvviaVBxQPZmD$":-18000000000,
               "WEBD$gA1Pz3fdN1ij9B4Kyg6N88yT8xz8usp@iv$":-3000100000,
               "WEBD$gDv3YLjBxyQ#DRR$6f13g12d2BqXpbJxSD$":-23000000000
            },
            BLOCK_PROBLEM_DETECTED: 150940,
            GENESIS_ADDRESSES_CORRECTION: {
                FROM: {
                    ADDRESS: 'WEBD$gC9h7iFUURqhGUL23U@7Ccyb@X$2BCCpSH$',
                    BALANCE: 18674877890000
                },
                TO: {
                    ADDRESS: 'WEBD$gDZwjjD7ZE5+AE+44ITr8yo5E2aXYT3mEH$',
                    BALANCE: 18674856891922
                }
            }
        }
    }
};

consts.SHARES_TRACKER = {
    enabled: false,
    httpConfig: {
        hostname: '~',
        port    : 443,
        path    : '/mining/addHashRate',
        method  : 'POST',
    },
    secretIdentifier: "~",
    sendSharesForEach: 10,
    sharesDivider: 1
}

export default consts
