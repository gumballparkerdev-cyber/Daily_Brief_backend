const mongoose = require('mongoose');

const userStateSchema = new mongoose.Schema({
    sessionId: {
        type : String,
        required : true,
        unique : true,
    },

    streak: {
        type: Number,
        default: 0,
    },

    lastBriefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brief', 
    },

    lastBriefDate: {
        type: Date,
    },

    lastDifficulty: {
        type: String,
        enum: ['easy', 'normal', 'hard'],
    },
    lastActionDate: {
        type: Date,
    },
    lastActionType: {
        type: String,
        enum: ['done', 'skip'],
    },
});

module.exports = mongoose.model('UserState', userStateSchema);