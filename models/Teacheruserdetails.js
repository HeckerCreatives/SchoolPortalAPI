const { default: mongoose } = require('mongoose')


const TeacherUserDetailsSchema = new mongoose.Schema(
    {
        idnumber: {
            type: String,
            unique: true,
        },
        firstname: {
            type: String,
        },
        middlename: {
            type: String,
        },
        lastname: {
            type: String,
        },
        gender: {
            type: String
        },
        dateofbirth: {
            type: Date
        },
        address: {
            type: String
        },
        email: {
            type: String
        },
        contact: {
            type: Number
        },
        profilepicture: {
            type: String,
        }
    }, 
    {
        timestamps: true,
    }
)


const Teacheruserdetails = mongoose.model("Teacheruserdetails", TeacherUserDetailsSchema)
module.exports = Teacheruserdetails