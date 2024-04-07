require("dotenv").config();
const { ethers } = require("ethers");
const User = require("../../db/schema/user");

// Configuration from environment variables
const contractABI = JSON.parse(process.env.ABI);
const contractAddress = process.env.CONTRACT_ADDRESS;
const rpcURL = "https://rpc-evm-sidechain.xrpl.org";
const chainId = 1440002;
const seedWalletKey = process.env.SEED_KEY;

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(rpcURL, chainId);
const seedWallet = new ethers.Wallet(seedWalletKey, provider);

async function sendEther(wallet, recipientAddress, amountInEther = "100.0") {
    console.log(`Sending ${amountInEther} XRP to ${recipientAddress}...`);
    const tx = {
        to: recipientAddress,
        value: ethers.parseEther(amountInEther),
    };

    try {
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`Transaction hash: ${txResponse.hash}`);
        const receipt = await txResponse.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    } catch (error) {
        console.error(`Error sending XRP: ${error}`);
        throw error;
    }
}

async function addUserHabit(privateKey, transportationMode, carbonSaved, miles, timestamp) {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    try {
        const tx = await contract.addUserHabit(transportationMode, carbonSaved, miles, timestamp);
        await tx.wait();
        console.log(`Habit added for transportation mode: ${transportationMode} with public key: ${wallet.address}`);
    } catch (error) {
        console.error(`Error adding user habit: ${error}`);
        throw error;
    }
}

async function createWalletAndInitiate(email, transportationMode, carbonSaved, miles, timestamp) {
    const wallet = ethers.Wallet.createRandom();
    await sendEther(seedWallet, wallet.address);

    const newUser = new User({ email, privateKey: wallet.privateKey });
    await newUser.save();
    console.log(`New user created with email: ${email}`);

    await addUserHabit(wallet.privateKey, transportationMode, carbonSaved, miles, timestamp);
    return wallet;
}

module.exports.main = async function main(email, transportationMode, carbonSaved, miles, timestamp, cb) {
    try {
        const user = await User.findOne({ email }).exec();
        if (user) {
            await addUserHabit(user.privateKey, transportationMode, carbonSaved, miles, timestamp);
        } else {
            await createWalletAndInitiate(email, transportationMode, carbonSaved, miles, timestamp);
        }
        cb({ isDone: true });
    } catch (error) {
        console.error(`Operation failed: ${error}`);
        cb({ isDone: false, message: error.message });
    }
};