const http = require('http');

const token = process.env.TOKEN || require('fs').readFileSync('.env', 'utf8').match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/)[0];

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/posts',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', data.substring(0, 500)));
});

req.on('error', e => console.error(e));
req.end();
