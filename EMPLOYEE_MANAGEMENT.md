# Employee Management System

## Overview
The Employee Management System allows store owners to manage their employees, including hiring, scheduling, performance tracking, and payroll management.

## Features

### 1. Employee Management
- **Add Employees** - Hire new employees with complete profiles
- **Edit Employee Details** - Update employee information
- **Remove Employees** - Soft delete employees (with active booking checks)
- **Employee Profiles** - Complete employee information management

### 2. Employee Scheduling
- **Availability Management** - Set employee working hours by day
- **Time Slot Management** - Define start and end times for each day
- **Active/Inactive Status** - Enable/disable availability for specific days

### 3. Performance Tracking
- **Booking Statistics** - Track total, completed, and cancelled bookings
- **Revenue Analytics** - Monitor employee revenue generation
- **Completion Rates** - Calculate booking completion percentages
- **Performance Reports** - Generate detailed performance reports

### 4. Booking Assignment
- **Employee Assignment** - Assign specific employees to bookings
- **Availability Checking** - Ensure employees are available for bookings
- **Workload Management** - Distribute bookings among employees

## Database Schema

### Employee Model
```prisma
model Employee {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  employeeId  String   @unique // Custom employee ID
  designation String   // e.g., "Hair Stylist", "Nail Technician", "Manager"
  hireDate    DateTime @default(now())
  salary      Float?
  isActive    Boolean  @default(true)
  
  // Relations
  storeEmployees StoreEmployee[]
  bookings       Booking[]
  availability   EmployeeAvailability[]
}
```

### Store-Employee Relationship
```prisma
model StoreEmployee {
  id         String   @id @default(uuid())
  storeId    String
  employeeId String
  role       String   // e.g., "Hair Stylist", "Nail Technician", "Manager"
  isActive   Boolean  @default(true)
  joinedAt   DateTime @default(now())
  leftAt     DateTime?
  
  // Relations
  store    Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@unique([storeId, employeeId])
}
```

### Employee Availability
```prisma
model EmployeeAvailability {
  id         String   @id @default(uuid())
  employeeId String
  storeId    String
  dayOfWeek  Int      // 0 = Sunday, 1 = Monday, etc.
  startTime  String   // Format: "09:00"
  endTime    String   // Format: "18:00"
  isActive   Boolean  @default(true)
  
  // Relations
  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  store    Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  @@unique([employeeId, storeId, dayOfWeek])
}
```

## API Endpoints

### Employee Management

#### Get Store Employees
```http
GET /api/employees/store/:storeId
Authorization: Bearer <token>
Query Parameters:
  - status: "active" | "inactive"
  - role: string
```

#### Add Employee
```http
POST /api/employees/store/:storeId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "securepassword",
  "designation": "Hair Stylist",
  "role": "Senior Stylist",
  "salary": 50000,
  "employeeId": "EMP001"
}
```

#### Update Employee
```http
PUT /api/employees/:employeeId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phoneNumber": "+1234567890",
  "designation": "Senior Hair Stylist",
  "role": "Lead Stylist",
  "salary": 55000,
  "isActive": true
}
```

#### Remove Employee
```http
DELETE /api/employees/store/:storeId/employee/:employeeId
Authorization: Bearer <token>
```

### Employee Availability

#### Set Employee Availability
```http
POST /api/employees/:employeeId/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "storeId": "store-id",
  "availability": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true
    }
  ]
}
```

#### Get Employee Availability
```http
GET /api/employees/:employeeId/availability/:storeId
Authorization: Bearer <token>
```

### Employee Performance

#### Get Employee Statistics
```http
GET /api/employees/:employeeId/stats/:storeId
Authorization: Bearer <token>
Query Parameters:
  - startDate: "2024-01-01"
  - endDate: "2024-12-31"
```

## Frontend Implementation

### Employee Management Screen
- **Location**: `/app/owner/employees.tsx`
- **Features**:
  - List all employees with filters
  - Add new employees
  - Edit employee details
  - Remove employees
  - Navigate to availability and stats

### Key Components

#### Employee List
```typescript
const [employees, setEmployees] = useState<StoreEmployee[]>([]);
const [filters, setFilters] = useState({ status: '', role: '' });

const loadEmployees = async () => {
  const response = await employeesAPI.getStoreEmployees(storeId, filters);
  setEmployees(response.employees);
};
```

#### Add Employee Modal
```typescript
const handleAddEmployee = async () => {
  await employeesAPI.addEmployee(storeId, {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    designation: formData.designation,
    role: formData.role,
    salary: parseFloat(formData.salary)
  });
};
```

