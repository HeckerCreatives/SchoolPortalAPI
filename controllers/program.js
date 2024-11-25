const Program = require("../models/program")


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
    
}
