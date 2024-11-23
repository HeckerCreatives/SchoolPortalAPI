const { default: mongoose } = require('mongoose')


const StudentUserDetailsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Studentusers"
        },
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
        // dateofbirth: {
        //     type: Date
        // },
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


const Studentuserdetails = mongoose.model("Studentuserdetails", StudentUserDetailsSchema)
module.exports = Studentuserdetails