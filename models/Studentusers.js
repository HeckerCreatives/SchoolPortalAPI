
const bcrypt = require('bcrypt')
const { default: mongoose } = require('mongoose')


const StudentUsersSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        webtoken: {
            type: String
        },
        status: {
            type: String,
            default: "active"
        },
    }, 
    {
        timestamps: true,
    }
)

StudentUsersSchema.pre("save", async function (next) {
    if (!this.isModified){
        next();
    }

    this.password = await bcrypt.hashSync(this.password, 10)
})

StudentUsersSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const Studentusers = mongoose.model("Studentusers", StudentUsersSchema)
module.exports = Studentusers