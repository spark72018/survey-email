const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users"); // our model class that creates mmodel instances

passport.serializeUser((user, done) => {
  done(null, user.id); // this id is the mongoDB id
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    });
});

// deserialize user takes the user.id we stuck on to the cookie
// and converts it back into a User model for us

// passport.use is a generic register without identifying
// a specific service/provider, we tell passport we are using Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/auth/google/callback",
      proxy: true // after user grants permission, user gets sent to this route
    },            // relative path allows us to ignore domain, however, 
                  // GoogleStrategy is appending 'http' behind the scenes when req 
                  // goes through any sort of proxy, and it goes through heroku proxy
                  // in production 
    /*
          this function is our opportunity to create a new user 
          inside our own database and give user access to our app's functionalities.
  
          accessToken: is a token for us to go back to google that allows us to modify user's profile
          refreshToken: allows us to refresh accessToken after it has expired (irrelevant to our app)
  
      */
    (accessToken, refreshToken, profile, done) => {
      // user has come back to server,
      User.findOne({ googleID: profile.id }).then(existingUser => {
        if (existingUser) {
          // existingUser will  be null if not found
          // we already have a record w/ given profile ID
          done(null, existingUser); // first param is err object, but we found user, so pass in null to say "no error"
        } else {
          // second param is the user record retrieved from db
          // we don't have a user record with this ID, make new
          new User({ googleID: profile.id })
            .save()
            .then(user => done(null, user));
        }
      });
    }
  )
);
