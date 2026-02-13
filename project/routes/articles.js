require('dotenv').config();

var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

const {DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE} = process.env;
const db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
})

const getAllArticles =(req, res, next) => {
    let limit = 4
    if (req.query.limit) {
        limit = parseInt(req.query.limit)+4;
    }
    var query = 'SELECT * FROM posts LIMIT '+limit+";";
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
router.get('/',getAllArticles, (req, res) => {
console.log(req.articles,req.articles.length);
    res.render('articles', {
        title: 'The Witcher - Wiki',
        articles: req.articles,
        limit: req.limit,
    });
});

router.get('/:id', getArticle, (req, res) =>{
    res.render('article', {
        title: 'The Witcher - Wiki',
        article: req.article[0] || [],
    });
})
module.exports = router;
