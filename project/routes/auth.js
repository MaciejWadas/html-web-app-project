express = require(`express`);
passport = require(`passport`);
LocalStrategy = require(`passport-local`);
const crypto = require(`crypto`);
router = express.Router();
pool = require(`../db`);

passport.use(new LocalStrategy(function verify(username, password, cb) {
    pool.query(`SELECT * FROM users WHERE username = ?`, [username], function(err, rows) {
        if (err) {
            return cb(err);
        }
        if (!rows.length) {
            console.log(`Incorrect username`);
            return cb(null, false, { message: `Incorrect username or password.` });
        }
        const row = rows[0];
        if (!row || !row.salt) {
            return cb(null, false, { message: `Incorrect username or password.` });
        }
        crypto.pbkdf2(password, row.salt, 310000, 32, `sha256`, function(err, hashedPassword) {
            if (err) {
                return cb(err);
            }
            if (hashedPassword.toString(`hex`) !== row.passwordHash.toString(`hex`)) {
                console.log(`Passwords does not match`);
                return cb(null, false, { message: `Incorrect username or password.` });
            }
            return cb(null, row);
        });
    });
}))


passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

router.get(`/login`, function(req, res, next) {
    res.render(`login`,{});
});
router.post(`/login/password`, passport.authenticate(`local`, {
    successRedirect: `/`,
    failureRedirect: `/login`,
    failureMessage: true
}));

router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.get('/signup', function(req, res, next) {
    res.render('signup');
})

router.post(`/signup`, function(req, res, next) {
    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, `sha256`, function(err, hashedPassword) {
        if (err) { return next(err); }
        pool.query(`INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)`, [
            req.body.username,
            hashedPassword,
            salt
        ], function(err) {
            if (err) { return next(err); }
            var user = {
                id: this.lastID,
                username: req.body.username
            };
            req.login(user, function(err) {
                if (err) { return next(err); }
                res.redirect(`/`);
            });
        });
    });
})

module.exports = router;