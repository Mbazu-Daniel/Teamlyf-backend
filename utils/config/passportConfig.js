import pkg from "@prisma/client";
const { PrismaClient, AuthStrategy } = pkg;
import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
const prisma = new PrismaClient();

// Local Strategy for email/password
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, {
            message: "Incorrect email or password.",
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error, false);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
        });

        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(
        "🚀 ~ file: passportConfig.js:34 ~ accessToken:",
        accessToken
      );
      console.log(
        "🚀 ~ file: passportConfig.js:34 ~ refreshToken:",
        refreshToken
      );
      let user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value.toLowerCase() },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            googleId: profile.id,
            authStrategy: AuthStrategy.GOOGLE,
          },
        });
      }

      done(null, user);
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(
        "🚀 ~ file: passportConfig.js:59 ~ refreshToken:",
        refreshToken
      );
      console.log(
        "🚀 ~ file: passportConfig.js:59 ~ accessToken:",
        accessToken
      );

      let user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value.toLowerCase() },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            githubId: profile.id,
            authStrategy: AuthStrategy.GITHUB,
          },
        });
      }

      done(null, user);
    }
  )
);

// Serialize and deserialize user instances
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});
