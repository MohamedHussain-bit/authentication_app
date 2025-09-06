const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const register =  async (req , res) => {
    const {first_name , last_name , email , password} = req.body
    if(!first_name || !last_name || !email || !password){
        return res.status(400).json({message : 'All fields are required'})
    }
    const foundUser = await User.findOne({email : email}).exec()
    if(foundUser){
        return res.status(401).json({message : 'User already exists'})
    }
    const hashedPassword = await bcrypt.hash(password , 10)

    const user = await  User.create({
        first_name : first_name ,
        last_name : last_name,
        email : email,
        password : hashedPassword,
    })
    const accessToken = jwt.sign({
        userInfo : {
            id : user._id
        }
    }, process.env.ACCESS_TOKEN_SECRET , {expiresIn : '15m'})
    const refreshToken = jwt.sign({
          userInfo : {
            id : user._id
        }
    } , process.env.REFRESH_TOKEN_SECRET , {expiresIn : '7d'})
    res.cookie('jwt' , refreshToken , {
        httpOnly : true,
        secure : true,
        sameSite : 'None',
        maxAge : 7 * 24 * 60 * 60 * 1000
    })
    res.json({
        accessToken,
        email:user.email,
        first_name:user.first_name,
        last_name:user.last_name
    })
}

const login =  async (req , res) => {
    const {email , password} = req.body
    if(!email || !password){
        return res.status(400).json({message : 'All fields are required'})
    }
    const foundUser = await User.findOne({email : email}).exec()
    if(!foundUser){
        return res.status(401).json({message : 'User dose not exists'})
    }
    const matchPassword = await bcrypt.compare(password , foundUser.password)
    if(!matchPassword) return res.status(401).json({message : 'Wrong password'})


    const accessToken = jwt.sign({
        userInfo : {
            id : foundUser._id
        }
    }, process.env.ACCESS_TOKEN_SECRET , {expiresIn : '15m'})
    const refreshToken = jwt.sign({
          userInfo : {
            id : foundUser._id
        }
    } , process.env.REFRESH_TOKEN_SECRET , {expiresIn : '7d'})
    res.cookie('jwt' , refreshToken , {
        httpOnly : true,
        secure : true,
        sameSite : 'None',
        maxAge : 7 * 24 * 60 * 60 * 1000
    })
    res.json({
        accessToken,
        email:foundUser.email
    })
}

module.exports = {
    register,
    login
}