const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');
const {DateTime} = require('luxon');
const Tag = require('../models/tag');

// blog posts
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
  const updateData = {};
  if(req.body.post !== '') {
    updateData.post = req.body.post;
  }
  if(req.body.title !== '') {
    updateData.title = req.body.title;
  }
  Post.findByIdAndUpdate(req.params.id, updateData, (err, result) => {
    if(err) {return next(err)}
    else {
      res.status(200).json({message:'success'})
    }
  })
})

// tags
router.post('/:id/tag', (req, res, next) => {
  Tag.findById(req.body.tagid).exec((err, result) => {
    if(err) {return res.sendStatus(400);}
    if(result.length === 0) {return res.sendStatus(400)}
    Post.findOneAndUpdate({_id: req.params.id}, {
      $addToSet: {
        tags: {tagid: req.body.tagid, tagname: result.name, _id: req.body.tagid}
      }
    })
    .exec((err) => {
      if(err) {return res.sendStatus(400);}
      res.sendStatus(200);
    })
  });
});

router.delete('/:id/tag', (req, res, next) => {
  Tag.findById(req.body.tagid).exec((err, result) => {
    if(err) {return res.sendStatus(400);}
    Post.findOneAndUpdate({_id: req.params.id}, {
      $pull: {
        tags: {tagid: req.body.tagid}
      }
    })
    .exec((err) => {
      if(err) {return res.sendStatus(400);}
      res.sendStatus(200);
    })
  });
});

// comments
router.delete('/:id/comment/:commentid', (req, res, next) => {
  Comment.findByIdAndDelete({_id: req.params.commentid}).exec((err, result) => {
    if(err) {return next(err);}
    res.status(200).json({message:'successfully deleted the post'});
  })
})
module.exports = router;