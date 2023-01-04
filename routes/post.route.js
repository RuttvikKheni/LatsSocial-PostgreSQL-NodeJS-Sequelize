const router = require('express').Router();

const { createPostController, updatePostController, deletePostController, fetchPostController } = require("../controllers/post.controller");
const { postLikeCommentController, deleteCommentController } = require("../controllers/likeComment.controller");
const { createPostValidation, updatePostValidation } = require('../validations/post.validate.js');

const userAuthMiddleware = require('../middlewares/userAuth.middleware');
const { uploadPostImage } = require('../middlewares/fileUpload.middleware.js');

router.get("/", userAuthMiddleware, fetchPostController);
router.get("/search", userAuthMiddleware, updatePostValidation, fetchPostController);
router.post("/create", userAuthMiddleware, uploadPostImage, createPostValidation, createPostController);
router.patch("/update/:postID", userAuthMiddleware, uploadPostImage, updatePostValidation, updatePostController);
router.delete("/delete/:postID", userAuthMiddleware, deletePostController);

router.post("/:postID/:type(like|comment)", userAuthMiddleware, postLikeCommentController);
router.delete("/:postID/:type(like|comment)/:commentID", userAuthMiddleware, deleteCommentController);

module.exports = router;