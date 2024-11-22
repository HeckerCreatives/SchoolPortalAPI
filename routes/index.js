const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/requirement", require("./requirements"))
    app.use("/schoolyear", require("./schoolyear"))
    app.use("/examschedule", require("./examschedule"))
    app.use("/entranceexam", require("./entranceexamstatus"))
}

module.exports = routers