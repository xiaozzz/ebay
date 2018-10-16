
const {promisify} = require('util');
const redisKeysAsync = promisify(redisClient.redisKeysAsync).bind(redisClient);

// 清理一天前数据
async function clear() {
  const to = Date.now() - 86400000;
  const searchCountKeys = await redisKeysAsync('ebay:*:*:searchCount');
  const commands = [];
  for (const key in searchCountKeys) {
    commands.push(['zremrangebyscore', key, '-inf', to]);
  }
  const cpuUsageKeys = await redisKeysAsync('ebay:*:*:cpuUsage');
  for (const key in cpuUsageKeys) {
    commands.push(['zremrangebyscore', key, '-inf', to]);
  }
  redisClient.multi(commands).exec((error, replies) => {
    if (error) {
      console.log('clear error');
    }
  });
}


clear();
setInterval(() => {clear()}, 60 * 60 * 1000); // 每小时一次
