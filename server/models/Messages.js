const mongoose = require('mongoose');

const messegesSchema = mongoose.Schema({
    conversationId:{
        type: String,
        required: true,
        unique:true,
    },
    senderId : {
        type: String
    },
    messege: {
        type: String
    }
});

const Messeges = mongoose.model('Messege', messegesSchema);
module.exports= Messeges;