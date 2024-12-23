import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Schema } from "mongoose";

const videoSchema = new Schema({
    videoFile: {
        type: String, // cloudinary
        required: true,
    },
    thumbnail: {
        type: String, // cloudinary
        required: true,
    },
    title: {
        type: String, 
        required: true,
    },
    description: {
        type: String, 
        required: true,
    },
    thumbnail: {
        type: String, // cloudinary
        required: true,
    },
    duration: {
        type: Number, // cloudinary
        required: true,
    },
    views: {
        type: Number, // cloudinary
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

}, {timeseries: true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)