import express from "express";
import { getReviews, addReview, updateReview, deleteReview } from "../controllers/reviewController.js";
import { checkAuthorization } from "../middleware/checkAuthorization.js";

const router = express.Router();

// GET reviews by query params: ?type=Place&id=xxx or ?type=Hotel&id=xxx
router.get("/", getReviews);

// POST a review
router.post("/", checkAuthorization, addReview);

// PATCH review
router.patch("/:id", checkAuthorization, updateReview);

// DELETE review
router.delete("/:id", checkAuthorization, deleteReview);

export default router;
