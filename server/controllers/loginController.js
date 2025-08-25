const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

// User Login Route
exports.login =  async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).send('User not found.');
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).send('Invalid credentials.');
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      logger.info(`User ${username} accessed Dashboard`, {
        user: username,
        action: `accessed Dashboard`
    });
      res.json({ token, username: user.username , role: user.role});
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error during login.');
    }
  };