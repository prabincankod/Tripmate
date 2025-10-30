import express from "express";
import multer from "multer";
import {
  createHotel,
  getHotelsByPlace,
  getHotelById,
  updateHotel,
  deleteHotel,
  getAllHotels,
  recommendHotels,
 

} from "../controllers/HotelController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 1️⃣ Create a hotel
router.post("/", upload.single("image"), createHotel);

// 2️⃣ Get hotels by a specific feature/amenity


// 3️⃣ Recommend hotels based on user's location
router.post("/recommend-hotel", recommendHotels);

// 4️⃣ Get nearby hotels (requires query params: lng, lat, distance)


// 5️⃣ Get hotels by place
router.get("/place/:placeId", getHotelsByPlace);

// 6️⃣ Get all hotels — catch-all, must come BEFORE dynamic ID
router.get("/", getAllHotels);

// 7️⃣ Dynamic route for hotel by ID — must come LAST
router.get("/:id", getHotelById);

// 8️⃣ Update hotel by ID
router.put("/:id", upload.single("image"), updateHotel);

// 9️⃣ Delete hotel by ID
router.delete("/:id", deleteHotel);


export default router;



