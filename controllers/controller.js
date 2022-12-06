require('dotenv').config();

const bcrypt = require('bcryptjs');
const Model = require('../models/user');
const jwt = require('jsonwebtoken');
const { model } = require('mongoose');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
    signup: async (req, res) => {
        const { firstName, lastName, password: plainPassword, phone, email, username, secretQuestion: plainSecretQuestion, secretAnswer: plainSecretAnswer } = req.body;
        if (!firstName || !lastName || !plainPassword || !email || !username || !plainSecretQuestion || !plainSecretAnswer) {
            return res.status(400).json({ message: 'Please, provide complete details!' })
        }
        if (plainPassword.length < 8) {
            return res.status(400).json({ message: 'Password too small, it should be a minimum of 8 characters!' })
        }
        const password = await bcrypt.hash(plainPassword, 10)
        const secretQuestion = await bcrypt.hash(plainSecretQuestion, 10)
        const secretAnswer = await bcrypt.hash(plainSecretAnswer, 10)
        const data = new Model({
            firstName, lastName, password, phone, email, username, secretQuestion, secretAnswer
        });

        try {
            await data.save();
            res.status(201).json({ message: 'User Created Successfully!', data })
        }
        catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Username, email or phone already exists!' })
            }
            console.log(error)
            res.status(500).json({ message: error.message })
        }
    },

    login: async (req, res) => {
        const { password, username } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: `Please, provide all details!` });
        }

        const user = await Model.findOne({ username });
        if (!user) {
            res.status(400).json({ message: `Invalid username/password` })
        }

        if (await bcrypt.compare(password, user.password)) {
            try {
                const token = jwt.sign({ username: Model.username }, JWT_SECRET)

                return res.status(201).json({ message: `${username} logged in successfully!` })
            }
            catch (error) {
                res.status(400).json({ message: error.message })
            }
        }

        return res.status(400).json({ message: `Invalid username or password!` })
    },

    reset: async (req, res) => {
        const { token, username, email, password: plainPassword, phone, secretQuestion, secretAnswer } = req.body;
        if (!email || !plainPassword || !secretAnswer || !secretQuestion || !phone || !username) {
            return res.status(400).json({ message: `Provide all details!` })
        }

        const user = await Model.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: `User with the username: ${username} does not exist !` })
        }
        if (user.email == email && user.phone == phone && await bcrypt.compare(secretAnswer, user.secretAnswer) && await bcrypt.compare(secretQuestion, user.secretQuestion)) {
            const newPassword = await bcrypt.hash(plainPassword, 10);
            const userId = user.id;
            try {
                const verification = jwt.verify(token, JWT_SECRET);
                await Model.updateOne(
                    { userId }, { $set: { password: newPassword } })
                return res.status(201).json({ message: `Password Updated Successfully !, ${verification}` });
            }
            catch (error) {
                return res.status(500).json({ message: error.message })
            }
        }
        return res.status(400).json({ message: `The informations you provided do not match with the user: ${username} !` });
    }
}