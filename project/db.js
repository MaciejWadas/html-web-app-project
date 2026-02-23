require('dotenv').config();
mysql = require(`mysql2`);
const crypto = require(`crypto`);

const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    charset: `utf8mb4`,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

pool.getConnection((err, connection) => {
    if (err) {
        console.error('DB Pool failed:', err);
        return;
    }
    console.log('MySQL Pool Connected!');
    connection.release();
});

// Initialize the database if it doesn't exist

const queryCreate = [
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username varchar(255) UNIQUE,
        passwordHash BLOB,
        salt BLOB
    ) DEFAULT CHARSET=utf8mb4 COLLATE =utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS posts (
        PostID INT PRIMARY KEY AUTO_INCREMENT,
        PostTitle VARCHAR(50),
        PostDescription TEXT,
        PostBody TEXT,
        PostImageLink TEXT,
        PostAuthor INT,
        FOREIGN KEY (PostAuthor) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS tags (
        TagID INT PRIMARY KEY AUTO_INCREMENT,
        TagName VARCHAR(30)
    )`,
    `CREATE TABLE IF NOT EXISTS article_tags (
        atID INT PRIMARY KEY AUTO_INCREMENT,
        postID INT,
        tagID INT,
        FOREIGN KEY (postID) REFERENCES posts(PostID),
        FOREIGN KEY (tagID) REFERENCES tags(TagID)
    )`];

// Używamy zapytania tworząc bazę danych
for (const q in queryCreate){
    try{
        pool.query(queryCreate[q])
    }catch(e){
        console.error("Error while initializing the data: "+e);
    }
}

var queryCheckForUsers = `SELECT * FROM users;`;
var isEmpty = true;
pool.query(queryCheckForUsers,(err, result)=>{
    if (err) {
        console.error("Error fetching users from database: "+err);
    }
    if (result.length > 0){
        console.log(result);
        isEmpty = false;
    }
});
if (isEmpty){
    var queryFirstUser = ` INSERT INTO users (username, passwordHash, salt)
        VALUES (?, ?, ?) ON DUPLICATE KEY
        UPDATE username = username;`;

    var salt = crypto.randomBytes(16); //tworzymy sól

    try{
        pool.query(queryFirstUser, [
            'alice',
            crypto.pbkdf2Sync(`letmein`, salt, 310000, 32, `sha256`),
            salt
        ])
    }catch(e){
        console.error("Error while initializing the data: "+e);
    }
}

module.exports = pool;

