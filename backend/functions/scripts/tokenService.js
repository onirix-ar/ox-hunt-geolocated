const jwt = require('jsonwebtoken');
const jwt_secret = 'JWT SECRET'

function getToken(userId) {
    return jwt.sign({ userId: userId }, jwt_secret);
}

function main() {
    console.log(getToken('admin'));
}

main();