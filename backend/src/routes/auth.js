import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
  const client_id = process.env.SPOTIFY_CLIENT_ID;

  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}`
  );
});

export default router;