const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Posts extends Model {
    static associate(db) {
      db.Post.belongsTo(db.User, { as: "user", foreignKey: "user_id" });
      db.Post.hasMany(db.LikeComment, { as: "likes", foreignKey: "post_id" });
      db.Post.hasMany(db.LikeComment, { as: "comments", foreignKey: "post_id" });
    }
  }

  Posts.init({
    title: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: { notNull: { msg: "title is required" } }
    },
    description: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: { notNull: { msg: "description is required" } }
    },
    image: {
      type: DataTypes.STRING,
      trim: true,
      allowNull: false,
      validate: { notNull: { msg: "image is required" } }
    }
  }, {
    sequelize,
    modelName: 'Post'
  });

  return Posts;
};