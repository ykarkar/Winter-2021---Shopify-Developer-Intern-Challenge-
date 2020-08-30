// call all the required packages
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient
const myurl = 'mongodb://localhost:27017';
//CREATE EXPRESS APP
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));


MongoClient.connect(myurl, (err, client) => {
    if (err) return console.log(err)
    db = client.db('Shopify_Winter2021_Challange')
    app.listen(3333, () => {
        console.log('listening on 3333')
    })
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadedImages')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})



var upload = multer({ storage: storage })

app.use(express.urlencoded({
    extended: true
  }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/home.html');
});

app.get('/singlePhoto', (req, res) => {
    var filename = req.param("imageID");
    console.log(filename);
    var ObjectId = require('mongodb').ObjectID;
    db.collection('images').findOne({'_id': ObjectId(filename) }, (err, result) => {
     
        if (err) return console.log(err)
     
       res.contentType('image/jpeg');
       res.send(result.image.buffer)
        
      })
    });

    app.get('/showAllPhotos', (req, res) => {
        db.collection('images').find().toArray((err, result) => {
         
              const imgArray= result.map(element => element._id);
                    console.log(imgArray);
         
           if (err) return console.log(err)
           res.send(imgArray)
         
          })
        });

app.post('/uploadImages', upload.single('myImage'), (req, res) => {
    var image = fs.readFileSync(req.file.path);
    var encode_image = image.toString('base64');
    
    var imgProperty = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64'),
        name: req.file.originalname
    };
    db.collection('images').insertOne(imgProperty, (err, result) => {
        console.log(result)
        if (err) return console.log(err.field)
        console.log('saved to database')
    })

    res.send('Image stored to database successfully!');
});


app.listen(3000, () => console.log('Server started on port 3000'));