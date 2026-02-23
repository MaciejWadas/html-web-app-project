express = require('express');
router = express.Router();


router.get('/', function(req, res, next) {
    res.render('about', { title: 'The Witcher - Wiki', page: 'about' , user: req.user });
});

module.exports = router;
