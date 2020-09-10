/* 
@author Yash Amitbhai Karkar <yashkarkar.yk@gmail.com> <https://github.com/ykarkar>
*/

// call all the required packages
const express = require('express')
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const bodyParser = require('body-parser')
const fs = require('fs');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID;
const myurl = 'mongodb://localhost:27017';
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const dotenv = require('dotenv');
let key = 'ba94338c67710b7e7042cbbecc37ac08afe4d7cd73cf56dd7a4cf4b91a4c00bdc5de1c56f4b0a1de1fc4673fec1ceec5';
key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
dotenv.config();

var token1 = "";
var flag = false;
var type = "";


app.use(express.urlencoded({
    extended: true
}));
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const encrypt = (buffer) => {
    // Create an initialization vector
    const iv = crypto.randomBytes(16);
    // Create a new cipher using the algorithm, key, and iv
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    // Create the new (encrypted) buffer
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
};

const decrypt = (encrypted) => {
    // Get the iv: the first 16 bytes
    const iv = encrypted.slice(0, 16);
    // Get the rest
    encrypted = encrypted.slice(16);
    // Create a decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    // Actually decrypt it
    const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return result;
};

app.get('/check', function (req, res) {
    if (flag) {
        if (type === "SINGLE") {
            flag = false;
            type = "";
            res.send("SINGLE");
        }
        else if (type === "MULTIPLE") {
            flag = false;
            type = "";
            res.send("MULTIPLE");
        }
        else if (type === "IMG_NOT_AVAILABLE") {
            flag = false;
            type = "";
            res.send("IMG_NOT_AVAILABLE");
        }
    }
    else {
        flag = false;
        type = "";
        res.send("NO");
    }
});

function auth(req, res, next) {
    if (!token1) return res.redirect('/');//Auth error
    try {
        const decoded = jwt.verify(token1, process.env.TOKEN_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        console.error(e);
        res.redirect('/');//Invalid Token
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
    if (username != '') {
        db.collection('Users').findOne({ 'user_name': username }, (err, result) => {
            if (result != null && result.user_name == username) {
                res.send('User Already Exists')
            }
            else {
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) console.log(err)
                    var userDetails = {
                        user_name: username,
                        pwdhash: hash
                    }
                    db.collection('Users').insertOne(userDetails, (err, resu) => {
                        if (err) return console.log(err.field)
                        res.send('Account created')
                    })
                });
            }
        })
    }
    else {
        res.send('Error')
    }
})

app.post('/logIn', function (req, res) {
    const username = req.param("username");
    const password = req.param("password");
    if (username != '') {
        db.collection('Users').findOne({ 'user_name': username }, (err, result) => {
            if (err) console.log("Username does not found" + err)
            if (result != null) {
                const pwdhash = result.pwdhash
                const user_id = result._id
                bcrypt.compare(password, pwdhash, function (err, resu) {
                    if (err) return console.log(err)
                    resu ? console.log("Password matched") : res.send("Incorrect_Credentials")
                    if (resu) {
                        const payload = {
                            user: { id: user_id }
                        };
                        jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: 1000 },
                            (err, token) => {
                                if (err) throw err;
                                token1 = token;
                                res.send("LoggedIn");
                            }
                        );
                    }
                })
            } else {
                res.send("User_Not_Found")
            }
        })
    }
    else {
        User_Not_Found
    }
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

app.get('/welcomejs', function (req, res) {
    res.sendFile(__dirname + "/welcome.js");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/welcomePage.html");
});

app.get('/logout', function (req, res) {
    token1 = "";
    res.send("loggedOut");
});

app.get('/publicPortal', function (req, res) {
    token1 = "";
    res.sendFile(__dirname + "/publicImages.html");
});

app.post('/ImgPublicSingle', upload.single('myImage'), (req, res) => {
    var image = fs.readFileSync(req.file.path);
    var path = req.file.path;
    var encode_image = image.toString('base64');
    var buffer_image = new Buffer(encode_image, 'base64');
    var encrypted_image = encrypt(buffer_image);
    var imgProperty = {
        contentType: req.file.mimetype,
        image: encrypted_image,
        name: req.file.originalname,
        path: path.toString(),
    };
    db.collection('publicImages').insertOne(imgProperty, (err, result) => {
        if (err) {
            flag = false;
            type = "";
            res.send("Something is wrong please try again " + err)
        }
        else {
            flag = true;
            type = "SINGLE";
            res.redirect('/publicPortal');
        }
    })
});

app.post('/ImgPublicMultiple', upload.array('myImage'), (req, res, next) => {
    const multipleimages = req.files;
    multipleimages.forEach(multiimg => {
        var path = multiimg.path;
        var imagespath = fs.readFileSync(multiimg.path);
        var encode_image = imagespath.toString('base64');
        var buffer_image = new Buffer(encode_image, 'base64');
        var encrypted_image = encrypt(buffer_image);
        var imgProperty = {
            contentType: multiimg.mimetype,
            image: encrypted_image,
            name: multiimg.originalname,
            path: path.toString(),
        };
        db.collection('publicImages').insertOne(imgProperty, (err, result) => {
            if (err) {
                flag = false;
                type = "";
                res.send("Something is wrong please try again " + err)
            }
        })
    })
    flag = true;
    type = "MULTIPLE";
    res.redirect('/publicPortal');
})

