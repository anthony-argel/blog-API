const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {type: String, required:true},
    post: {type: String, required: true},
    postdate: {type: Date, required: true},
    visible: {type: Boolean, required: true}
});

module.exports = mongoose.model('Post', PostSchema);