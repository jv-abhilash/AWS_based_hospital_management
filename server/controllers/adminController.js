const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.json(users);
    } catch (error) {
        res.status(500).send('Server error');
    }
  };
  
exports.searchUsers = async (req, res) => {
    try {
        const { name } = req.query;
        console.log("Search query:", name);
        const users = await User.find({ username: new RegExp(name, 'i') }); // Case-insensitive regex search
        console.log(users);
        res.json(users);
    } catch (error) {
        res.status(500).send('Server error');
    }
  };
  
exports.updateRoles =  async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).send('Server error');
    }
  };