const mongoose = require("mongoose");

const MarkupSchema = mongoose.Schema(
  {
    textId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Text",
      required: true,
    },
    suggested: { type: Boolean, required: true }, // false表示已经应用，true表示还没accept(就是虚显示)；默认为true
    isEntity: { type: Boolean, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    start: {
      type: Number,
      required: false,
    },
    end: {
      type: Number,
      required: false,
    },
    entityText: { type: String, required: false }, // Text between start/end of entity
    labelId: {
      // UniqueId of element in ontology array Projects
      type: String,
      ref: "Project.ontology",
      required: false, // Not necessary for open relation annotation
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Markup",
      required: false,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Markup",
      required: false,
    },
    labelText: {
      type: String,
      required: false,
    },
    labelStart: { type: Number, required: false },
    labelEnd: { type: Number, required: false },
  },
  { _id: true, timestamps: true }
);

module.exports = mongoose.model("Markup", MarkupSchema);
