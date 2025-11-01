import express from "express";
import { checkAuthorization } from "../middleware/checkAuthorization.js";
import { getHomeRecommendations } from "../controllers/PlaceRecommendationController.js"

const router = express.Router();

// GET personalized home recommendations
router.get("/home", checkAuthorization, getHomeRecommendations);

export default router;
