var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    author: String,
    title: String,
    description: String,
    upvotes: {type: Number, default: 0},
    url: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    keywords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Keywords' }],
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweets' }]

});



PostSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};

mongoose.model('Post', PostSchema);