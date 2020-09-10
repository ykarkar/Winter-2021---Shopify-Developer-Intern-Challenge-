# Winter-2021---Shopify-Developer-Intern-Challenge-
# Image Repository

Image Repository is a web application where users can perform CRUD operations for images.
Users can upload Single, multiple Images in a secured way through the public or private portal.

Images are private to the individual user. Users cannot delete images of other users as well cannot see it.

Images are uploaded at two places 1st locally using multer and 2nd on the MongoDB in a binary form.



## Installation

This is a NodeJs Express Application Running this app in your computer is quite simple.

Run the following commands and then you are good to go.

To run the npm commands you mush have npm installed as well as nodejs. To check if you have node and npm installed run `node -v` and `npm -v` in your terminal. if you don't have nodejs installed please download it from the below link

`https://nodejs.org/en/`


```bash
npm i
```
Running `npm i` will install all the libraries needed to run this web-application.

MongoDB is must required to run this web app. If you don't have MongoDB installed download and install it from the below link. Collections will be made by itself as you will run the web-application.

`https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-4.4.0-signed.msi`

To run the web-application run `npm server.js` command in your terminal and then simply open `http://localhost:3000/` on any browser

## Concepts used in the WebApplication
1. MongoClient:- To save the images uploaded in the database
2. multer:- To save the images locally
3. crypto:- To encrypt and decrypt the image uploaded. Images are encrypted by `aes-256-ctr` algorithm. Also, it is used to generate a unique key that is used in the encryption/decryption of the images.
4. bcrypt:- To bcrypt the password of the user while registering for the first time and logging in every time.
5. jwt(JSON Web Token):- To Authenticate user whenever a request us sent. Generating a jwt with expiry within 10 minutes.


## Important Note.
I have added `.env` file in the project and uploaded it to the git. The purpose of adding it to the git is to have a smoother user flow for the developers cloning this project. It is not a good practice to upload .env file as it has important details.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

