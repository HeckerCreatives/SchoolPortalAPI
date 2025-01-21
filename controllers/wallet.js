const Wallets = require("../models/Wallet")


exports.getwallet = async (req, res) => {
    const { id } = req.user

    await Wallets.findOne({ owner: id })
    .then(data => {
        if(!data){
            return res.status(400).json({ message: "failed", data: "No wallet found."})
        }
        return res.status(200).json({ message: "success", data: data })
    })
    .catch(err => {
        console.log(`There's a problem encountered while fetching wallet. Error: ${err}`)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact support for more details."})
    })
}