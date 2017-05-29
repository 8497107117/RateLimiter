const express = require('express');
const morgan = require('morgan');
const app = express();
const rateLimiter = require('./index.js');

app.set('port', process.env.PORT || 3000);

//  Disable X-Powered-By Header
app.disable('x-powered-by');

//  Configure express to use bodyParser
app.use(morgan('dev'));

//  Static file
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/semantic'));

app.listen(app.get('port'), () => {
  console.log('Http server is listening on ' + app.get('port'));
});

app.use(rateLimiter({ requestLimit: 10, resetTime: 10000 }));

app.get('/', (req, res) => {
  res.send('GETTTTTT');
});
