const Schedule = require("../models/Schedule")
const Schoolyear = require("../models/Schoolyear")
const Subject = require("../models/Subject")


exports.createSubject = async (req, res) => {

    const { name } = req.body

    if(!name){
        return res.status(400).json({ message: "failed", data: "Please input subject name."})
    }

    const currentSchoolYear = await Schoolyear.findOne({ currentstatus: "current" })
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while searching for current school year in create subject. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    await Subject.create({
        name: name,
        schoolyear: currentSchoolYear._id
    })
    .then(async data => data)
    .catch(err => {
        console.log(`There's a problem encountred when creating subject. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })
    return res.status(200).json({ message: "success"})
}

exports.getSubjects = async (req, res) => {
    const { page, limit, search, status } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    }

    const matchconditionpipeline = [
        ...(search
            ? [
                  {
                      $match: {
                          $or: [
                              { "name": { $regex: search, $options: "i" } },
                          ],
                      },
                  },
              ]
            : []),
        ...(status ? [ { $match: status }]: []),
        {
            $skip: pageOptions.page * pageOptions.limit   
        },
        {
            $limit: pageOptions.limit
        }
    ]

    const subjectDetails = await Subject.aggregate(matchconditionpipeline)
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem encountered while aggregating Subject details. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server. Please contact support for more details."})
    })

    const totalDocuments = await Subject.countDocuments(matchconditionpipeline)
        .then(data => data) 
        .catch(err => {
            console.log(`Error counting documents: ${err}`);
            return res.status(400).json({
                message: "bad-request",
                data: "There's a problem with the server. Please contact support for more details.",
            });
        });

    const totalPages = Math.ceil(totalDocuments / pageOptions.limit)
    
    const finaldata = {
        totalPages: totalPages,
        data: []
    }
    subjectDetails.forEach(temp => {
        finaldata.data.push({
            id: temp._id,
            name: temp.name,
            status: temp.status,
            createdAt: temp.createdAt
        })
    })

    return res.status(200).json({ message: "success", data: finaldata})
}
