require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {body, validationResult} = require('express-validator');
const jwt = require("jsonwebtoken");
const blogRoute = require('./routes/blog');
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');
var compression = require('compression');
var helmet = require('helmet');

//passport stuff
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({username:username}, (err, user) => {
    if(err) {return done(err);};
    if(!user) {
      return done(null, false, {message:"Incorrect username"});
    }
    bcrypt.compare(password, user.password, (err, res) => {
      if (res) {
        // passwords match! log user in
        return done(null, user)
      } else {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }
    });
  });
}));

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey : process.env.SECRET
    },
    function (jwtPayload, cb) {
        return User.findById(jwtPayload.user._id)
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));


const bcrypt = require('bcrypt');


var cors = require('cors')
var app = express();

const mongoose = require('mongoose');
const { DateTime } = require('luxon');
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(helmet());
app.use(compression()); //Compress all routes
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/login', [
  body('username').trim().escape(), 
  body('password').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Something is not right'
    });
    }
    passport.authenticate('local', {session: false}, (err, user, info) => {
      if (err || !user) {
          return res.status(400).json({
              message: 'Something is not right',
              user : user
          });
      }
      req.login(user, {session: false}, (err) => {
        if (err) {
            res.send(err);
        }

        const token = jwt.sign({user}, process.env.SECRET, {expiresIn:"20h"});
           return res.json({token});
        });
    })(req, res);
  }
]);

app.get('/blog', function(req, res, next) {
  Post.find().exec((err, results) => {
    if(err) {return next(err);}
    res.json(results)
  })
});


// get blog and comments
app.get('/blog/:id', function(req, res, next) {
    Post.find({_id:req.params.id}).exec((err, result) => {
      if(err) {return next(err);}
      res.json(result);
    });
});

app.get('/blog/:id/comments', function(req, res, next) {
  Comment.find({postid:req.params.id}).exec((err, result) => {
    if(err) {return next(err);}
    res.json(result);
  });
});

// add comment
app.post('/blog/:id', [
  body('comment').trim().isLength({min:1}).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      res.json({message:errors.array()});
    }
    else {
      const newComment = new Comment({
        message: req.body.comment,
        postdate: DateTime.now(),
        postid: req.params.id
      }).save((err, result)=> {
        if(err) {return next(err);}
        res.json({message:'success'});
      });
    }
  }
]);

const Tag = require('./models/tag');
app.get('/tags', (req, res, next) => {
  Tag.find().exec((err, results) => {
    if(err) {return res.sendStatus(400);}
    res.status(200).json({tags: results});
  });
})

// add tag
app.post('/tag',passport.authenticate('jwt', {session: false}), (req, res) => {
  const newTag = new Tag({name: req.body.name});
  newTag.save((err) => {
    if(err) {return res.sendStatus(400)}
    res.sendStatus(200);
  })
})

app.get('/tag/:id/channels', (req, res) => {
  Post
  .find({'tags.tagid':req.params.id})
  .exec((err, results) => {
    if(err){return res.sendStatus(400);}
    res.status(200).json({channels:results});
  })
})

app.get('/search', (req, res, next) => {
  Post
  .find({$text: {$search: req.query.query, $caseSensitive: false}})
  .sort({score: {$meta: 'textScore'}})
  .exec((err, results) => {
    if(err) {return res.send(err)}
    res.status(200).json({results})
  })
});

app.get('/verify', passport.authenticate('jwt', {session: false}), (req, res, next)=> {
  res.sendStatus(200);
})

app.use('/blog', passport.authenticate('jwt', {session: false}), blogRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
