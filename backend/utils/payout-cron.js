const cron = require("node-cron");
const prisma = require("./database"); // your prisma instance
const { PaymentPayoutStatus } = require("@prisma/client");
const { payout } = require("./payout");


// Cron - runs daily at midnight
console.log("The Cron job is Scheduled to run daily at midnight");

// Cron job to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Cron started: Processing payouts...");

  try {
    // 1. Fetch all owners
    const owners = await prisma.owner.findMany();

    for (const owner of owners) {
      // 2. Calculate total balance for this owner
      const balance = await prisma.payments.aggregate({
        where: { paidToId: owner.id, status: PaymentPayoutStatus.PENDING },
        _sum: { amount: true },
      });

      const amountToPayout = balance._sum.amount || 0;

      if (amountToPayout > 0) {
        console.log(`Paying out ₹${amountToPayout} to owner: ${owner.id}`);

        // 3. Create Payout via RazorpayX
        const payoutData = await payout(owner.bankAccount.account_number, amountToPayout, owner);

        // 4. Mark transactions as settled
        await prisma.payments.updateMany({
          where: { paidToId: owner.id, status: PaymentPayoutStatus.PENDING },
          data: { status: PaymentPayoutStatus.PAIDOUT, payoutId: payoutData.id },
        });
      }
    }

    console.log("Cron completed: All payouts processed.");
  } catch (err) {
    console.error("Error in cron payout:", err);
  }
});
