import jwt from "jsonwebtoken" // this file is to improve security

const jwtToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d" // token expires in 30 days
  });

  // Use SameSite=None and Secure in production so cookies work across origins (frontend <> backend).
  // In development (localhost) we'll use Lax for convenience.
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie('jwt', token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction // secure must be true when SameSite=None (and in production HTTPS)
  });
};

export default jwtToken;
