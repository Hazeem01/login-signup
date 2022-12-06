const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String
    },
    username: {
        required: true,
        type: String,
        unique: true
    },
    phone: {
        required: true,
        type: String,
        unique: true
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    secretQuestion: {
        required: true,
        type: String,
        unique: true
    },
    secretAnswer: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String
    }
},
    { collection: 'login-signup' }
)

module.exports = mongoose.model('userSchema', userSchema);