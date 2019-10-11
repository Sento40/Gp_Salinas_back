const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const cors = require('cors');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const {execute, subscribe} = require('graphql');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const {createServer} = require('http');
const {Message} = require('./resolvers')
const timestampToDate = require('date-from-timestamp');
const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path');
const bcrypt = require('bcryptjs');
const schema = require('./schema');

const app = express()

mongoose.connect('mongodb://cristian:1q2w3e4r5t6y@ds333248.mlab.com:33248/temperatures');
const db = mongoose.connection;
db.on('error', ()=> console.log('Error al conectar a la BD'))
    .once('open', () => console.log('Conectado a la BD!!'));

app.use(bodyParser.json());
app.use(cors());

// se obtiene la hora
function Unix_timestamp(t) {
  const time = new Date(t * 1000).toLocaleTimeString('es-MX');
  console.log(time);
  return time;
}

// se obtiene la fecha
function Unix_timestamp_date(t) {
  const date = new Date(t * 1000).toLocaleString('es-MX');
  console.log(date);
  return date;
}

app.post('/createMessage', (req, res) => {
  const message = req.body;
  console.log(message);

  const hora = Unix_timestamp(message.timestamp);
  const fecha = Unix_timestamp_date(message.timestamp);
  console.log(hora, "hora");
  console.log(fecha, "date");

  if(message.data === "45778A"){
    return axios({
      url: 'https://back-temperature-sento.herokuapp.com/graphql',
      method: 'post',
      data: {
        query: `
            mutation{
                addMessage(
                    sigfox:"${message.sigfox}",
                    timestamp:"${fecha}",
                    data:"${message.data}"
                ){
                    id
                }
            }
        `,
      },
    });
  }

})

/* app.use('/graphql',(req,res,next) => {
    const token  = req.headers['authorization'];
    try{
        req.user = verifyToken(token)
        next();
    }catch(error){
        res.status(401).json({message:error.message})
    }
}) */

app.use(
  '/graphql',
  graphqlExpress({
    schema,
  })
);

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
app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: 'ws://back-temperature-sento.herokuapp.com/graphql',
  })
);

const PORT = process.env.PORT || 3030;

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Server now running at port ${PORT}`);
  new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server,
        path: '/graphql',
      }
  );
});