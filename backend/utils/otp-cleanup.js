const prisma = require('./database');

/**
 * Cleanup expired OTPs from the database
 * This should be run periodically (e.g., via cron job)
 */
const cleanupExpiredOTPs = async () => {
  try {
    const result = await prisma.passwordResetOTP.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true }
        ]
      }
    });

    console.log(`Cleaned up ${result.count} expired/used OTPs`);
    return result;
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
    throw error;
  }
};

module.exports = {
  cleanupExpiredOTPs,
};

