const mongoose = require("mongoose");

// 数据库：根据schema创建一个model (User)，model管理一系列文档
const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    colour: {
      type: String,
      default: "#90a4ae",
    },
    public: {
      type: Boolean,
      required: true,
      default: true,
    },
    projects: [
      {
        project: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
          required: false,
        },
        accepted: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },
  { _id: true, timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
