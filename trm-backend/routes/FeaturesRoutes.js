import express from "express";
import { getFeaturedPlacesWithPopularHotels } from "../controllers/FeaturesController.js";

const router = express.Router();

// This endpoint will be /api/features/featured-places
router.get("/features-places", getFeaturedPlacesWithPopularHotels);

export default router;
