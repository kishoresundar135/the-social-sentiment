/**
 * Created by kishoresundar on 12/12/16.
 */

var mongoose = require('mongoose');

var KeywordSchema = new mongoose.Schema({
    relevance: Number,
    text: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});




mongoose.model('Keyword', KeywordSchema);