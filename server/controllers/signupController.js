const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../logger');

exports.signup = async (req, res) => {
    const { username, password } = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
      res.status(201).send('User created successfully.');
      logger.info(`User ${username} accessed SignUp`, {
        user: username,
        action: `accessed SignUp`
    });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error registering new user." });
    }
  };
  