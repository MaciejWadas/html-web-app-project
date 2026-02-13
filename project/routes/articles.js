require('dotenv').config();

var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;
const db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
})

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
    db.query(query, (err, result) => {
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
    db.query(query, (err, result) => {
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
    db.query(query, (err, result) => {
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
    db.query(query, (err, result) => {
        if(err){
            console.error("Error fetching article from the database: "+err);
            return res.status(500).send("Database error");
        }
        req.article = result;
        next();
    })
}

db.connect(err => {
    if (err) {
        console.error('DB Connection failed:', err);
        return;
    }
    console.log('MySQL Connected!');
});

/* GET home page. */
router.get('/',getAllArticles,getAllTags, (req, res) => {
    res.render('articles', {
        title: 'The Witcher - Wiki',
        articles: req.articles,
        limit: req.limit,
        tags: req.tags,
        active_tag: req.tag
    });
});

router.get('/:id', getArticle, getTagsForArticle, (req, res) =>{
    res.render('article', {
        title: 'The Witcher - Wiki',
        article: req.article[0] || [],
        tags: req.tags
    });
})
module.exports = router;
