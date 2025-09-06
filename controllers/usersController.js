const User = require('../models/user')

const getAllUsers = async (req , res) => {
    const users = await User.find().select('-password').lean()
    if(!users.length){
        return res.status(400).json({messag : 'Users Not Found'})
    }
    res.json(users)
}

module.exports = {
    getAllUsers
}