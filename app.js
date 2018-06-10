//Import everything
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

//Express setup
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

//Mongoose setup
mongoose.connect('mongodb://localhost/basic_mongoose');
var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4},
    message: {type: String, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true});

var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4},
    text: {type: String, required: true},
    _post: {type: Schema.Types.ObjectId, ref: 'Post'}
}, {timestamps: true});

mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

var messages = [];

//Routes
app.get('/', function(req, res) {
    if(messages) {
        var errors = messages;
        console.log(errors);
        messages = [];
    }
    Post.find().populate('comments').exec(function(err, posts) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {posts:posts, messages: errors});
        }
    });
});

app.post('/', function(req,res) {
    var post = new Post(req.body.body);
    post.save(function(err){
        if(err) {
            if(err.errors.message) {
                messages.push(err.errors.message.message);
            }
            if(err.errors.name) {
                messages.push(err.errors.name.message);
            }
        }
        res.redirect('/');
    });
});

app.post('/comment/:post', function(req,res) {
    Post.findById(req.params.post, function(err, post) {
        if(err) {
            console.log(err);
        } else {
            var comment = new Comment(req.body.body);
            comment._post = post._id;
            post.comments.push(comment);
            comment.save(function(err) {
                if(err) {
                    if(err.errors.name) {
                        messages.push(err.errors.name.message);
                    }
                    if(err.errors.text) {
                        messages.push(err.errors.text.message);
                    }
                    res.redirect('/');
                } else {
                    post.save(function(err) {
                        if(err){ console.log(err); } 
                        else { res.redirect('/'); }
                    });
                }
            });    
        }
    });
});

app.listen(8000, function() {
    console.log("listening on port 8000");
});