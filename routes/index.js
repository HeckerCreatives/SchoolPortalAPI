const routers = app => {
    console.log("Routers are all available");

    app.use("/advisory", require("./advisory"))
    app.use("/assignment", require("./assignment"))
    app.use("/announcement", require("./announcements"))
    app.use("/auth", require("./auth"))
    app.use("/enrollmentschedule", require("./enrollmentschedule"))
    app.use("/enrollmentfee", require("./enrollmentfee"))
    app.use("/entranceexam", require("./entranceexamstatus"))
    app.use("/event", require("./event"))
    app.use("/examschedule", require("./examschedule"))
    app.use("/gradelevel", require("./gradelevel"))
    app.use("/gradingperiod", require("./gradingperiod"))
    app.use("/requirement", require("./requirements"))
    app.use("/schoolyear", require("./schoolyear"))
    app.use("/supportconversation", require("./supportconversation"))
    app.use("/supportmessage", require("./supportmessage"))
    app.use("/news", require("./news"))
    app.use("/program", require("./program"))
    app.use("/quest", require("./quest"))
    app.use("/staffuser", require("./staffuser"))
    app.use("/subject", require("./subject"))
    app.use("/subjectgrade", require("./subjectgrade"))
    app.use("/schedule", require("./schedule"))
    app.use("/section", require("./section"))
    app.use("/studentuser", require("./studentuser"))
    app.use("/ticketuser", require("./ticketuser"))
    app.use("/evaluation", require("./evaluation"))
    app.use("/evaluationresponse", require("./evaluationresponse"))
    
    app.use("/uploads", require("./upload"))
}

module.exports = routers