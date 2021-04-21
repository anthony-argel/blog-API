const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');
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

router.delete('/:id', (req, res, next) => {
  Comment.deleteMany({postid: req.params.id}).exec((err, result) => {
    if(err) {return next(err);}
  })

  Post.findByIdAndDelete({_id: req.params.id}).exec((err, result) => {
    if(err) {
      return next(err);
    }
    else {
      res.status(200).json({message:'success'});
    }
  })
})

router.put('/:id', (req, res, next) => {
  Post.findByIdAndUpdate(req.params.id, {title: req.body.title, post: req.body.post}, (err, result) => {
    if(err) {return next(err)}
    else {
      res.status(200).json({message:'success'})
    }
  })
})


router.delete('/:id/comment/:commentid', (req, res, next) => {
  Comment.findByIdAndDelete({_id: req.params.commentid}).exec((err, result) => {
    if(err) {return next(err);}
    res.status(200).json({message:'successfully deleted the post'});
  })
})

router.get('/test', (req, res, next) => {
  res.json({message:"got in"});
})


module.exports = router;