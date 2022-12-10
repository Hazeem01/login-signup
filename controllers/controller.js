require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Model = require('../models/user');
const util = require('../utils/utils');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
    signup: async (req, res) => {
        const { firstName, lastName, password: plainPassword, phone, email, username, secretQuestion: plainSecretQuestion, secretAnswer: plainSecretAnswer } = req.body;
        if (!firstName || !lastName || !plainPassword || !email || !username || !plainSecretQuestion || !plainSecretAnswer) {
            util.setError(400, `Please, provide complete details!`);
            return util.send(res);
        }
        if (plainPassword.length < 8) {
            util.setError(400, `Password too small, it should be a minimum of 8 characters!`);
            return util.send(res);
        }
        const password = await bcrypt.hash(plainPassword, 10)
        const secretQuestion = await bcrypt.hash(plainSecretQuestion, 10)
        const secretAnswer = await bcrypt.hash(plainSecretAnswer, 10)
        const data = new Model({
            firstName, lastName, password, phone, email, username, secretQuestion, secretAnswer
        });

        try {
            await data.save();
            util.setSuccess(201, `User: ${username} Created Successfully!`, data);
            return util.send(res);
        }
        catch (error) {
            if (error.code === 11000) {
                util.setError(400, `Username, email or phone already exists!`);
                return util.send(res);
            }
            console.log(error)
            util.setError(500, error.message);
            util.send(res);
        }
    },

    login: async (req, res) => {
        const { password, username } = req.body;

        if (!username || !password) {
            util.setError(400, `Please, provide all details!`);
            return util.send(res);
        }

        const user = await Model.findOne({ username });
        if (!user) {
            util.setError(400, `Invalid username/password`);
            return util.send(res);
        }

        if (await bcrypt.compare(password, user.password)) {
            try {
                const token = jwt.sign({ username: Model.username }, JWT_SECRET)

                util.setSuccess(201, `User logged in Successfully!`, user.username);
                return util.send(res);
            }
            catch (error) {
                util.setError(400, error.message);
                return util.send(res);
            }
        }

        util.setError(400, `Invalid password`);
        return util.send(res);
    }
}