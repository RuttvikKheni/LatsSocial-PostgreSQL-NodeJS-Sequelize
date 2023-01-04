const { unlink } = require("fs");
const { Post } = require("../models");
const { join } = require("path");

const createPost = async (postBody) => {
    const post = await Post.create({ ...postBody });
    return post.toJSON();
}

const findUserPost = async (postID, userID) => {
    const post = await Post.findOne({ id: postID, user_id: userID });
    return post;
}

const deletePost = async (postID, userID) => {
    const post = await findUserPost(postID, userID);
    if (!post) throw Error("post not found");
    unlink(join(`${__dirname}/../public/${post.image}`), console.log);
    await post.destroy();
}

const findUserPosts = async (whereQuery, attributes = null) => {
    console.log("whereQuery", whereQuery);
    const posts = await Post.findAll({ where: whereQuery, attributes });
    return posts;
}

module.exports = {
    createPost,
    findUserPost,
    deletePost,
    findUserPosts
};