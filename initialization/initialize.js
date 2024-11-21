const StaffUsers = require("../models/Staffusers")
const { default: mongoose } = require("mongoose")
const Ticketcounter = require("../models/Ticketcounter")


exports.initialize = async () => {

    const admin = await StaffUsers.find({ auth: "superadmin"})
    .then(data => data)
    .catch(err => {
        console.log(`Error finding the admin data: ${err}`)
        return
    })

    if(admin.length <= 0 ){
        await StaffUsers.create({ username: "SchoolSuperadmin", password: "LKOHosadIoDKO", webtoken: "", status: "active", auth: "superadmin"})
        .catch(err => {
            console.log(`Error saving admin data: ${err}`)
            return
        }) 
    }

    const existingCounter = await Ticketcounter.find({ name: "ticketUserCounter" })
    .then(data => data)
    .catch(err => {
        console.log(`Error finding the counter data: ${err}`)
        return
    })

    if(existingCounter.length <= 0){
        await Ticketcounter.create({ name: "ticketUserCounter", value: 0 })
        .catch(err => {
            console.log(`Error saving counter data: ${err}`)
            return
        })
    }

    console.log("SERVER DATA INITIALIZED")
}