const http = require('http');


async function getApi(urlParts, response) {
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Connection': 'keep-alive'
  });
  const address = urlParts.query.address;
  if (!address) {
    response.end(JSON.stringify({error: 'need address', code: 1}));
    return;
  }
  const result = await redisHgetAsync('monero:workers:' + address, 'threshold');
  const ret = {};
  if (result) {
    ret.threshold = result;
  } else {
    ret.threshold = -1;
  }
  response.end(JSON.stringify(ret));
}



const server = http.createServer((request, response) => {
  const urlParts = url.parse(request.url, true);
  switch (urlParts.pathname) {
    case '/stats': {
      const reply = currentStatsCompressed;
      response.writeHead("200", {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Content-Encoding': 'deflate',
        'Content-Length': reply.length
      });
      response.end(reply);
      break;
    }
    case '/getApi': {
      getApi(urlParts, response);
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

server.listen(config.api.port, () => {
  log('info', logSystem, 'API started & listening on port %d', [config.api.port]);
});
