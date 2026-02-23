require('dotenv').config();
pool = require('../db.js')
express = require('express');
router = express.Router();
mysql = require('mysql2');

const getAllArticles =(req, res, next) => {
    let limit = 4
    if (req.query.limit) {
        limit = parseInt(req.query.limit)+4;
    }
    let query = 'SELECT * FROM posts LIMIT '+limit+";";
    if (req.query.tag) {
        let tag = parseInt(req.query.tag);
        query = `SELECT * FROM posts p RIGHT JOIN article_tags a ON p.postID = a.postID WHERE a.tagID = ${tag} LIMIT ${limit}`;
        req.tag = tag;
    }
    pool.query(query, (err, result) => {
        if (err) {
            console.log("Error fetching articles from the database: "+err);
            return res.status(500).send("Database error");
        }
        req.articles = result;
        req.limit = result.length;
        next();
    })
}

const getAllTags =(req, res, next) => {
    var query = 'SELECT * FROM tags;';
    pool.query(query, (err, result) => {
        if (err) {
            console.log("Error fetching tags from the database: "+err);
            return res.status(500).send("Database error");

        }
        req.tags = result;
        if (req.tag) {
            req.tag = req.tags[req.tag-1];
        }
        next();
    })
}

const getTagsForArticle = (req, res, next) => {
    var query = `SELECT * FROM article_tags a LEFT JOIN tags t ON a.tagID = t.TagID WHERE a.postID = ${req.article[0].PostID}`;
    pool.query(query, (err, result) => {
        if (err) {
            console.log("Error fetching tags from the database: "+err);
            return res.status(500).send("Database error");
        }
        req.tags = result;
        next();
    })
}

const getArticle=(req,res,next) => {
    var query = 'SELECT * FROM posts WHERE postID = '+req.params.id+";";
    pool.query(query, (err, result) => {
        if(err){
            console.error("Error fetching article from the database: "+err);
            return res.status(500).send("Database error");
        }
        req.article = result;
        next();
    })
}

router.get('/',getAllArticles,getAllTags, (req, res) => {
    res.render('articles', {
        title: 'The Witcher - Wiki',
        articles: req.articles,
        limit: req.limit,
        tags: req.tags,
        active_tag: req.tag,
        page:'articles',
        user: req.user
    });
});

router.get('/create-article',function(req, res, next){
    res.render('create_article', {
        user: req.user,
        page:'create-article'
    })
})

router.post('/create-article',function(req, res,next){
    var query = `INSERT INTO posts (PostTitle,PostDescription,PostBody,PostImageLink,PostAuthor) VALUES (?,?,?,?,?);`;
    pool.query(query, [
        req.body.PostTitle,
        req.body.PostDescription,
        req.body.PostBody,
        req.body.PostImageLink,
        req.body.PostAuthor
    ], function(err) {
        if (err) { return next(err);}
        var query = `SELECT PostID FROM posts WHERE PostTitle="`+req.body.PostTitle+'";';
        console.log(query);
        pool.query(query,(err, result) => {
            if (err) {
                console.error("Error fetching posts from the database: "+err);
            }
            console.log("Result:"+result[0].PostID);
            res.redirect(`/articles/`+result[0].PostID);
        })
    })
})

router.get('/:id', getArticle, getTagsForArticle, (req, res) =>{
    res.render('article', {
        title: 'The Witcher - Wiki',
        page:'articles',
        user: req.user,
        article: req.article[0] || [],
        tags: req.tags
    });
})


module.exports = router;
