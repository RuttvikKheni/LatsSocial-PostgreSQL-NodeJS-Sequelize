const catchAsync = require("./../utils/controllerErrorHandler");
const userService = require("./../servies/user.service");
const { User, Post, LikeComment, FollowersFollowing } = require("./../models");
const { isEmpty } = require("./../utils");
const { createTokenPair } = require("./../utils/JWTtokenHandler");
const { Op } = require("sequelize");
const { compare } = require("bcrypt");
const { verify } = require("jsonwebtoken");
const { rtSecretKey } = require("../config");

const getMe = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    const user = await userService.findUser({ id: userID }, { exclude: ["password"] }, {
        include: [
            {
                model: Post,
                as: "posts",
                attributes: {
                    exclude: ["user_id"]
                },
                include: [
                    {
                        model: LikeComment,
                        as: "likes",
                        where: { type: "like" },
                        required: false,
                        attributes: {
                            exclude: ["type", "post_id", "user_id", "createdAt"]
                        },
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["fname", "lname", "avatar"]
                            }
                        ]
                    },
                    {
                        model: LikeComment,
                        as: "comments",
                        required: false,
                        where: { type: "comment" },
                        attributes: {
                            exclude: ["type", "post_id", "user_id", "createdAt"]
                        },
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["fname", "lname", "avatar"]
                            }
                        ]
                    }
                ]
            },
            {
                model: FollowersFollowing,
                as: "followers",
                attributes: { exclude: ["sender_id", "receiver_id", "createdAt"] },
                where: { status: "accepted" },
                required: false,
                include: {
                    model: User,
                    as: "sender_user",
                    attributes: { exclude: ["updatedAt", "gender", "username", "updatedAt", "password"] },
                }
            },
            {
                model: FollowersFollowing,
                as: "following",
                attributes: { exclude: ["sender_id", "receiver_id", "createdAt"] },
                where: { status: "accepted" },
                required: false,
                include: {
                    model: User,
                    as: "receiver_user",
                    attributes: { exclude: ["updatedAt", "gender", "username", "updatedAt", "password"] },
                }
            },
            {
                model: LikeComment,
                as: "likes",
                required: false,
                where: { type: "like" },
                attributes: { exclude: ["user_id", "createdAt"] },
                include: {
                    model: Post,
                    as: "post",
                    attributes: { exclude: ["user_id", "createdAt"] },
                }
            },
            {
                model: LikeComment,
                as: "comments",
                where: { type: "comment" },
                required: false,
                attributes: { exclude: ["user_id", "createdAt"] },
                include: {
                    model: Post,
                    as: "post",
                    attributes: { exclude: ["user_id", "createdAt"] },
                }
            }
        ]
    });

    return res.status(201).json({ error: false, message: "user profile fetched successfully", data: user });
});

const createUserController = catchAsync(async (req, res) => {
    const userBody = req.body;
    const user = await userService.createUser(userBody);
    const tokens = createTokenPair(user);
    return res.status(201).json({ error: false, message: "user created successfully", data: { ...user, tokens: tokens } });
});

const loginUserController = catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const requestedUser = await userService.findUser({ [Op.or]: [{ username }, { email: username }] }, ["id", "fname", "lname", "gender", "avatar", "email", "username", "password"]);
    const isValidPassword = compare(password, requestedUser.password);

    if (!isValidPassword)
        throw Error("Invalid password, try again with correct password")
    delete requestedUser.password;

    const tokens = createTokenPair(requestedUser);
    return res.status(200).json({ error: false, message: "user loggedin successfully", data: { ...requestedUser, token: tokens } });
});

const updateUserController = catchAsync(async (req, res) => {
    if (isEmpty(req.body))
        throw Error("Please provide details for update");

    const { fname, lname, avatar } = req.body;
    const { id: userID } = req.user;

    await userService.updateUsers({
        ...(fname ? { fname } : {}), ...(lname ? { lname } : {}), ...(avatar ? { avatar } : {})
    }, { id: userID }, ["id", ...Object.keys(req.body)]);

    return res.status(200).json({ error: false, message: "user info updated successfully" });
});

const removeAvatarUserController = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    await userService.deleteUserAvatar(userID);
    return res.status(200).json({ error: false, message: "user avatar removed successfully" });
});

const deleteUserController = catchAsync(async (req, res) => {
    const { id: userId } = req.user;
    await userService.deleteUser(userId);
    return res.status(200).json({ error: false, message: "user account deleted successfully" });
});

const regenerateAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    const user = await verify(refreshToken, rtSecretKey);

    const isValidUser = await userService.isValidUser(user.id);

    if (!isValidUser)
        throw Error("User not found");

    delete user.exp;
    delete user.iat;

    const newLoginTokenPair = createTokenPair(user);

    return res.status(200).json({ error: false, message: "new access-token generated successfully from refresh-token", data: newLoginTokenPair });
});

module.exports = {
    getMe,
    createUserController,
    loginUserController,
    updateUserController,
    removeAvatarUserController,
    deleteUserController,
    regenerateAccessToken
}