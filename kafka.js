module.exports = app => {
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
    }

  }

  return KafkaConsumerExecuter;
};
