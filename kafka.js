module.exports = () => {
  class KafkaConsumerExecuter {
    constructor(kafkaConsumer) {
      this._kafkaConsumer = kafkaConsumer;
      this._kafkaConsumer.on('message', message => {
        this._getMetric(JSON.parse(message.value));
      });
    }

    //    {
    //        "metrics": [],
    //        "dimensions": {}
    //    }
    async _getMetric(contents) {
      //TODO parseMetric
      let application = "search";
      let datacenter = "slc";
      const time = Date.getTime();
      let searchCount = 50000;
      let cpuUsage = 46;

      try {
        const dimensions = contents.dimensions;
        const metrics = contents.metrics;

        application = dimensions.application;
        datacenter = dimensions.datacenter;

        for (let i = 0; i < metrics.length; i++) {
          if (metrics[i].name === 'cpuUsage') {
            cpuUsage = metrics[i].values;
          }
          if (metrics[i].name === 'searchCount') {
            searchCount = metrics[i].values;
          }
        }
      } catch (e) {
        // parse Error
        console.log('parse metric error');
      }

      const commands = [];
      commands.push(['zadd', 'ebay:' + application + ':' + datacenter + ':searchCount'], time, searchCount);
      commands.push(['zadd', 'ebay:' + application + ':' + datacenter + ':cpuUsage'], time, cpuUsage);
      redisClient.multi(commands).exec((error) => {
        if (error) {
          console.log("redis zadd error");
        }
      });

    }

  }

  return KafkaConsumerExecuter;
};