app.get('/findImageByIDPublic', (req, res) => {
    var filename = req.param("imageID");
    db.collection('publicImages').findOne({ '_id': ObjectId(filename) }, (err, result) => {
        if (err) res.send("Image Not Available error" + err)
        if (result != null) {
            var decryptedImg = decrypt(result.image.buffer);
            res.contentType('image/jpeg');
            res.send(decryptedImg);
            // res.send(result.image.buffer);
        } else {
            res.send("Image Not Available")
        }

    })
});

app.get('/showAllImgIdPublic', (req, res) => {
    var imgArray = {};
    db.collection('publicImages').find().toArray((err, result) => {
        imgArray = result.map(element => element._id);
        if (err) return console.log(err)
        res.send(imgArray);
    })
});



app.get('/ImageRepo', auth, async (req, res) => {
    console.log('Authentication cleared');
    try {
        await db.collection('Users').findOne({ '_id': ObjectId(req.user.id) }, (err, result) => {
            err ? res.send("user not available") : user = result.user_name
            user != null ? res.sendFile(__dirname + "/home.html") : res.send("user not available")
        })
    } catch (error) {
        res.send({ message: "Error in Fetching user" + error });
    }

})

app.post('/uploadImages', auth, upload.single('myImage'), (req, res) => {
    var image = fs.readFileSync(req.file.path);
    var path = req.file.path;
    var encode_image = image.toString('base64');
    var buffer_image = new Buffer(encode_image, 'base64');
    var encrypted_image = encrypt(buffer_image);
    var imgProperty = {
        contentType: req.file.mimetype,
        image: encrypted_image,
        name: req.file.originalname,
        path: path.toString(),
        user_id: req.user.id
    };
    db.collection('privateImages').insertOne(imgProperty, (err, result) => {
        if (err) return console.log(err.field)
        if (err) {
            flag = false;
            type = "";
            res.send("Something is wrong please try again " + err)
        }
        else {
            flag = true;
            type = "SINGLE";
            res.redirect('/ImageRepo');
        }
    })
});

app.post('/uploadMultipleImages', auth, upload.array('myImage'), (req, res, next) => {
    const multipleimages = req.files;
    multipleimages.forEach(multiimg => {
        var path = multiimg.path;
        var imagespath = fs.readFileSync(multiimg.path);
        var encode_image = imagespath.toString('base64');
        var buffer_image = new Buffer(encode_image, 'base64');
        var encrypted_image = encrypt(buffer_image);
        var imgProperty = {
            contentType: multiimg.mimetype,
            image: encrypted_image,
            name: multiimg.originalname,
            path: path.toString(),
            user_id: req.user.id
        };
        db.collection('privateImages').insertOne(imgProperty, (err, result) => {
            if (err) return console.log(err.field)
            if (err) {
                flag = false;
                type = "";
                res.send("Something is wrong please try again " + err)
            }
        })
    })
    flag = true;
    type = "MULTIPLE";
    res.redirect('/ImageRepo');

})

app.get('/findImageByID', auth, (req, res) => {
    var filename = req.param("imageID");
    db.collection('privateImages').findOne({ '_id': ObjectId(filename), user_id: req.user.id }, (err, result) => {
        if (err) res.send("Image Not Available error" + err)
        if (result != null) {
            flag = false;
            type = "";
            var decryptedImg = decrypt(result.image.buffer);
            res.contentType('image/jpeg');
            res.send(decryptedImg);

        } else {
            flag = true;
            type = "IMG_NOT_AVAILABLE";
            res.redirect('/ImageRepo');
        }

    })
});

app.get('/showAllImgId', auth, (req, res) => {
    var imgArray = {};
    db.collection('privateImages').find({ user_id: req.user.id }).toArray((err, result) => {
        if (result != '') {
            imgArray = result.map(element => element._id);
            res.send(imgArray);
        }
        else {
            res.send('Images_Not_Available');
        }
    })
});

app.get('/deleteImageByID', auth, (req, res) => {
    var filename = req.param("deleteImageID");
    var imagePath;
    db.collection('privateImages').findOne({ '_id': ObjectId(filename), 'user_id': req.user.id }, (err, result) => {
        if (err) res.send('Image Not Available or Does Not Belong To User')
        if (result != null) {
            imagePath = result.path.toString()
            fs.unlink(imagePath, (err, result) => {
                err ? res.send(err) : console.log(result);
                db.collection('privateImages').deleteOne({ '_id': ObjectId(filename), 'user_id': req.user.id }, (err, result) => {
                    if (err) res.send('Image Not Available or Does Not Belong To User')
                    if (result != null) res.send('Image_Deleted');
                })
            })
        } else {
            res.send('Image Not Available or Does Not Belong To User')
        }
    })
});

app.get('/deleteAllImages', auth, (req, res) => {
    var imgArray = {};
    db.collection('privateImages').find({ user_id: req.user.id }).toArray((err, result) => {
        if (err) res.send('Images_Not_Available')

        if (result != '') {
            imgArray = result.map(element => element.path);
            imgArray.forEach(imgpath => {
                fs.unlink(imgpath, (err, resul) => {
                    if (err) console.log(err)
                    db.collection('privateImages').deleteOne({ 'path': imgpath, user_id: req.user.id }, (error, resul) => {
                        error ? res.send("Images_Not_Available") : console.log(resul)
                    })
                })
            })
            res.send('Images_Deleted')
        }
        else { res.send('Images_Not_Available') }
    })
});

app.listen(3000, () => console.log('Server started on port 3000'));
