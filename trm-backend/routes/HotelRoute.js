import express from "express";
import multer from "multer";
import {
  createHotel,
  getHotelsByPlace,
  getHotelById,
  updateHotel,
  deleteHotel,
 getAllHotels
} from "../controllers/HotelController.js"

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), createHotel);
router.get("/place/:placeId", getHotelsByPlace);
router.get("/:id", getHotelById);
router.put("/:id", upload.single("image"), updateHotel);
router.delete("/:id", deleteHotel);
router.get("/", getAllHotels);

export default router;
