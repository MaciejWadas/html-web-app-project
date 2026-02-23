express = require('express');
router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', {title: 'The Witcher - Wiki', user: req.user, page: 'home'});
});

module.exports = router;