#### Employee Actions
```typescript
// Edit employee
const openEditModal = (employee: StoreEmployee) => {
  setSelectedEmployee(employee);
  setFormData({
    name: employee.employee.user.name,
    email: employee.employee.user.email,
    // ... other fields
  });
  setShowEditModal(true);
};

// Remove employee
const handleRemoveEmployee = async (employee: StoreEmployee) => {
  await employeesAPI.removeEmployee(storeId, employee.employee.employeeId);
};
```

## Employee Flow

### 1. Hiring Process
1. **Owner adds employee** through the employee management screen
2. **System creates user account** with EMPLOYEE type
3. **Employee profile created** with designation and salary
4. **Employee assigned to store** with specific role
5. **Employee receives login credentials** (email/password)

### 2. Scheduling Process
1. **Owner sets availability** for each employee
2. **System validates availability** against store hours
3. **Availability stored** in database
4. **Booking system uses availability** for slot generation

### 3. Performance Tracking
1. **Bookings assigned** to specific employees
2. **System tracks** booking completion rates
3. **Revenue calculated** per employee
4. **Performance reports** generated for owners

### 4. Employee Removal
1. **Owner initiates removal** from store
2. **System checks** for active bookings
3. **If no active bookings** - employee removed
4. **If active bookings exist** - removal blocked until reassignment

## Security Features

### 1. Ownership Verification
- All employee operations verify store ownership
- Employees can only be managed by store owners
- Cross-store access prevention

### 2. Data Validation
- Email format validation
- Phone number validation
- Required field validation
- Duplicate email/employee ID prevention

### 3. Soft Deletion
- Employees are soft deleted (marked inactive)
- Historical data preservation
- Audit trail maintenance

## Integration with Booking System

### 1. Employee Assignment
```typescript
// Booking creation with employee assignment
const booking = await prisma.booking.create({
  data: {
    customerId,
    storeId,
    storeServiceId,
    employeeId, // Optional employee assignment
    bookingDate,
    startTime,
    endTime,
    // ... other fields
  }
});
```

### 2. Availability Checking
```typescript
// Check employee availability for booking
const employeeAvailable = await prisma.employeeAvailability.findFirst({
  where: {
    employeeId,
    storeId,
    dayOfWeek: bookingDate.getDay(),
    isActive: true,
    startTime: { lte: startTime },
    endTime: { gte: endTime }
  }
});
```

### 3. Performance Calculation
```typescript
// Calculate employee performance
const stats = {
  totalBookings: bookings.length,
  completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
  completionRate: (completedBookings / totalBookings) * 100,
  totalRevenue: completedBookings.reduce((sum, b) => sum + b.totalPrice, 0)
};
```

## Future Enhancements

### 1. Advanced Scheduling
- **Shift Management** - Multiple shifts per day
- **Break Time Management** - Lunch and break scheduling
- **Overtime Tracking** - Monitor overtime hours
- **Leave Management** - Vacation and sick leave tracking

### 2. Performance Analytics
- **Real-time Dashboard** - Live performance metrics
- **Comparative Analysis** - Employee performance comparison
- **Trend Analysis** - Performance trends over time
- **Goal Setting** - Performance targets and KPIs

### 3. Communication Features
- **Employee Notifications** - Booking assignments and updates
- **Internal Messaging** - Owner-employee communication
- **Task Management** - Assign and track tasks
- **Feedback System** - Performance reviews and feedback

### 4. Payroll Integration
- **Salary Management** - Automated salary calculations
- **Commission Tracking** - Performance-based commissions
- **Tax Calculations** - Automated tax deductions
- **Payment Processing** - Direct deposit integration

## Usage Examples

### Adding a New Employee
```typescript
// Frontend
const newEmployee = await employeesAPI.addEmployee(storeId, {
  name: "Sarah Johnson",
  email: "sarah@salon.com",
  phoneNumber: "+1234567890",
  password: "securepass123",
  designation: "Hair Stylist",
  role: "Senior Stylist",
  salary: 45000,
  employeeId: "EMP002"
});
```

### Setting Employee Availability
```typescript
// Frontend
await employeesAPI.setEmployeeAvailability(employeeId, {
  storeId,
  availability: [
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isActive: true },
    { dayOfWeek: 0, startTime: "10:00", endTime: "16:00", isActive: false }
  ]
});
```

### Getting Employee Performance
```typescript
// Frontend
const stats = await employeesAPI.getEmployeeStats(employeeId, storeId, {
  startDate: "2024-01-01",
  endDate: "2024-12-31"
});

console.log(`Employee: ${stats.employeeName}`);
console.log(`Total Bookings: ${stats.totalBookings}`);
console.log(`Completion Rate: ${stats.completionRate}%`);
console.log(`Total Revenue: $${stats.totalRevenue}`);
```

## Support

For employee management issues:
- Check employee permissions and ownership
- Verify store-employee relationships
- Review availability conflicts
- Monitor performance metrics
- Contact system administrator for technical issues 