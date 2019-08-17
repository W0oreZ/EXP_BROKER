const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
  topic: {
    type: String,
    required: true
  },
  subscribers: {
    type: Array,
    default: []
  },
  publishers: {
    type: Array,
    default: []
  },
  admin: {
    type: String,
    default: null
  },
  dt_last: {
    type: Date,
    default: Date.now()
  },
  log: {
    type: Boolean,
    default: false
  },
  io: {
    type: Boolean,
    default: false
  },
  preview: {
    type: String,
    default:""
  }
});

module.exports = Channel = mongoose.model("channels", ChannelSchema);