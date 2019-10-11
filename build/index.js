'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');

var _require = require('apollo-server-express'),
    graphqlExpress = _require.graphqlExpress,
    graphiqlExpress = _require.graphiqlExpress;

var _require2 = require('graphql'),
    execute = _require2.execute,
    subscribe = _require2.subscribe;

var _require3 = require('subscriptions-transport-ws'),
    SubscriptionServer = _require3.SubscriptionServer;

var _require4 = require('http'),
    createServer = _require4.createServer;

var _require5 = require('./resolvers'),
    Message = _require5.Message;

var timestampToDate = require('date-from-timestamp');
var axios = require('axios');
var nodemailer = require('nodemailer');
var path = require('path');
var bcrypt = require('bcryptjs');
var schema = require('./schema');

var app = express();

mongoose.connect('mongodb://cristian:1q2w3e4r5t6y@ds333248.mlab.com:33248/temperatures');
var db = mongoose.connection;
db.on('error', function () {
  return console.log('Error al conectar a la BD');
}).once('open', function () {
  return console.log('Conectado a la BD!!');
});

app.use(bodyParser.json());
app.use(cors());

// se obtiene la hora
function Unix_timestamp(t) {
  var time = new Date(t * 1000).toLocaleTimeString('es-MX');
  console.log(time);
  return time;
}

// se obtiene la fecha
function Unix_timestamp_date(t) {
  var date = new Date(t * 1000).toLocaleString('es-MX');
  console.log(date);
  return date;
}

app.post('/createMessage', function (req, res) {
  var message = req.body;
  console.log(message);
  if (message.sigfox) {
    var hora = Unix_timestamp(message.timestamp);
    var fecha = Unix_timestamp_date(message.timestamp);
    console.log(hora, "hora");
    console.log(fecha, "date");

    if (message.data === "45778A") {
      return axios({
        url: 'https://back-temperature-sento.herokuapp.com/graphql',
        method: 'post',
        data: {
          query: '\n              mutation{\n                  addMessage(\n                      sigfox:"' + message.sigfox + '",\n                      timestamp:"' + fecha + '",\n                      data:"' + message.data + '"\n                  ){\n                      id\n                  }\n              }\n          '
        }
      });
    }
    return res.status(201).json({ 'message': 'Mensaje procesado', 'Dispositivo': message.device });
  } else {
    return res.status(404).json({ 'message': 'Dispositivo no encontrado', 'Dispositivo': message.device });
  }
  /* console.log('termino');
  return res.json({'message': 'Mensaje procesado', 'Dispositivo': message.device}); */
});

/* app.use('/graphql',(req,res,next) => {
    const token  = req.headers['authorization'];
    try{
        req.user = verifyToken(token)
        next();
    }catch(error){
        res.status(401).json({message:error.message})
    }
}) */

app.use('/graphql', graphqlExpress({
  schema: schema
}));

/* app.use('/graphiql', (req, res, next) => {
const token = req.headers['authorization'];
try {
  req.user = verifyToken(token);
  next();
} catch (error) {
  res.status(401).json({message: error.message});
}
}); */

// ws://back-temperature-sento.herokuapp.com/graphql
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: 'ws://back-temperature-sento.herokuapp.com/graphql'
}));

var PORT = process.env.PORT || 3030;

var server = createServer(app);
server.listen(PORT, function () {
  console.log('Server now running at port ' + PORT);
  new SubscriptionServer({
    execute: execute,
    subscribe: subscribe,
    schema: schema
  }, {
    server: server,
    path: '/graphql'
  });
});