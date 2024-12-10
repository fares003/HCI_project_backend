const User = require('../model/users');
const bcrypt = require('bcrypt');


const handleReg = async (req, res) => {
    try {
        const { email, firstname, lastname, password } = req.body;
        if (!email || !password || !firstname || !lastname) {
            return res.status(400).json({ 'message': 'Username, password, first name, and last name are required.' });
        }

        // check for duplicate email in the db
        const duplicate = await User.findOne({ email: email }).exec();
        if (duplicate) {
            return res.sendStatus(409); //Conflict 
        }

        // Encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);


        const result = await User.create({
            "firstname": firstname,
            "password": hashedPwd,
            "lastname": lastname,
            "email": email,
        });

        console.log(result);

        res.status(201).json({ 'success': `New user ${email} created!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Internal server error.' });
    }
}

module.exports = { handleReg };
