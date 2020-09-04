// call all the required packages
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient
const mongoose = require("mongoose");
const ObjectId = require('mongodb').ObjectID;
const myurl = 'mongodb://localhost:27017';
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const dotenv = require('dotenv');

dotenv.config();

var token1 = "";

function auth(req, res, next) {
    console.log("apdi token " + token1);
    if (!token1) return res.status(401).json({ message: "Auth Error" });

    try {
        const decoded = jwt.verify(token1, process.env.TOKEN_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: "Invalid Token" });
    }
};

MongoClient.connect(myurl, (err, client) => {
    if (err) return console.log(err)
    db = client.db('Shopify_Winter2021_Challange')
    app.listen(3333, () => {
        console.log('listening on 3333')
    })
})

app.post('/register', function (req, res, next) {
    const username = req.param("username");
    const password = req.param("password");
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) console.log(err)
        var userDetails = {
            user_name: username,
            pwdhash: hash
        }

        db.collection('Users').insertOne(userDetails, (err, resu) => {
            if (err) return console.log(err.field)
            console.log(resu.insertedId);
            res.send('Account created. Please Login')           
        })

    });

})

app.post('/logIn', function (req, res) {
    const username = req.param("username");
    const password = req.param("password");

    console.log("request =>> " + username)
    db.collection('Users').findOne({ 'user_name': username }, (err, result) => {
        console.log("mongo data ====> " + JSON.stringify(result))
        if (err) console.log("Username does not found" + err)
        if (result != null) {
            const pwdhash = result.pwdhash
            const user_id = result._id
            bcrypt.compare(password, pwdhash, function (err, resu) {
                if (err) return console.log(err)
                resu ? console.log("Password matched") : res.send("Incorrect credentials")
                if (resu) {
                    const payload = {
                        user: { id: user_id }
                    };

                    jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: 100 },
                        (err, token) => {
                            if (err) throw err;
                            token1 = token;
                            //res.set({ 'token': token })
                            res.send("LoggedIn");
                        }
                    );
                }
            })
        } else {
            res.send("User not found please Signup")
        }
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
    res.sendFile(__dirname + "/welcomePage.html");
});

app.get('/logout', function (req, res) {
   token1="";
   res.send("loggedOut"); 
});

app.get('/showHome', function (req, res) {
    res.sendFile(__dirname + "/home.html");
});

app.get('/ImageRepo', auth, async (req, res) => {
    console.log('Auth cleared');
    try {
        console.log(req.user.id)
        await db.collection('Users').findOne({ '_id': ObjectId(req.user.id) }, (err, result) => {
            err ? res.send("user not available") : user = result.user_name
            user != null ? res.sendFile(__dirname + "/home.html") : console.log("Unable to find the user")
        })
    } catch (error) {
        res.send({ message: "Error in Fetching user" + error });
    }

})


app.get('/welcomejs', function (req, res) {
    res.sendFile(__dirname + "/welcome.js");
});

app.get('/searchDeleteImages', function (req, res) {
    res.sendFile(__dirname + '/searchDeleteImages.html');
});

app.post('/uploadImages', auth, upload.single('myImage'), (req, res) => {
    console.log("apdo user "+ JSON.stringify(req.user))
    var image = fs.readFileSync(req.file.path);
    var path = req.file.path;
    var encode_image = image.toString('base64');
    var imgProperty = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64'),
        name: req.file.originalname,
        path: path.toString(),
        user_id : req.user.id
    };
    db.collection('images').insertOne(imgProperty, (err, result) => {
        console.log(result)
        if (err) return console.log(err.field)
        console.log('saved to database')
    })
    res.send('Image stored to database successfully!');
});

app.post('/uploadMultipleImages', auth, upload.array('myImage'), (req, res, next) => {
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
            path: path.toString(),
            user_id : req.user.id
        };
        db.collection('images').insertOne(imgProperty, (err, result) => {
            console.log(result)
            if (err) return console.log(err.field)
            console.log('saved to database')
        })
    })
    res.send('All The Images Stored to Database Successfully!');
})


app.get('/findImageByID', auth, (req, res) => {
    var filename = req.param("imageID");
    console.log(filename);
    db.collection('images').findOne({ user_id : req.user.id }, (err, result) => {
        if (err) return console.log(err)
        res.contentType('image/jpeg');
        res.send(result.image.buffer);
    })
});

app.get('/showAllImages', auth, (req, res) => {
    var filename = req.param("imageID");
    console.log(filename);
    db.collection('images').find({user_id : req.user.id}).toArray((err, result) => {
        if (err) return console.log(err)
        const imgArray = result.map(element => element.image);
        res.contentType('image/jpeg');
        res.send(JSON.stringify(imgArray));
    })
});


app.get('/deleteImageByID', auth, (req, res) => {
    var filename = req.param("deleteImageID");
    var imagePath;
    db.collection('images').findOne({ '_id': ObjectId(filename) }, (err, result) => {
        err ? console.log(err) : imagePath = result.path.toString();
        fs.unlink(imagePath, (err, result) => {
            err ? console.log(err) : console.log(result);
            db.collection('images').deleteOne({ '_id': ObjectId(filename) }, (err, result) => {
                if (err) return console.log(err)
                res.send('Image deleted Successfully!' + result);
            })
        })
    })
});

app.get('/deleteAllImages', auth, (req, res) => {
    var imgArray = {};
    db.collection('images').find().toArray((err, result) => {
        if (err) console.log(err)
        imgArray = result.map(element => element.path);
        imgArray.forEach(imgpath => {
            fs.unlink(imgpath, (err, resul) => {
                if (err) console.log(err)
                db.collection('images').deleteOne({ 'path': imgpath }, (err, resul) => {
                    if (err) console.log(err)
                })
            })
        })
        res.send('All The Images Deleted Successfully!');
    })
});

app.get('/showAllImgId', auth, (req, res) => {
    var imgArray = {};
    db.collection('images').find({user_id : req.user.id}).toArray((err, result) => {
        imgArray = result.map(element => element._id);
        console.log(imgArray);
        if (err) return console.log(err)
        res.send(imgArray);
    })
    //res.sendFile(__dirname + '/home.html',{imageIds:imgArray});
});



app.listen(3000, () => console.log('Server started on port 3000'));
