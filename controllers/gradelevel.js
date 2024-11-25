const Gradelevel = require("../models/gradelevel")


exports.getAllGradelevels = async (req, res) => {
    const gradeLevelData = await Gradelevel.find()
      .then(data => data)
      .catch(err => {
         console.log(`There's a problem encountered while fetching Grade Level data. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact admin for more details."})
    })
    if(!gradeLevelData){
        return res.status(400).json({ message: "failed", data: "No existing grade level data."})
    }
    const finaldata = []

    gradeLevelData.forEach(temp => {
        finaldata.push({
            id: temp._id,
            level: temp.level, 
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})    
}