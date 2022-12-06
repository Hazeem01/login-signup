const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller')

router.get('/', (req, res) => {
    res.send(
        'Reset Password!'
    )
})

router.patch('/', controller.reset);

module.exports = router;
