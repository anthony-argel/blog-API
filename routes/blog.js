const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const Post = require('../models/post');
const {DateTime} = require('luxon');

router.post('/', (req, res, next) => {
    const newPost = new Post({
      title: req.body.title,
      post: req.body.post,
      postdate: DateTime.now(),
      visible:true
    }).save((err, result) => {
      if(err) {return next(err);}
      res.json({message:'posted!'});
    });
});

router.get('/test', (req, res, next) => {
  res.json({message:"got in"});
})


module.exports = router;