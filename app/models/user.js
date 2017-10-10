var mongoose    = require('mongoose');              // Import Mongoose Package
var Schema      = mongoose.Schema;                  // Assign Mongoose Schema function to variable
var bcrypt      = require('bcrypt-nodejs');         // Import Bcrypt Package
var titlize     = require('mongoose-title-case');   // Import Mongoose Title Case Plugin
var validate    = require('mongoose-validator');    // Import Mongoose Validator Plugin


// User Name Validator
var nameValidator = [
    validate({
        validator: 'matches',
        arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
        message: 'Name must be at least 3 characters, max 30, no special characters or numbers, must have space in between name.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// User E-mail Validator
var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Is not a valid e-mail.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// Username Validator
var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'Username must contain letters and numbers only'
    })
];

// Password Validator
var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
        message: 'Password needs to have at least one lower case, one uppercase, one number, one special character, and must be at least 8 characters but no more than 35.'
    }),
    validate({
        validator: 'isLength',
        arguments: [8, 35],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

var UserSchema = new Schema({
    name:       { type: String, required: true, validate: nameValidator },
    username:   { type: String, required: true, validate: usernameValidator, lowercase: true,  unique: true },
    password:   { type: String, required: true, validate: passwordValidator,                                  select: false },
    email:      { type: String, required: true, validate: emailValidator,    lowercase: true,  unique: true },
    permission: { type: String, required: true, default: 'user'}
});

// Middleware to ensure password is encrypted before saving user to database
UserSchema.pre('save', function(next) {
    var user = this;

    // Function to encrypt password
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);                  // Exit if error is found
        user.password = hash;                       // Assign the hash to the user's password so it is saved in database encrypted
        next();                                     // Exit Bcrypt function
    });
});



// Mongoose Plugin to change fields to title case after saved to database (ensures consistency)
UserSchema.plugin(titlize, {
    paths: ['name']
});

// method pour valider le mot de passe
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);   // Returns true if password matches, false if doesn't
};

module.exports = mongoose.model('User', UserSchema);  // Export User Model for us in API


