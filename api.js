const http = require('http');
const {promisify} = require('util');
const redisZrangebyscoreAsync = promisify(redisClient.zrangebyscore).bind(redisClient);

async function getApiSearchCount(urlParts, response) {
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Connection': 'keep-alive'
  });
  const application = urlParts.query.application ? urlParts.query.application : "search";
  const datacenter = urlParts.query.datacenter ? urlParts.query.datacenter : "slc";
  const time = urlParts.query.time ? parseInt(urlParts.query.time, 10) : 60 * 1000;
  const now = Date.getTime();

  let count = 0;
  const result = await redisZrangebyscoreAsync('ebay:' + application + ':' + datacenter + ':searchCount', now - time, now);
  if (result.length === 0) {
    response.end(JSON.stringify({data: {}, code: -1, errMsg: 'length == 0'}));
    return;
  }
  for (let i = 0; i < result.length; i++) {
    count += result[i];
  }

  response.end(JSON.stringify({data: {count}, code: 0, errMsg: ''}));
}

async function getApiCpuUsage(urlParts, response) {
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Connection': 'keep-alive'
  });
  const application = urlParts.query.application ? urlParts.query.application : "search";
  const datacenter = urlParts.query.datacenter ? urlParts.query.datacenter : "slc";
  const time = urlParts.query.time ? parseInt(urlParts.query.time, 10) : 60 * 1000;
  const now = Date.getTime();

  let result = await redisZrangebyscoreAsync('ebay:' + application + ':' + datacenter + ':cpuUsage', now - time, now);
  if (result.length === 0) {
    response.end(JSON.stringify({data: {}, code: -1, errMsg: 'length == 0'}));
    return;
  }
  // TODO string to float
  result = result.sort();
  const cpuUsage = result[Math.round(result.length * 0.95)];

  response.end(JSON.stringify({data: {cpuUsage}, code: 0, errMsg: ''}));
}


const server = http.createServer((request, response) => {
  const urlParts = url.parse(request.url, true);
  switch (urlParts.pathname) {
    case '/getApiSearchCount': {
      getApiSearchCount(urlParts, response);
      break;
    }
    case '/getApiCpuUsage': {
      getApiCpuUsage(urlParts, response);
      break;
    }
    default: {
      response.writeHead(404, {
        'Access-Control-Allow-Origin': '*'
      });
      response.end('Invalid API call');
      break;
    }
  }
});

config = global.config;
server.listen(config.api.port, () => {
  console.log('API started & listening on port %d', [config.api.port]);
});
