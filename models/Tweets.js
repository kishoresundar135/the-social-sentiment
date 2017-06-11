/**
 * Created by kishoresundar on 12/12/16.
 */
var mongoose = require('mongoose');

var TweetSchema = new mongoose.Schema({
    text: String,

    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }

});




mongoose.model('Tweet', TweetSchema);