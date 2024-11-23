const StaffUsers = require("../models/Staffusers");
const { default: mongoose } = require("mongoose");
const Ticketcounter = require("../models/Ticketcounter");
const Studentusers = require("../models/Studentusers"); // Import the Studentusers model

exports.initialize = async () => {

    // Initialize the superadmin account if it doesn't exist
    const admin = await StaffUsers.find({ auth: "superadmin" })
        .then(data => data)
        .catch(err => {
            console.log(`Error finding the admin data: ${err}`);
            return;
        });

    if (admin.length <= 0) {
        await StaffUsers.create({
            username: "SchoolSuperadmin",
            password: "LKOHosadIoDKO",
            webtoken: "",
            status: "active",
            auth: "superadmin"
        }).catch(err => {
            console.log(`Error saving admin data: ${err}`);
            return;
        });
    }

    // Initialize the ticket user counter if it doesn't exist
    const existingTicketCounter = await Ticketcounter.find({ name: "ticketUserCounter" })
        .then(data => data)
        .catch(err => {
            console.log(`Error finding the ticket counter data: ${err}`);
            return;
        });

    if (existingTicketCounter.length <= 0) {
        await Ticketcounter.create({ name: "ticketUserCounter", value: 0 })
            .catch(err => {
                console.log(`Error saving ticket counter data: ${err}`);
                return;
            });
    }

    // Initialize the student user counter if it doesn't exist
    const existingStudentCounter = await Ticketcounter.find({ name: "studentUserCounter" })
        .then(data => data)
        .catch(err => {
            console.log(`Error finding the student counter data: ${err}`);
            return;
        });

    if (existingStudentCounter.length <= 0) {
        await Ticketcounter.create({ name: "studentUserCounter", value: 0 })
            .catch(err => {
                console.log(`Error saving student counter data: ${err}`);
                return;
            });
    }

    console.log("SERVER DATA INITIALIZED");
};
