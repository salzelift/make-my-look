const prisma = require('../utils/database')
const inquirer = require('inquirer')

const resetDb = async () => {
    try {

        await prisma.$transaction(async (tx) => {
            // Delete dependents first
            await tx.payments.deleteMany()
            await tx.booking.deleteMany()
            await tx.employeeAvailability.deleteMany()
            await tx.storeAvailability.deleteMany()
            await tx.storeEmployee.deleteMany()
            await tx.storeService.deleteMany()
            await tx.bankAccount.deleteMany()

            // Then parent entities
            await tx.store.deleteMany()
            await tx.employee.deleteMany()
            await tx.customer.deleteMany()
            await tx.owner.deleteMany()

            // Lookup/base tables last
            await tx.serviceType.deleteMany()
            await tx.user.deleteMany()
        })

        console.log('Database reset complete.')
    } catch (error) {
        console.error('Failed to reset database:', error)
        process.exitCode = 1
    } finally {
        await prisma.$disconnect()
    }
}

resetDb()