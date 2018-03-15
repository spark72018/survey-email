const passport = require("passport");

// a redirect uri mismatch is to make sure that a malicious user cannot
// change the redirect uri to their own server and record the response code
// that google has sent. If they got that, they would be able to send that code
// back to google, and have access to the user's profile/email etc

module.exports = app => {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      // "google" string identifies to passport to use above strategy
      scope: ["profile", "email"] // don't actually need for our application, just show what we can access
    })
  );

  app.get("/auth/google/callback", passport.authenticate("google"));

  app.get("/api/logout", (req, res) => {
    // logout() is attached to req object by pasport
    // logout takes the cookie with the user id and destroys the cookie (?)

    req.logout(); 
    res.send(req.user); // to prove user is logged out, should be sending back undefined or null or something
  });

  app.get("/api/current_user", (req, res) => {
    // test route to inspect req.user object
    res.json(req.user);
  });
};
