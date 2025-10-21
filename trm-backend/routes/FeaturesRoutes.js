import express from "express";
import { getFeaturedPlacesWithHotels } from "../controllers/FeaturesController.js";

const router = express.Router();

// This endpoint will be /api/features/featured-places
// featuredPlacesRoutes.js
router.get("/", getFeaturedPlacesWithHotels);


export default router;
