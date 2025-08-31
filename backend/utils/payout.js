const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const payout =async(account_number, ammount, owner)=>{
    const payout = await razorpay.payouts.create({
        account_number: process.env.RAZORPAYX_ACCOUNT, // your virtual account
        fund_account_id: owner.fundAccountId, // already created when adding bank
        amount: ammount * 100, // convert to paise
        currency: "INR",
        mode: "IMPS", // or NEFT, UPI
        purpose: "payout",
        queue_if_low_balance: true,
    });

    return payout;
}

module.exports = {
    payout
}