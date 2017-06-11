/**
 * Created by kishoresundar on 12/12/16.
 */
var mongoose = require('mongoose');

var NewsSchema = new mongoose.Schema({
    author: String,
    title: String,
    description: String,
    upvotes: {type: Number, default: 0},
    url: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});



NewsSchema.methods.upvote = function(cb) {
    this.upvotes += 1;
    this.save(cb);
};

mongoose.model('News', NewsSchema);