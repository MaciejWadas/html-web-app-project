express = require('express');
router = express.Router();

router.get('/', function(req, res, next) {
    res.render('support', { title: 'The Witcher - Wiki', user: req.user, page: 'support' });
});

module.exports = router;
