const express = require('express');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const { validateEmail, validatePhoneNumber } = require('../utils/validation');
const prisma = require('../utils/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Owner: Get all employees for a store
router.get('/store/:storeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { status, role } = req.query;

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    let whereClause = {
      storeId: storeId
    };

    if (status) {
      whereClause.isActive = status === 'active';
    }

    if (role) {
      whereClause.role = role;
    }

    const employees = await prisma.storeEmployee.findMany({
      where: whereClause,
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    res.json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Owner: Add new employee to store
router.post('/store/:storeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      name,
      email,
      phoneNumber,
      password,
      designation,
      role,
      salary,
      employeeId
    } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !password || !designation || !role) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate email and phone
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if employee ID already exists
    if (employeeId) {
      const existingEmployee = await prisma.employee.findUnique({
        where: { employeeId }
      });

      if (existingEmployee) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phoneNumber,
          userType: 'EMPLOYEE'
        }
      });

      // Create employee
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: employeeId || `EMP${Date.now()}`,
          designation,
          salary: salary || null
        }
      });

      // Add employee to store
      const storeEmployee = await tx.storeEmployee.create({
        data: {
          storeId,
          employeeId: employee.id,
          role
        }
      });

      return { user, employee, storeEmployee };
    });

    res.status(201).json({
      message: 'Employee added successfully',
      employee: {
        id: result.employee.id,
        employeeId: result.employee.employeeId,
        name: result.user.name,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber,
        designation: result.employee.designation,
        role: result.storeEmployee.role,
        salary: result.employee.salary,
        hireDate: result.employee.hireDate
      }
    });

  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// Owner: Update employee details
router.put('/:employeeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      name,
      email,
      phoneNumber,
      designation,
      role,
      salary,
      isActive
    } = req.body;

    // Find employee and verify ownership
    const storeEmployee = await prisma.storeEmployee.findFirst({
      where: {
        employeeId: employeeId,
        store: {
          owner: { userId: req.userId }
        }
      },
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    });

    if (!storeEmployee) {
      return res.status(404).json({ error: 'Employee not found or access denied' });
    }

    // Update user details
    const userUpdateData = {};
    if (name) userUpdateData.name = name;
    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      userUpdateData.email = email;
    }
    if (phoneNumber) {
      if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
      userUpdateData.phoneNumber = phoneNumber;
    }

    // Update employee details
    const employeeUpdateData = {};
    if (designation) employeeUpdateData.designation = designation;
    if (salary !== undefined) employeeUpdateData.salary = salary;
    if (isActive !== undefined) employeeUpdateData.isActive = isActive;

    // Update store employee details
    const storeEmployeeUpdateData = {};
    if (role) storeEmployeeUpdateData.role = role;
    if (isActive !== undefined) storeEmployeeUpdateData.isActive = isActive;

    // Perform updates in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: storeEmployee.employee.userId },
        data: userUpdateData
      });

      const updatedEmployee = await tx.employee.update({
        where: { id: storeEmployee.employee.id },
        data: employeeUpdateData
      });

      const updatedStoreEmployee = await tx.storeEmployee.update({
        where: { id: storeEmployee.id },
        data: storeEmployeeUpdateData
      });

      return { updatedUser, updatedEmployee, updatedStoreEmployee };
    });

    res.json({
      message: 'Employee updated successfully',
      employee: {
        id: result.updatedEmployee.id,
        employeeId: result.updatedEmployee.employeeId,
        name: result.updatedUser.name,
        email: result.updatedUser.email,
        phoneNumber: result.updatedUser.phoneNumber,
        designation: result.updatedEmployee.designation,
        role: result.updatedStoreEmployee.role,
        salary: result.updatedEmployee.salary,
        isActive: result.updatedEmployee.isActive
      }
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Owner: Remove employee from store
router.delete('/store/:storeId/employee/:employeeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { storeId, employeeId } = req.params;

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Find store employee relationship
    const storeEmployee = await prisma.storeEmployee.findFirst({
      where: {
        storeId,
        employee: { employeeId }
      }
    });

    if (!storeEmployee) {
      return res.status(404).json({ error: 'Employee not found in this store' });
    }

    // Check if employee has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        employeeId: storeEmployee.employeeId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        bookingDate: { gte: new Date() }
      }
    });

    if (activeBookings) {
      return res.status(400).json({ 
        error: 'Cannot remove employee with active bookings. Please reassign or cancel bookings first.' 
      });
    }

    // Soft delete by setting leftAt date
    await prisma.storeEmployee.update({
      where: { id: storeEmployee.id },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });

    res.json({
      message: 'Employee removed from store successfully'
    });

  } catch (error) {
    console.error('Error removing employee:', error);
    res.status(500).json({ error: 'Failed to remove employee' });
  }
});

// Owner: Set employee availability
router.post('/:employeeId/availability', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { storeId, availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ error: 'Availability array is required' });
    }

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Find employee
    const employee = await prisma.employee.findFirst({
      where: {
        employeeId,
        storeEmployees: {
          some: {
            storeId,
            isActive: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or access denied' });
    }

    // Delete existing availability
    await prisma.employeeAvailability.deleteMany({
      where: {
        employeeId: employee.id,
        storeId
      }
    });

    // Create new availability
    const availabilityData = availability.map(avail => ({
      employeeId: employee.id,
      storeId,
      dayOfWeek: avail.dayOfWeek,
      startTime: avail.startTime,
      endTime: avail.endTime,
      isActive: avail.isActive !== false
    }));

    await prisma.employeeAvailability.createMany({
      data: availabilityData
    });

    res.json({
      message: 'Employee availability updated successfully'
    });

  } catch (error) {
    console.error('Error setting employee availability:', error);
    res.status(500).json({ error: 'Failed to set employee availability' });
  }
});

// Owner: Get employee availability
router.get('/:employeeId/availability/:storeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { employeeId, storeId } = req.params;

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Find employee
    const employee = await prisma.employee.findFirst({
      where: {
        employeeId,
        storeEmployees: {
          some: {
            storeId,
            isActive: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or access denied' });
    }

    // Get availability
    const availability = await prisma.employeeAvailability.findMany({
      where: {
        employeeId: employee.id,
        storeId
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });

    res.json({ availability });

  } catch (error) {
    console.error('Error fetching employee availability:', error);
    res.status(500).json({ error: 'Failed to fetch employee availability' });
  }
});

// Owner: Get employee performance/stats
router.get('/:employeeId/stats/:storeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { employeeId, storeId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Find employee
    const employee = await prisma.employee.findFirst({
      where: {
        employeeId,
        storeEmployees: {
          some: {
            storeId,
            isActive: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found or access denied' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get booking statistics
    const bookings = await prisma.booking.findMany({
      where: {
        employeeId: employee.id,
        storeId,
        ...(Object.keys(dateFilter).length > 0 && { bookingDate: dateFilter })
      },
      include: {
        storeService: true
      }
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const stats = {
      employeeId: employee.employeeId,
      employeeName: employee.user?.name,
      period: { startDate, endDate },
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      totalRevenue,
      averageRevenue: completedBookings > 0 ? totalRevenue / completedBookings : 0
    };

    res.json({ stats });

  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ error: 'Failed to fetch employee statistics' });
  }
});

module.exports = router; 