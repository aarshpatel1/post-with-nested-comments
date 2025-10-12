import passport from "passport";
import "../config/passport.js";

export const auth = passport.authenticate("jwt", {
	failureRedirect: "/api/auth/failedLogin",
	session: false,
});
