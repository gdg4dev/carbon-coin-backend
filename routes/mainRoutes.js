const express = require("express");
const { main, getCarbonTokenBalance, getWalletAddressFromPrivateKey } = require("./helpers/utils");
const User = require("../db/schema/user");
const router = express.Router();

router.post("/upload", async (req, res) => {
    const { gmail, transportationMode, miles, carbonSaved } = req.body;

    // Validate request body
    if (!gmail || !transportationMode || !miles || !carbonSaved) {
        return res.status(400).json({
            status: "Error",
            error: true,
            message: "One of the required keys in the JSON object is missing. (gmail, transportationMode, miles, carbonSaved)"
        });
    }

    try {
        const confirm = await new Promise((resolve, reject) => {
            main(gmail, transportationMode, carbonSaved, miles, Date.now().toString(), (result) => {
                if (result.isDone) {
                    resolve(result);
                } else {
                    reject(new Error(result.message));
                }
            });
        });

        // If the operation was successful
        return res.status(200).json({
            status: "ok",
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            error: true,
            message: error.message || "An error occurred during the operation."
        });
    }
});

router.get("/checkBalance", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({
            status: "Error",
            error: true,
            message: "Email query parameter is missing."
        });
    }

    try {
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(404).json({
                status: "Error",
                error: true,
                message: "User not found."
            });
        }

        const address = getWalletAddressFromPrivateKey(user.privateKey);
        const balance = await getCarbonTokenBalance(address);

        return res.status(200).json({
            status: "ok",
            error: false,
            balance
        });
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            error: true,
            message: error.message || "An error occurred during the operation."
        });
    }
});

module.exports = router;

module.exports = router;