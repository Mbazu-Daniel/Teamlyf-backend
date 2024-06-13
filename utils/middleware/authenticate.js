import pkg from "@prisma/client";
const { UserRole } = pkg;
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const bearerToken = req.headers.authorization?.split(" ")[1];
  const cookiesToken = req.cookies.access_token;
  // const token = bearerToken || cookiesToken;
  const token = cookiesToken || bearerToken;

  if (!token) {
    return res.status(403).json({ msg: "You must be logged in" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (err) return res.status(403).json({ msg: "Token is not valid" });
    // next(createError(403, "Token is not valid!"));
    req.user = decodedToken;
    next();
  });
};

const verifyLogin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ msg: "You're not logged in" });
  }
  next();
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);

    if (
      req.user.id === req.params.id ||
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.SUPER_ADMIN
    ) {
      next();
    } else {
      res.status(403).json({ message: "You are not authorized! User" });
    }
  });
};

const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);

    if (req.user.role === UserRole.SUPER_ADMIN) {
      next();
    } else {
      res.status(403).json({ message: "You are not an administrator" });
    }
  });
};

export { verifyToken, verifySuperAdmin, verifyUser, verifyLogin };
