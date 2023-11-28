const jwt = require('jsonwebtoken');

const generatedToken = (userid, userEmail, userType) => {

    const token = jwt.sign({userid, userEmail, userType}, process.env.JWT_SECRET, { expiresIn: '7d' });

    return token;
}

module.exports = generatedToken;