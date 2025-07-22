const mongoose = require('mongoose');

const carerecepientsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    remark: {
        type: String,
        required: true
    },
    caregiverId: {
        type: String,
        required: true
    }
})

const Carerecepients = mongoose.model('Caregiver', carerecepientsSchema);
module.exports = Carerecepients;