const router = require('express').Router();

const { getMe, createUserController, loginUserController, updateUserController, removeAvatarUserController, deleteUserController, regenerateAccessToken } = require("../controllers/user.controller");
const { createUserValidation, loginUserValidation, updateUserValidation, userAccessTokenValidation } = require('../validations/user.validate');
const { userAvatarUpdate } = require('../middlewares/fileUpload.middleware');
const userAuthMiddleware = require('../middlewares/userAuth.middleware');

router.get("/me", userAuthMiddleware, getMe);

router.post("/login", loginUserValidation, loginUserController);
router.post("/create", createUserValidation, createUserController);

router.patch("/update", userAuthMiddleware, userAvatarUpdate, updateUserValidation, updateUserController);
router.patch("/remove-avatar", userAuthMiddleware, removeAvatarUserController);

router.delete("/delete", userAuthMiddleware, deleteUserController);

router.post("/access-token", userAccessTokenValidation, regenerateAccessToken);

module.exports = router;