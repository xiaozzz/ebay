const redis = require('redis');
const fs = require('fs');
const kafka = require('kafka-node');
const argv = require('minimist')(process.argv.slice(2));
const KafkaConsumerExecuter = require('./kafka');

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
    [{ topic: config.kafka.topic, partition: config.kafka.partition }]
  );
  global.kafkaConsumerExecuter = new KafkaConsumerExecuter(kafkaConsumer);
}

function initRedis() {
  global.redisClient = redis.createClient(config.redis.port, config.redis.host, {auth_pass: config.redis.auth});
}

function init() {
  initKafka();
  initRedis();
}


init();
