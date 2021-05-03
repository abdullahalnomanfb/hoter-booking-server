const express = require('express');
const cors = require("cors");
const app = express();
const admin = require('firebase-admin');
require('dotenv').config()
console.log(process.env.DB_USER);

const port = 4000;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ez7qy.mongodb.net/bujAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(express.json())
app.use(cors())



var serviceAccount = require("./configs/hotel-noman-firebase-adminsdk-xxi4b-82901f74b1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


client.connect(err => {
  const bookingCollection = client.db("bujAlArab").collection("bookings");


  app.post('/addBooking', (req, res) => {

    const newBooking = req.body;
    bookingCollection.insertOne(newBooking)

      .then(result => {
        res.send(result.insertedCount > 0)
      })
    console.log(newBooking);
  })


  app.get('/bookingDetails', (req, res) => {

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {

      const idToken = bearer.split(' ')[1];

      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail =req.query.email;
          if (tokenEmail == req.query.email) {


            bookingCollection.find({ email: req.query.email })
              .toArray((err, document) => {

                res.status(200).send(document)
              })

          }
          else{
            res.status(401).send("UnAuthorize accessed")
          }
        })
        .catch((error) => {
          res.status(401).send("UnAuthorize accessed")
        });
    }
    else{
      res.status(401).send("UnAuthorize accessed")
    }


  })

});

app.get('/', (req, res) => {

  res.send("Hello Bangladesh")

})

app.listen(port, () => console.log("Port listing"))