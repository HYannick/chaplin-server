const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const userSchema = new Schema({
    username: {
        type: String,
        validate: {
            validator: (name) => name.length > 2,
            message: 'Name must be longer than 2 characters.'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['reader', 'volunteer', 'moderator', 'admin'],
        default: 'reader'
    },
    verified: {
        type: Boolean,
        default: false
    },
    enrolled: [{
        type: Schema.Types.ObjectId,
        ref: 'subs'
    }]
});

userSchema.pre('save', function(next) {
    const user = this;
    const SALT_FACTOR = 5;
    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) {
                return next(err);
            }

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(passwordAttempt, cb) {

    bcrypt.compare(passwordAttempt, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    })

}

const User = mongoose.model('user', userSchema);

module.exports = User;