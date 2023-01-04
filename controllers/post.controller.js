const { Op } = require("sequelize");
const postService = require("../servies/post.service");
const { isEmpty } = require("../utils");
const catchAsync = require("./../utils/controllerErrorHandler");

const createPostController = catchAsync(async (req, res) => {
    const postBody = req.body;
    const { id: userID } = req.user;

    const post = await postService.createPost({ ...postBody, user_id: userID });
    if (!post) throw Error("post not created");

    return res.status(200).json({ error: false, message: "user post create successfully", data: post });
});

const updatePostController = catchAsync(async (req, res) => {
    if (isEmpty(req.body)) throw Error("Please provide details for update in post");

    const { postID } = req.params;
    const { title, description, image } = req.body;
    const { id: userID } = req.user;

    const post = await postService.findUserPost(postID, userID);
    if (!post) throw Error("post not found");

    if (title) post.title = title;
    if (description) post.description = description;
    if (image) post.image = image;

    await post.save();
    return res.status(200).json({ error: false, message: "user post updated successfully" });
});

const deletePostController = catchAsync(async (req, res) => {
    const { postID } = req.params;
    const { id: userID } = req.user;
    await postService.deletePost(postID, userID);
    return res.status(200).json({ error: false, message: "user post deleted successfully" });
});

const fetchPostController = catchAsync(async (req, res) => {
    const { id: userID } = req.user;
    const { title, description } = req.body;
    const posts = await postService.findUserPosts({
        ...title ? { title: { [Op.iLike]: `%${title}%` } } : {},
        ...description ? { description: { [Op.iLike]: `%${description}%` } } : {},
        user_id: userID
    }, ["id", "title", "image", "description"]);
    return res.status(200).json({ error: false, message: "user post fetched successfully", data: posts });
});

module.exports = { createPostController, updatePostController, deletePostController, fetchPostController };