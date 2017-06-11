var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Require mongoose, connect and require mongoose models
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/news');

require('./models/Posts');
require('./models/Comments');
//require('./models/News');
require('./models/Tweets');
require('./models/Sentiments');


//var News = mongoose.model('News');
var Tweet = mongoose.model('Tweet');
var Post = mongoose.model('Post');
var Sentiment = mongoose.model('Sentiment');

// Require APIs
var NewsApi = require('news-api-njs');	//*****
var watson = require('watson-developer-cloud');	//******
var Twitter = require('twitter');	//*******

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//***********************************************************

//clearing all databases
Post.find({}, function (err, pst) {
	if(err) {
		console.log('Error finding Post');
		return (err.message);
	}
	pst.forEach(function (p) {
		p.remove(function (err) {
			if(err) {
				console.log('Error removing posts');
			}
			//console.log('Post removed.');
		});
	});
});

Tweet.find({}, function (err, tw) {
	if(err) {
		console.log('Error finding Post');
		return (err.message);
	}
	tw.forEach(function (t) {
		t.remove(function (err) {
			if(err) {
				console.log('Error removing posts');
			}
			//console.log('Post removed.');
		});
	});
});

Sentiment.find({}, function (err, senti) {
	if(err) {
		console.log('Error finding Post');
		return (err.message);
	}
	senti.forEach(function (s) {
		s.remove(function (err) {
			if(err) {
				console.log('Error removing posts');
			}
			//console.log('Post removed.');
		});
	});
});


//Calling the news api
var heads = new NewsApi({
    apiKey: '367e035b33ac4bb888852c472e20f6ad'
});

heads.getArticles({
    source: 'cnn',
    sortBy: 'top'
}).then(function(req, res, next) {
    var arts = JSON.parse(JSON.stringify(req.articles));
    arts.forEach(function (art) {
        //console.log(art);
		var n = new Post(art);
		n.save(function(err, result) {
			if (err) {
				console.log('Error while saving keyword object');
				return (err.message);
			}
			//console.log(result);
		});
    });
}).catch(function(err) {
    console.log(err);
});


//******Get key and then tweets********
var alchemy_language = watson.alchemy_language({
  //api_key: '2cef21d3c0cc83a608c987f6a5b80a1717e8499f'
});

/*{
  "url": "https://gateway.watsonplatform.net/natural-language-understanding/api",
  "username": "70b5266c-768a-4e7b-9450-7e8e4dc9c53b",
  "password": "***"
}*/

var client = new Twitter({
	consumer_key: '*',
  	consumer_secret: '*',
  	access_token_key: '*',
  	access_token_secret: '*'
});

var bulletin = Post.find(function (error, set) {
	if(error) {
		console.log('Error while finding news');
		return (error.message);
	}

	//console.log(set);
	set.forEach(function (newspost) {
		//console.log(newspost.title);
		var str = {
			text: newspost.title
		};
		//console.log(str);	//passed

		alchemy_language.keywords(str, function (err, response) {
			if(err) {
				console.log('Error while extracting keywords: ', err);
				return (err.message);
			}

			//console.log(response);
			var keys = JSON.parse(JSON.stringify(response.keywords));

			var searchstring = '';

			keys.forEach(function (word) {
				//console.log('Word: ', word);
				if(word.relevance > 0.5) {
					searchstring = searchstring.concat(" ", JSON.parse(JSON.stringify(word.text)));
				}
			});

			//console.log('Searchstring : ', searchstring);

			client.get('search/tweets', {q: searchstring, count: 2, '-filter': 'retweets'}, function(errors, tweets, response){
				if(errors) {
					console.log('Error collecting tweets : ', errors);
					return(errors.message);
				}

				var twits = JSON.parse(JSON.stringify(tweets.statuses));

				var tweettext = ' ';		//to store all tweets of particular news by concat
				var tweetsdata = ' ';		//to add to posts

				//console.log(twits);
				twits.forEach(function (twit) {
					//console.log('--------------------------');
					//console.log('Text: ', JSON.parse(JSON.stringify(twit.text)));
					//console.log('User: ', JSON.parse(JSON.stringify(twit.user.screen_name)));

					tweettext = tweettext.concat('. ', twit.text.toString());
					tweetsdata = tweetsdata.concat('TWEETTEXT:', twit.text.toString(), 'TWEETUSER:', twit.user.screen_name.toString());

					var t = new Tweet({
						text: twit.text.toString(),
						username: twit.user.screen_name.toString(),
						post: newspost._id
					});

					t.save(function(err, result) {
						if (err) {
							console.log('Error while saving keyword object');
							return (err.message);
						}
						//console.log(result);
					});
				});

				//console.log(tweettext);
				//console.log('-----------------------------------------');
				Post.update({title: newspost.title.toString()}, {$set: {tweets: tweetsdata.toString()}}, function(err, update){
					if (err) {
						console.log('Error while saving tweet to post object');
						return (err.message);
					}

					console.log('succ');
				});

				//call alchemy sentiment analysis on tweettext
				alchemy_language.sentiment({text: tweettext}, function (err, response) {
				  if (err)
					console.log('error in sentiment:', err);
				  else {
					//console.log(JSON.stringify(response, null, 2));
					//console.log('-----------------------------------------');

					var docsenti = JSON.parse(JSON.stringify(response.docSentiment));
					var s = new Sentiment({
						score: docsenti.score,
						type: docsenti.type,
						post: newspost.title
					});

					s.save(function(err, result) {
						if (err) {
							console.log('Error while saving sentiment object');
							return (err.message);
						}
						//console.log(result);
					});


					Post.update({title: newspost.title.toString()}, {$set: {sentiment: docsenti.type.toString()}}, function(err, update){
						if (err) {
							console.log('Error while saving tweet to post object');
							return (err.message);
						}

						console.log('success');
					});


				  }
				});
			});
		});
	});
});

//************************************************************

module.exports = app;
