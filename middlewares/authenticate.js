import jwt from "jsonwebtoken";
import { createError } from "./errors.js";

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.SECRETKEY, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user;
    next();
  });
};

const verifyLogin = (req, res, next) => {
  const token = req.cookies.access_token;

  if (token) {
    // Verify the token and extract the user information
    jwt.verify(token, process.env.SECRETKEY, (err, decodedToken) => {
      if (err) {
        res.status(403).json({ message: "Unauthorized" });
      } else {
        // Set the user information on the request object
        req.user = decodedToken;
        next();
      }
    });
  } else {
    res.status(403).json({ message: "You're not logged in" });
  }
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);

    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);

    if (req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

export { verifyToken, verifyAdmin, verifyUser, verifyLogin };