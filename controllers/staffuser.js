const Staffusers = require("../models/Staffusers");


exports.staffuserlist = async (req, res) => {
    const { page, limit, status, search, filter} = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10
    }

    let filterMatchStage = {};
    let statusMatchStage = {};

    if(search){
        searchMatchStage = {
            $or: [
                { username: { $regex: search, $options: 'i' }},
                { "details.email": { $regex: search, $options: 'i' } }
            ]
        };

    }

    if(filter === 'admin' || filter === 'superadmin' || filter === 'finance' || filter === 'registrar' || filter === 'adviser' || filter === 'teacher'){
        filterMatchStage = {
            auth: filter,
        }
    }
    if(status === 'active' || status === 'inactive'){
        statusMatchStage = {
            status: status,
        }
    }


    const matchConditionPipeline = [
        {
            $lookup: {
                from: "staffuserdetails",
                localField: "_id",
                foreignField: "owner",
                as: "staffuserdetails"
            }
        },
        {
            $unwind: {
                path: "$staffuserdetails",
                preserveNullAndEmptyArrays: true,
            }
        },
        ...(search
            ? [
                  {
                      $match: {
                          $or: [
                              { username: { $regex: search, $options: "i" } },
                              { "staffuserdetails.email": { $regex: search, $options: "i" } },
                              { "staffuserdetails.lastname": { $regex: search, $options: "i" } },
                              { "staffuserdetails.firstname": { $regex: search, $options: "i" } },
                          ],
                      },
                  },
              ]
            : []),
            ...(filter ? [ { $match: filterMatchStage }]: []),
            ...(status ? [ { $match: statusMatchStage }]: []),
        {
            $project: {
                username: 1,
                status: 1,
                _id: 1,
                auth: 1,
                fullname: {
                    $concat: [
                        "$staffuserdetails.firstname",
                        " ",
                        "$staffuserdetails.middlename",
                        " ",
                        "$staffuserdetails.lastname"
                    ]
                },
                contact: "$staffuserdetails.contact",
                address: "$staffuserdetails.address",
                email: "$staffuserdetails.email",
                dateofbirth: "$staffuserdetails.dateofbirth",
                gender: "$staffuserdetails.gender"
            }
        },
        {
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
    ]

    const staffuserlist = await Staffusers.aggregate(matchConditionPipeline)
    const totalstaffusers = await Staffusers.countDocuments(filterMatchStage)
  
    const finalpages = Math.ceil(totalstaffusers / pageOptions.limit)


    const finaldata = []

    staffuserlist.forEach(temp => {
        finaldata.push({
            id: temp._id,
            username: temp.username,
            fullname: temp.fullname,
            contact: temp.contact,
            address: temp.address,
            email: temp.email,
            dateofbirth: temp.dateofbirth,
            gender: temp.gender,
            role: temp.auth,
        })
    })

    const data = {
        "totalPages": finalpages,
        "data": finaldata,
    }


    return res.json({ message: "success", data: data});


} 