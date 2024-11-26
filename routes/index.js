const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/requirement", require("./requirements"))
    app.use("/schoolyear", require("./schoolyear"))
    app.use("/examschedule", require("./examschedule"))
    app.use("/entranceexam", require("./entranceexamstatus"))
    app.use("/ticketuser", require("./ticketuser"))
    app.use("/program", require("./program"))
    app.use("/gradelevel", require("./gradelevel"))
    app.use("/staffuser", require("./staffuser"))
    app.use("/section", require("./section"))
    app.use("/studentuser", require("./studentuser"))
    app.use("/advisory", require("./advisory"))
    app.use("/uploads", require("./upload"))
}

module.exports = routers