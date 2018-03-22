const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
require('./models/User');
require('./services/passport');

const app = express();

/*
cookieSession extracts data out of cookie and assigns it to req object as 
req.session property. req.session contains data that passport is trying to store
within cookie. then this object is passed on to passport, which is looking at 
req.session, not the cookie directly. It then pulls relevant data out of 
req.session and passes it on to deserializeUser etc

express-session does what cookie-session does, but stores information
in a cookie differently. With cookie-session, the cookie *is* the session.
All of the relevant session data is within the cookie (the user id).

express-session stores a REFERENCE to a session via id within session. So 
anytime a request comes back around through an express-session, it takes the id
and looks up all relevant session data from a "session store" (a db)

with express-session, we can store arbritrary amounts of data. A cookie is 
limited to about 4KB of data. cookie-session is enough for our app. We also 
don't have to set up an additional compatible session store necessary for 
express-session. 
*/

app.use(bodyParser.json());

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);

if(process.env.NODE_ENV === 'production') {
  // express will serve up production assets 
  // like our main.js file, or main.css file
  app.use(express.static('client/build'));

  // express will serve up the index.html file 
  // if it doesn't recognize the route

  // if there are no routes that matches, just give them back
  // the index.html file. All previous attempts to match a route
  // with a resource has failed, so it acts as a catch-all
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

/*
    if above was like this:

    require("./services/passport");
    require('./models/User');

    there'd be an error, because the passport.js file is attempting to use 
    a mongoose model before it has been imported in. so ordering matters!!
*/

mongoose.connect(keys.mongoURI);

const PORT = process.env.PORT || 5000;
app.listen(PORT);

/*
    - HTTP is stateless, state is not shared between different requests
    - Typical login flow:
        - user logs in
        - if successful, server sends some unique, identifying information
          that gets sent back to the client (as a cookie/token)
        - this token is proof that a user logged in to the application and
          that token is equal to the person that logged in in the first place
        - after user logs in, we utilize "Set-Cookie" header
        - browser will automatically take value within "Set-Cookie" header
          and store it into browser's memory. Then automatically append that
          cookie with any follow-up request to the server. 
    - we store a very CONSISTENT piece of information in the user's profile
      to store in our db
*/
