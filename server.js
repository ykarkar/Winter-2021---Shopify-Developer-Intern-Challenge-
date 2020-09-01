// call all the required packages
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');


const multer = require('multer');
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID;
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

app.post('/uploadImages', upload.single('myImage'), (req, res) => {
    var image = fs.readFileSync(req.file.path);
    var path = req.file.path;
    // console.log("path " + path.toString())
    // localStorage.setItem("imagepath", path.toString());
    var encode_image = image.toString('base64');
    var imgProperty = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64'),
        name: req.file.originalname,
        path: path.toString()
    };
    db.collection('images').insertOne(imgProperty, (err, result) => {
        console.log(result)
        if (err) return console.log(err.field)
        console.log('saved to database')
    })
    res.send('Image stored to database successfully!');
});

app.post('/uploadMultipleImages', upload.array('myImage'), (req, res, next) => {
    const multipleimages = req.files;
    console.log("multiple images:=> " + multipleimages);

    multipleimages.forEach(multiimg => {
        var path = multiimg.path;
        var imagespath = fs.readFileSync(multiimg.path);
        var encode_image = imagespath.toString('base64');
        var imgProperty = {
            contentType: multiimg.mimetype,
            image: new Buffer(encode_image, 'base64'),
            name: multiimg.originalname,
            path: path.toString()
        };
        db.collection('images').insertOne(imgProperty, (err, result) => {
            console.log(result)
            if (err) return console.log(err.field)
            console.log('saved to database')
        })
    })
    res.send('Image stored to database successfully!');
})


app.get('/singlePhoto', (req, res) => {
    var filename = req.param("imageID");
    console.log(filename);
    db.collection('images').findOne({ '_id': ObjectId(filename) }, (err, result) => {
        if (err) return console.log(err)
        res.contentType('image/jpeg');
        res.send(result.image.buffer);
    })
});


app.get('/deletePhoto', (req, res) => {
    var filename = req.param("deleteImageID");
    // var path = localStorage.getItem("imagepath").toString();
    var imagePath;
    db.collection('images').findOne({ '_id': ObjectId(filename) }, (err, result) => {
        err ? console.log(err) : imagePath= result.path.toString();
        fs.unlink(imagePath, (err, result) => {
            err ? console.log(err) : console.log(result);
            db.collection('images').deleteOne({ '_id': ObjectId(filename) }, (err, result) => {
                if (err) return console.log(err)
                res.send('Image deleted from successfully!' + result);
            })
        })     
    })

    
      

    // db.collection('images').findOne({ '_id': ObjectId(filename) }, (err, result) => {
    //     const img = result.map(element => element.image);
    //     fs.unlink(img);
    //     console.log(img);
    //     if (err) return console.log(err)

    // })

});

app.get('/showAllPhotos', (req, res) => {
    db.collection('images').find().toArray((err, result) => {
        const imgArray = result.map(element => element._id);
        console.log(imgArray);
        if (err) return console.log(err)
        res.send(imgArray)
    })
});



app.listen(3000, () => console.log('Server started on port 3000'));