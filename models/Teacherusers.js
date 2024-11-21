
const bcrypt = require('bcrypt')
const { default: mongoose } = require('mongoose')


const TeacherUsersSchema = new mongoose.Schema(
    {
        username: {
            type: String,
        },
        password: {
            type: String
        },
        webtoken: {
            type: String
        },
        status: {
            type: String,
            default: "active"
        },
        auth: {
            type: String
        }
    }, 
    {
        timestamps: true,
    }
)

TeacherUsersSchema.pre("save", async function (next) {
    if (!this.isModified){
        next();
    }

    this.password = await bcrypt.hashSync(this.password, 10)
})

TeacherUsersSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const Teacherusers = mongoose.model("Teacherusers", TeacherUsersSchema)
module.exports = Teacherusers