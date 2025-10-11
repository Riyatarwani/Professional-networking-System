import express from "express";
import { getMessages, sendMessage } from "../routeControllers/messageroutecontroller.js";
import isLogin from "../middleware/isLogin.js";

const router = express.Router();

// Message routes - simplified paths since we mount at /api/message
router.post('/send/:id', isLogin, sendMessage);
router.get('/:id', isLogin, getMessages);

export default router;