const postService = require("./../servies/post.service");
const likeCommentService = require("./../servies/likeComment.service");
const catchAsync = require("./../utils/controllerErrorHandler");

const postLikeCommentController = catchAsync(async (req, res) => {
    const { type, postID } = req.params;
    const { id: userID } = req.user;

    const post = await postService.findUserPost(postID, userID);
    if (!post) throw Error("Post not found");

    if (type === "like") {
        const like = await likeCommentService.findLikeOrCommentInPost("like", postID, userID);
        if (!like) {
            await likeCommentService.postLike(postID, userID);
            return res.status(200).json({ error: false, message: "like added in this post" });
        }
        await like.destroy();
        return res.status(200).json({ error: false, message: "like removed in this post" });
    }
    if (type === "comment") {
        const { message } = req.body;
        if (!message) throw Error("message is required for add comment");
        await likeCommentService.addCommentInPost(message, postID, userID);
        return res.status(200).json({ error: false, message: "comment added in this post" });
    }
    throw Error("invalid type for this type");
});

const deleteCommentController = catchAsync(async (req, res) => {
    const { commentID, type, postID } = req.params;
    const { id: userID } = req.user;
    if (type !== "comment") throw Error("invalid request. please try again");

    await likeCommentService.deleteComment(commentID, postID, userID);

    return res.status(200).json({ error: false, message: "comment deleted successfully" });
})

module.exports = { postLikeCommentController, deleteCommentController };