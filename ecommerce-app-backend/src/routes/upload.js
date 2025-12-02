// routes/upload.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Config multer lưu file tạm trong RAM
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware nhỏ để chỉ admin (hoặc user đã login) dùng – tuỳ em
// const { authenticate } = require("../middleware/authMiddleware");

// Upload ảnh
router.post("/image",/* authenticate,*/ upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file được upload" });
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce_app/products", // tên folder trên Cloudinary (tuỳ em)
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Upload lên Cloudinary thất bại" });
        }
        return res.json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Ghi dữ liệu buffer vào stream
    const stream = result;
    stream.end(req.file.buffer);
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload video
router.post("/video", /* authenticate,*/ upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file được upload" });
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce_app/videos",
        resource_type: "video",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Upload video lên Cloudinary thất bại" });
        }
        return res.json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    const stream = result;
    stream.end(req.file.buffer);
  } catch (err) {
    console.error("Upload video error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;