const redis = require('redis');
const fs = require('fs');
const kafka = require('kafka-node');
const argv = require('minimist')(process.argv.slice(2));
const cluster = require('cluster');
const API = require('./api');

let config;
try {
  if (argv.config) {
    config = JSON.parse(fs.readFileSync(argv.config));
  } else {
    config = JSON.parse(fs.readFileSync('config.json'));
  }
} catch(e){
  console.error('Failed to read config file ' + e);
  process.exit();
}


function initKafka() {
  const kafkaClient = new kafka.KafkaClient({
    kafkaHost: `${config.kafka.ip}:${config.kafka.port}`,
  });
  const kafkaConsumer = new kafka.Consumer(
    kafkaClient,
    [{ topic: config.kafka.topic, partition: process.env.forkId }]
  );
  global.kafkaConsumerExecuter = new KafkaConsumerExecuter(kafkaConsumer);
}

function initRedis() {
  global.redisClient = redis.createClient(config.redis.port, config.redis.host, {auth_pass: config.redis.auth});
}

function spawnKafka() {
  const numForks = config.worker.kafkaNumber;
  const poolWorkers = {};
  const createWorker = forkId => {
    const worker = cluster.fork({
      workerType: 'kafka',
      forkId: forkId,
    });
    worker.forkId = forkId;
    worker.type = 'worker';
    poolWorkers[forkId] = worker;
    worker.on('exit', (code, signal) => {
      console.log('worker exit');
      setTimeout(() => {
        createWorker(forkId);
      }, 2000);
    }).on('message', msg => {
      switch(msg.type) {
        default:
      }
    });
  };

  let i = 1;
  const spawnInterval = setInterval(() => {
    createWorker(i.toString());
    i++;
    if (i - 1 === numForks){
      clearInterval(spawnInterval);
      console.log('worker spawn');
    }
  }, 10);
}

function init() {
  initRedis();
  if (cluster.isWorker) {
    switch(process.env.workerType) {
      case 'kafka':
        initKafka();
        break;
      case 'api':
        require('./api');
        break;
    }
    return;
  }
  spawnKafka();
}


init();
