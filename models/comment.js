const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    message: {type:String, required: true},
    postdate: {type: Date, required: true},
    postid: {type: Schema.Types.ObjectId, ref:'Post', required: true}
});

module.exports = mongoose.model('Comment', CommentSchema);