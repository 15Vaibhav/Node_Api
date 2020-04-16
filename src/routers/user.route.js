/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */
const express = require('express');
const User = require('../models/user');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/user/me', auth, async (req, res) => {
        res.send(req.user);
});

router.get('/user/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/createUser', async (request, response) => {
    const user = new User(request.body);
    try {
        const token = await user.generateToken();
        user.tokens = user.tokens.concat({ token });
        await user.save();
        response.status(201).send({ user, token });
    } catch (error) {
        response.status(400).send(error);
    }
});

router.post('/login', async (request, response) => {
    try {
       const user = await User.findByEmailAndPassword(request.body.email, request.body.password);
       const token = await user.generateToken();
       user.tokens = user.tokens.concat({ token });
       await user.save();
       response.send({ user, token });
    } catch (error) {
        console.log(error);
        response.status(400).send(error);
    }
});

router.post('/logout', auth, async (request, response) => {
    try {
        request.user.tokens = request.user.tokens.filter((token) => token.token !== request.token);
        await request.user.save();
        response.send();
    } catch (error) {
        response.status(500).send(error);
    }
});

router.post('/logoutAll', auth, async (request, response) => {
    try {
        request.user.tokens = [];
        await request.user.save();
        response.send();
    } catch (error) {
        response.status(500).send(error);
    }
});

router.patch('/update', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    try {
        updates.forEach((key) => req.user[key] = req.body[key]);
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/delete', auth, async (request, response) => {
try {
    await request.user.remove();
    response.send(request.user);
} catch (error) {
    response.status(500).send();
}
});

router.post('/createTask', auth, async (req, res) => {
    console.log('task');
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await task.save();
        res.status(201).send({ task });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/getTaskById/:id', auth, async (req, res) => {
    const _id = req.params.id;
    console.log(_id);
    console.log(req.user._id);
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

router.get('/tasks', auth, async (req, res) => {
    try {
        const match = {};
        if (req.query.completed) {
            match.completed = req.query.completed === 'true';
        }
        const tasks = await Task.find({
            owner: req.user.id,
            completed: match.completed,
         }).skip(parseInt(req.query.skip, 10)).limit(parseInt(req.query.limit, 10));
        res.send(tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});
module.exports = router;
