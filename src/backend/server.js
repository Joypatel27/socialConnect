const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const User = require('./model/user'); 
const cors = require('cors');
const session = require('express-session');
const path=require('path');
require('dotenv').config();



app.use(cors({ origin: 'http://localhost:3000', credentials: true })); 
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,  // true only if HTTPS
    httpOnly: true,
    sameSite: 'lax'  // or 'none' if cross-site cookies required with HTTPS
  }
}));




app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Databse Connected Successfully!!");    
}).catch(err => {
    console.log('Could not connect to the database', err);
    process.exit();
});



const UserRoute = require('./routes/User');
app.use('/User', UserRoute);

const friendRequestRoutes = require('./routes/FriendRequest');
app.use('/friends', friendRequestRoutes);

const postRoutes = require('./routes/Post');
app.use('/api/posts', postRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// const User = require('./model/user'); 

app.post('/submit', async (req, res) => {
  const { name, email, password , image } = req.body;

  if (!name || !email || !password ) {
    return res.status(400).send({ message: 'All fields are required' });
  }
  

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: 'Email already exists!' });
    }

    const newUser = new User({ name, email, password , image });
    const savedUser = await newUser.save();
    res.status(201).send({ message: 'Saved successfully!' });


  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
});

app.post('/User/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    // Set session or return token
    req.session.userId = user._id;
    res.status(200).send({ message: 'Login successful' });
  } catch (error) {
    res.status(500).send({ message: 'Login failed', error: error.message });
  }
});


app.get('/', (req, res) => {
    res.json({"message": "Hello Crud Node Express"});
});
app.listen(5000, () => {
    console.log("Server is listening on port 5000");
});

