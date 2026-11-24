const express = require("express");
const blogController = require("../controllers/blogController");
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

const router = express.Router();

// All Users
router.get("/", blogController.getAllPosts);
router.get("/:id", blogController.getPost); 

// Authenticated Users
router.post("/add", verify, blogController.createBlog);
router.patch("/:id", verify, blogController.addComment);
router.patch("/edit/:id", verify, blogController.updateBlog);
router.delete("/delete/:id", verify, blogController.deleteBlog);

module.exports = router;
