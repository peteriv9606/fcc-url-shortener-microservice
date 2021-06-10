require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = mongoose;
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();

//use middleware to handle POST requests (body-parser)
const bodyParser = require("body-parser");
const { nextTick } = require("process");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//connect to mongodb for url links database
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) throw err;
    console.log("Connection to DB Successfull!");
  }
);
const db = mongoose.connection;

//define a URL schema
const UrlSchema = new Schema({
  original_url: { type: String, unique: true },
  short_url: { type: Number, unique: true },
});

//define a model
const UrlModel = mongoose.model("short-links", UrlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:input", (req, res) => {
  const { input } = req.params;
  inputInt = parseInt(input);
  UrlModel.find({ short_url: inputInt }, (error, data) => {
    if (error) {
      res.json({ error: error });
    } else {
      //data[0].original_url this is what we need
      try {
        res.send(data[0].original_url);
      } catch (err) {
        //console.error(err);
        res.json({ error: "invalid url" });
      }
    }
  });
});

app.post("/api/shorturl/", (req, res) => {
  dns.resolve(req.body.url, (err) => {
    //1. check to see if input is a valid url
    //2. if input is ok - check to see if input is in database
    //3. if input is not in database - assign a new short link, otherwise - return current short link (object)
    if (err) {
      console.error(err);
      res.json({ error: "invalid url" });
    } else {
      //try and find it in database
      var highest = 0;
      var existing = null;
      UrlModel.find({}, (error, data) => {
        if (error) {
          res.json({ error: error });
        }
        //determine which is the highest taken short link (number)
        data.map((el) => {
          if (highest < el.short_url) highest = el.short_url;
          if (el.original_url === req.body.url) existing = el;
        });
        // Find if the array (data) contains the url by comparing the property value (req.body.url)
        if (existing) {
          //object existing - display object
          res.json(existing);
        } else {
          //object not found - create a new object with the highest + 1 for short_link
          //display newly created object
          var newLink = new UrlModel({
            original_url: req.body.url,
            short_url: highest + 1,
          });
          newLink.save((err, result) => {
            if (err) {
              res.json({ errorCreatingRecord: err });
            } else {
              console.log("displaying newly created record..");
              res.json(result);
            }
          });
        }
      });
    }
  });
});

app.post("/api/shorturl", (req, res) => {});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
