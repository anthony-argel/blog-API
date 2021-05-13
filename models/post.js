const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {type: String, required:true},
    post: {type: String, required: true},
    postdate: {type: Date, required: true},
    visible: {type: Boolean, required: true},
    tags: [{tagname: {type: String, required: true}, tagid: {type: Schema.Types.ObjectId, ref:'Tag', required: true}}]
});

module.exports = mongoose.model('Post', PostSchema);