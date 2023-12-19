import { verifySuperAdmin,verifyLogin } from "../../helper/middleware/authenticate.js";
import { registerUser, loginUser, logoutUser,registerAdminUser,forgetPassword, resetPassword,changePassword } from "./auth.controllers.js";

import express from "express";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", verifyLogin, logoutUser);
authRouter.post("/register-admin",verifySuperAdmin, registerAdminUser);
authRouter.post('/forget-password', verifyLogin,forgetPassword);
authRouter.post('/reset-password', verifyLogin,resetPassword);
authRouter.post('/change-password', verifyLogin, changePassword);

export default authRouter;
