import express from "express";
import {
  createPlace,
  getPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
  getWeatherForPlace,
  getNearbyPlaces,
  searchPlaces,
    getPlacesByTravelStyle

  
} from "../controllers/PlaceController.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { checkAuthorization, checkAdminOnly } from "../middleware/checkAuthorization.js";

const router = express.Router();

// ------------------- GET ROUTES ------------------- //
router.get("/", getPlaces);
router.get("/travel-style/:style", getPlacesByTravelStyle);
router.get("/search/:query", searchPlaces);
router.get("/nearby/search", getNearbyPlaces);



router.get("/:id/weather", getWeatherForPlace);
router.get("/:id", getPlaceById);



// ------------------- POST ROUTES ------------------- //
// Admin only, form-data with optional images
router.post(
  "/",
  checkAuthorization,
  checkAdminOnly,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "attractionImages", maxCount: 10 },
    { name: "thingsToDoImages", maxCount: 10 },
    { name: "hotelsImages", maxCount: 10 },
    { name: "localCultureImages", maxCount: 10 },
    { name: "localCuisineImages", maxCount: 10 },
  ]),
  createPlace
);

// ------------------- PUT ROUTES ------------------- //
// Admin only, form-data with optional images
router.put(
  "/:id",
  checkAuthorization,
  checkAdminOnly,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "attractionImages", maxCount: 10 },
    { name: "thingsToDoImages", maxCount: 10 },
    { name: "hotelsImages", maxCount: 10 },
    { name: "localCultureImages", maxCount: 10 },
    { name: "localCuisineImages", maxCount: 10 },
  ]),
  updatePlace
);

// ------------------- DELETE ROUTES ------------------- //
router.delete("/:id", checkAuthorization, checkAdminOnly, deletePlace);

export default router;
