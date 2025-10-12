import Users from "../models/user.js";

import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { configDotenv } from "dotenv";
import passport from "passport";

configDotenv({
	quiet: true,
});

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET,
	ignoreExpiration: false,
};

passport.use(
	"jwt",
	new JwtStrategy(options, async (payload, done) => {
		console.log(payload.id);

		try {
			if (!payload.id) {
				return done(null, false, { message: "Invalid Token..!!" });
			}

			const currentTimeStamp = Math.floor(Date.now() / 1000);
			if (payload.exp && payload.exp < currentTimeStamp) {
				return done(null, false, { message: "Token Expired..!!" });
			}

			const user = await Users.findById(payload.id);
			if (!user) {
				return done(null, false, {
					message: "User does not exist..!!",
				});
			}

			return done(null, user);
		} catch (error) {
			return done(error, false);
		}
	})
);

export default passport;
