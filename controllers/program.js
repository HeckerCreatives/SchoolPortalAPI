const { default: mongoose } = require("mongoose")
const Program = require("../models/Program")
const Schedule = require("../models/Schedule");
const EnrollmentSchedule = require("../models/Enrollmentschedule")




exports.getAllPrograms = async (req, res) => {
    const programData = await Program.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching program data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
    })
    if(!programData){
        return res.status(400).json({ message: "failed", data: "No existing program data."})
    }
    const finaldata = []

    programData.forEach(temp => {
        finaldata.push({
            id: temp._id,
            name: temp.name, 
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})
}

exports.CreateProgram = async (req, res) => {
    const { name } = req.body

    if(!name){
        return res.status(400).json({ message: "failed", data: "Please input program name."})
    }

    await Program.create({
        name: name
    })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while creating program. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    return res.status(200).json({ message: "success" })
}

exports.EditProgram = async (req, res) => {
    const { id, name } = req.body

    if(!id){
        return res.status(400).json({ message: "failed", data: "Please select a program to edit."})
    }

    if(!name){
        return res.status(400).json({ message: "failed", data: "Please input program name."})  
    }

    await Program.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id)}, { $set: { name: name } } )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while updating program. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    }) 

    return res.status(200).json({ message: "success" })
}

exports.DeleteProgram = async (req, res) => {
    const { id } = req.query

    if(!id){
        return res.status(400).json({ message: "failed", data: "Please select a program to delete."})
    }

    await Program.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while deleting a program. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    }) 

    return res.status(200).json({ message: "success" })
}




exports.getAllPrograms = async (req, res) => {
    const programData = await Program.find()
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while fetching program data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
    })
    if(!programData){
        return res.status(400).json({ message: "failed", data: "No existing program data."})
    }
    const finaldata = []

    programData.forEach(temp => {
        finaldata.push({
            id: temp._id,
            name: temp.name, 
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})
}

exports.getProgramEnrollmentSchedules = async (req, res) => {
    try {
      // Fetch enrollment schedules and populate program details
      const programData = await EnrollmentSchedule.find()
        .populate("program", "name status") // Populate only 'name' and 'status' fields from Program
        .exec();
  
      if (!programData || programData.length === 0) {
        return res.status(400).json({
          message: "failed",
          data: "No existing program data.",
        });
      }
  
      // Prepare the final response data
      const finaldata = programData.map((temp) => ({
        _id: temp._id,
        program: temp.program ? { name: temp.program.name, status: temp.program.status } : null,
        startdate: temp.startdate,
        enddate: temp.enddate,
      }));
  
      return res.status(200).json({
        message: "success",
        data: finaldata,
      });
    } catch (err) {
      console.error(
        `There's a problem encountered while fetching program data. Error: ${err}`
      );
      return res.status(500).json({
        message: "bad-request",
        data: "There's a problem with the server. Please contact admin for more details.",
      });
    }
  };
