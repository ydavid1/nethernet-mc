const passport = require('passport');
const { Strategy } = require('passport-local');
const LocalUser = require('../database/schemas/LocalUser');
const { comparePassword } = require('../utils/helpers');

passport.use(
    new Strategy({ usernameField: "email" }, async (email, password, done) => {
        console.log(email);
        console.log(password);      
        try {
            if (!email || !password) {
                throw new Error("Email and password are required");
            }
            const user = await LocalUser.findOne({ email: { '$regex': email, $options: 'i' } });
            if (!user) throw new Error("User not found");
            const isValid = comparePassword(password, user.password);
            if (isValid) {
                if (!user.isVerified) {
                    console.log("User not verified!");
                    done("NotVerified", null)
                    return;
                }
                console.log("Successfull authentication!");
                let sendObj = {
                    id: user.id,
                    type: 'local'
                }
                done(null, sendObj)
            } else {
                console.log("Invalid authentication!");
                done("InvalidAuth", null)
            }  
        } catch (err) {
            console.log(err);
            done(err, null)
        }
    })
)