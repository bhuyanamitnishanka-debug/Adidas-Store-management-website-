import { Product, WarehouseItem, StockTransfer, Employee, Shift, LeaveRequest, VMDirective, CustomerProfile, PriorYearSalesRecord, LossIncident } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PRD-101',
    sku: 'SPRT-SH-091',
    name: 'AeroGlide Elite Running Shoes',
    category: 'Footwear',
    brand: 'Apex Athletics',
    price: 180,
    cost: 72,
    storeStock: 14,
    stockroomStock: 22,
    minThreshold: 15,
    status: 'In Stock',
    lastRestocked: '2026-09-15',
    salesHistory: [
      { date: '2026-09-12', units: 5, revenue: 900 },
      { date: '2026-09-13', units: 6, revenue: 1080 },
      { date: '2026-09-14', units: 4, revenue: 720 },
      { date: '2026-09-15', units: 6, revenue: 1080 },
      { date: '2026-09-16', units: 5, revenue: 900 },
      { date: '2026-09-17', units: 7, revenue: 1260 },
      { date: '2026-09-18', units: 5, revenue: 900 },
    ]
  },
  {
    id: 'PRD-102',
    sku: 'SPRT-SH-092',
    name: 'CloudPulse Max Cushion Trainers',
    category: 'Footwear',
    brand: 'Apex Athletics',
    price: 165,
    cost: 65,
    storeStock: 3,
    stockroomStock: 2,
    minThreshold: 10,
    status: 'Low Stock',
    lastRestocked: '2026-09-10',
    salesHistory: [
      { date: '2026-09-12', units: 7, revenue: 1155 },
      { date: '2026-09-13', units: 9, revenue: 1485 },
      { date: '2026-09-14', units: 8, revenue: 1320 },
      { date: '2026-09-15', units: 9, revenue: 1485 },
      { date: '2026-09-16', units: 5, revenue: 825 },
      { date: '2026-09-17', units: 4, revenue: 660 },
      { date: '2026-09-18', units: 3, revenue: 495 },
    ]
  },
  {
    id: 'PRD-103',
    sku: 'APP-JKT-440',
    name: 'HydroShield Storm Runner Jacket',
    category: 'Apparel',
    brand: 'Vanguard Technical',
    price: 140,
    cost: 50,
    storeStock: 8,
    stockroomStock: 12,
    minThreshold: 8,
    status: 'In Stock',
    lastRestocked: '2026-09-12',
    salesHistory: [
      { date: '2026-09-12', units: 4, revenue: 560 },
      { date: '2026-09-13', units: 6, revenue: 840 },
      { date: '2026-09-14', units: 3, revenue: 420 },
      { date: '2026-09-15', units: 5, revenue: 700 },
      { date: '2026-09-16', units: 4, revenue: 560 },
      { date: '2026-09-17', units: 2, revenue: 280 },
      { date: '2026-09-18', units: 3, revenue: 420 },
    ]
  },
  {
    id: 'PRD-104',
    sku: 'APP-TEE-210',
    name: 'DryPro Breathable Training Tee',
    category: 'Apparel',
    brand: 'Apex Athletics',
    price: 45,
    cost: 14,
    storeStock: 28,
    stockroomStock: 45,
    minThreshold: 20,
    status: 'In Stock',
    lastRestocked: '2026-09-16',
    salesHistory: [
      { date: '2026-09-12', units: 16, revenue: 720 },
      { date: '2026-09-13', units: 20, revenue: 900 },
      { date: '2026-09-14', units: 14, revenue: 630 },
      { date: '2026-09-15', units: 19, revenue: 855 },
      { date: '2026-09-16', units: 15, revenue: 675 },
      { date: '2026-09-17', units: 22, revenue: 990 },
      { date: '2026-09-18', units: 18, revenue: 810 },
    ]
  },
  {
    id: 'PRD-105',
    sku: 'EQP-BAG-882',
    name: 'ProTour Ergonomic Gym Duffle 45L',
    category: 'Equipment',
    brand: 'Kratos Sport',
    price: 95,
    cost: 38,
    storeStock: 1,
    stockroomStock: 0,
    minThreshold: 6,
    status: 'Low Stock',
    lastRestocked: '2026-09-08',
    salesHistory: [
      { date: '2026-09-12', units: 3, revenue: 285 },
      { date: '2026-09-13', units: 4, revenue: 380 },
      { date: '2026-09-14', units: 2, revenue: 190 },
      { date: '2026-09-15', units: 3, revenue: 285 },
      { date: '2026-09-16', units: 1, revenue: 95 },
      { date: '2026-09-17', units: 4, revenue: 380 },
      { date: '2026-09-18', units: 2, revenue: 190 },
    ]
  },
  {
    id: 'PRD-106',
    sku: 'ACC-CAP-012',
    name: 'Ventilated Aerocool Sport Cap',
    category: 'Accessories',
    brand: 'Apex Athletics',
    price: 28,
    cost: 8,
    storeStock: 18,
    stockroomStock: 30,
    minThreshold: 12,
    status: 'In Stock',
    lastRestocked: '2026-09-16',
    salesHistory: [
      { date: '2026-09-12', units: 7, revenue: 196 },
      { date: '2026-09-13', units: 11, revenue: 308 },
      { date: '2026-09-14', units: 6, revenue: 168 },
      { date: '2026-09-15', units: 8, revenue: 224 },
      { date: '2026-09-16', units: 10, revenue: 280 },
      { date: '2026-09-17', units: 12, revenue: 336 },
      { date: '2026-09-18', units: 9, revenue: 252 },
    ]
  },
  {
    id: 'PRD-107',
    sku: 'SPRT-SH-093',
    name: 'TrailVenture Gore-Tex All-Terrain',
    category: 'Footwear',
    brand: 'Vanguard Technical',
    price: 210,
    cost: 88,
    storeStock: 0,
    stockroomStock: 0,
    minThreshold: 8,
    status: 'Out of Stock',
    lastRestocked: '2026-09-01',
    salesHistory: [
      { date: '2026-09-12', units: 4, revenue: 840 },
      { date: '2026-09-13', units: 3, revenue: 630 },
      { date: '2026-09-14', units: 2, revenue: 420 },
      { date: '2026-09-15', units: 3, revenue: 630 },
      { date: '2026-09-16', units: 0, revenue: 0 },
      { date: '2026-09-17', units: 0, revenue: 0 },
      { date: '2026-09-18', units: 0, revenue: 0 },
    ]
  }
];

export const INITIAL_WAREHOUSE_ITEMS: WarehouseItem[] = [
  {
    id: 'WH-01',
    sku: 'SPRT-SH-091',
    productName: 'AeroGlide Elite Running Shoes',
    category: 'Footwear',
    warehouseQty: 420,
    allocatedQty: 60,
    availableQty: 360,
    bayLocation: 'Bay-F04-R2',
    palletId: 'PLT-8831',
    batchNumber: 'BT-2026-08A',
    lastAudited: '2026-09-12'
  },
  {
    id: 'WH-02',
    sku: 'SPRT-SH-092',
    productName: 'CloudPulse Max Cushion Trainers',
    category: 'Footwear',
    warehouseQty: 215,
    allocatedQty: 40,
    availableQty: 175,
    bayLocation: 'Bay-F02-R1',
    palletId: 'PLT-7729',
    batchNumber: 'BT-2026-09B',
    lastAudited: '2026-09-14'
  },
  {
    id: 'WH-03',
    sku: 'APP-JKT-440',
    productName: 'HydroShield Storm Runner Jacket',
    category: 'Apparel',
    warehouseQty: 340,
    allocatedQty: 30,
    availableQty: 310,
    bayLocation: 'Bay-A11-R3',
    palletId: 'PLT-4412',
    batchNumber: 'BT-2026-09A',
    lastAudited: '2026-09-10'
  },
  {
    id: 'WH-04',
    sku: 'APP-TEE-210',
    productName: 'DryPro Breathable Training Tee',
    category: 'Apparel',
    warehouseQty: 680,
    allocatedQty: 100,
    availableQty: 580,
    bayLocation: 'Bay-A08-R2',
    palletId: 'PLT-9921',
    batchNumber: 'BT-2026-08C',
    lastAudited: '2026-09-16'
  },
  {
    id: 'WH-05',
    sku: 'EQP-BAG-882',
    productName: 'ProTour Ergonomic Gym Duffle 45L',
    category: 'Equipment',
    warehouseQty: 120,
    allocatedQty: 25,
    availableQty: 95,
    bayLocation: 'Bay-E03-R4',
    palletId: 'PLT-2391',
    batchNumber: 'BT-2026-07D',
    lastAudited: '2026-09-15'
  },
  {
    id: 'WH-06',
    sku: 'SPRT-SH-093',
    productName: 'TrailVenture Gore-Tex All-Terrain',
    category: 'Footwear',
    warehouseQty: 190,
    allocatedQty: 50,
    availableQty: 140,
    bayLocation: 'Bay-F09-R1',
    palletId: 'PLT-5510',
    batchNumber: 'BT-2026-09D',
    lastAudited: '2026-09-13'
  }
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'TR-9021',
    transferNumber: 'TRF-2026-0902',
    sku: 'SPRT-SH-092',
    productName: 'CloudPulse Max Cushion Trainers',
    quantity: 25,
    fromLocation: 'Central Regional DC (DC-West)',
    toLocation: 'Store #104 - Metro Flagship',
    status: 'In Transit',
    requestedBy: 'Marcus Sterling (Store Manager)',
    dispatchedAt: '2026-09-17 08:30 AM',
    sameDayDeliveryMet: true,
    priority: 'Urgent - Floor Depleted'
  },
  {
    id: 'TR-9022',
    transferNumber: 'TRF-2026-0899',
    sku: 'APP-TEE-210',
    productName: 'DryPro Breathable Training Tee',
    quantity: 50,
    fromLocation: 'Central Regional DC (DC-West)',
    toLocation: 'Store #104 - Metro Flagship',
    status: 'Received & Verified',
    requestedBy: 'Elena Rostova (Floor Lead)',
    dispatchedAt: '2026-09-16 09:15 AM',
    receivedAt: '2026-09-16 02:40 PM',
    sameDayDeliveryMet: true,
    priority: 'Standard'
  },
  {
    id: 'TR-9023',
    transferNumber: 'TRF-2026-0903',
    sku: 'SPRT-SH-093',
    productName: 'TrailVenture Gore-Tex All-Terrain',
    quantity: 20,
    fromLocation: 'Central Regional DC (DC-West)',
    toLocation: 'Store #104 - Metro Flagship',
    status: 'Pending Dispatch',
    requestedBy: 'Marcus Sterling (Store Manager)',
    sameDayDeliveryMet: false,
    priority: 'Urgent - Floor Depleted'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Marcus Sterling',
    role: 'Store Manager',
    department: 'Sales Floor',
    email: 'm.sterling@omniretail.com',
    phone: '+1 (555) 234-8901',
    hireDate: '2023-04-10',
    status: 'Active',
    isManagerQualified: true,
    salesPerHour: 245,
    conversionRate: 18.5,
    trainingCompleted: {
      foundationalBrand: true,
      seasonalBrandKnowledge: true,
      lossPrevention: true,
      cashRegisterIntegrity: true
    },
    performanceScore: 97,
    recentFeedback: 'Leads service by example on sales floor. Commercial targets exceeded by 14% Q3.'
  },
  {
    id: 'EMP-002',
    name: 'Elena Rostova',
    role: 'Assistant Manager',
    department: 'Sales Floor',
    email: 'e.rostova@omniretail.com',
    phone: '+1 (555) 345-6712',
    hireDate: '2024-01-15',
    status: 'Active',
    isManagerQualified: true,
    salesPerHour: 210,
    conversionRate: 16.2,
    trainingCompleted: {
      foundationalBrand: true,
      seasonalBrandKnowledge: true,
      lossPrevention: true,
      cashRegisterIntegrity: true
    },
    performanceScore: 92,
    recentFeedback: 'Excellent floor coverage during peak weekend traffic. Strong candidate for Career Ladder promotion.'
  },
  {
    id: 'EMP-003',
    name: 'David Chen',
    role: 'Floor Lead',
    department: 'Sales Floor',
    email: 'd.chen@omniretail.com',
    phone: '+1 (555) 456-7890',
    hireDate: '2024-08-01',
    status: 'Active',
    isManagerQualified: false,
    salesPerHour: 175,
    conversionRate: 13.8,
    trainingCompleted: {
      foundationalBrand: true,
      seasonalBrandKnowledge: true,
      lossPrevention: true,
      cashRegisterIntegrity: true
    },
    performanceScore: 88,
    recentFeedback: 'Highly knowledgeable on technical running gear. Actively mentoring new team associates.'
  },
  {
    id: 'EMP-004',
    name: 'Sarah Jenkins',
    role: 'Visual Merchandiser',
    department: 'Visual Merchandising',
    email: 's.jenkins@omniretail.com',
    phone: '+1 (555) 567-8901',
    hireDate: '2023-11-20',
    status: 'Active',
    isManagerQualified: false,
    salesPerHour: 140,
    conversionRate: 11.5,
    trainingCompleted: {
      foundationalBrand: true,
      seasonalBrandKnowledge: true,
      lossPrevention: true,
      cashRegisterIntegrity: false
    },
    performanceScore: 95,
    recentFeedback: 'Autumn campaign window display received top district rating. Flawless fixture alignment.'
  },
  {
    id: 'EMP-005',
    name: 'Liam Vance',
    role: 'Inventory Stockist',
    department: 'Backroom & Logistics',
    email: 'l.vance@omniretail.com',
    phone: '+1 (555) 678-9012',
    hireDate: '2025-02-10',
    status: 'Active',
    isManagerQualified: false,
    salesPerHour: 110,
    conversionRate: 8.4,
    trainingCompleted: {
      foundationalBrand: true,
      seasonalBrandKnowledge: false,
      lossPrevention: true,
      cashRegisterIntegrity: true
    },
    performanceScore: 84,
    recentFeedback: 'Processes same-day truck arrivals within 3.5 hours average. Needs seasonal apparel refresh module.'
  },
  {
    id: 'EMP-006',
    name: 'Aaliyah Washington',
    role: 'Sales Specialist',
    department: 'Cashier & Customer Service',
    email: 'a.washington@omniretail.com',
    phone: '+1 (555) 789-0123',
    hireDate: '2025-05-18',
    status: 'Active',
    isManagerQualified: false,
    salesPerHour: 195,
    conversionRate: 15.1,
    trainingCompleted: {
      foundationalBrand: true,
      seasonalBrandKnowledge: true,
      lossPrevention: true,
      cashRegisterIntegrity: true
    },
    performanceScore: 90,
    recentFeedback: 'Speedy, accurate cash desk operations. High customer loyalty sign-up conversion (26%).'
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  // Monday Sep 14
  {
    id: 'SH-01-MON',
    employeeId: 'EMP-001',
    employeeName: 'Marcus Sterling',
    date: '2026-09-14',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: true
  },
  {
    id: 'SH-02-MON',
    employeeId: 'EMP-003',
    employeeName: 'David Chen',
    date: '2026-09-14',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    zone: 'Sales Floor - Apparel',
    isManagerOnDuty: false
  },
  {
    id: 'SH-03-MON',
    employeeId: 'EMP-005',
    employeeName: 'Liam Vance',
    date: '2026-09-14',
    startTime: '07:30 AM',
    endTime: '04:30 PM',
    zone: 'Stockroom / Receiving',
    isManagerOnDuty: false
  },
  {
    id: 'SH-04-MON',
    employeeId: 'EMP-006',
    employeeName: 'Aaliyah Washington',
    date: '2026-09-14',
    startTime: '11:00 AM',
    endTime: '08:00 PM',
    zone: 'Cash Desk',
    isManagerOnDuty: false
  },

  // Tuesday Sep 15
  {
    id: 'SH-05-TUE',
    employeeId: 'EMP-002',
    employeeName: 'Elena Rostova',
    date: '2026-09-15',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    zone: 'Sales Floor - Apparel',
    isManagerOnDuty: true
  },
  {
    id: 'SH-06-TUE',
    employeeId: 'EMP-004',
    employeeName: 'Sarah Jenkins',
    date: '2026-09-15',
    startTime: '09:00 AM',
    endTime: '05:30 PM',
    zone: 'Visual Merchandising',
    isManagerOnDuty: false
  },
  {
    id: 'SH-07-TUE',
    employeeId: 'EMP-003',
    employeeName: 'David Chen',
    date: '2026-09-15',
    startTime: '12:00 PM',
    endTime: '09:00 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: false
  },
  {
    id: 'SH-08-TUE',
    employeeId: 'EMP-006',
    employeeName: 'Aaliyah Washington',
    date: '2026-09-15',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    zone: 'Cash Desk',
    isManagerOnDuty: false
  },

  // Wednesday Sep 16
  {
    id: 'SH-09-WED',
    employeeId: 'EMP-001',
    employeeName: 'Marcus Sterling',
    date: '2026-09-16',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: true
  },
  {
    id: 'SH-10-WED',
    employeeId: 'EMP-005',
    employeeName: 'Liam Vance',
    date: '2026-09-16',
    startTime: '07:30 AM',
    endTime: '04:30 PM',
    zone: 'Stockroom / Receiving',
    isManagerOnDuty: false
  },
  {
    id: 'SH-11-WED',
    employeeId: 'EMP-002',
    employeeName: 'Elena Rostova',
    date: '2026-09-16',
    startTime: '01:00 PM',
    endTime: '09:30 PM',
    zone: 'Sales Floor - Apparel',
    isManagerOnDuty: true
  },
  {
    id: 'SH-12-WED',
    employeeId: 'EMP-003',
    employeeName: 'David Chen',
    date: '2026-09-16',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: false
  },

  // Thursday Sep 17
  {
    id: 'SH-13-THU',
    employeeId: 'EMP-002',
    employeeName: 'Elena Rostova',
    date: '2026-09-17',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    zone: 'Sales Floor - Apparel',
    isManagerOnDuty: true
  },
  {
    id: 'SH-14-THU',
    employeeId: 'EMP-004',
    employeeName: 'Sarah Jenkins',
    date: '2026-09-17',
    startTime: '09:00 AM',
    endTime: '05:30 PM',
    zone: 'Visual Merchandising',
    isManagerOnDuty: false
  },
  {
    id: 'SH-15-THU',
    employeeId: 'EMP-001',
    employeeName: 'Marcus Sterling',
    date: '2026-09-17',
    startTime: '12:30 PM',
    endTime: '09:30 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: true
  },
  {
    id: 'SH-16-THU',
    employeeId: 'EMP-006',
    employeeName: 'Aaliyah Washington',
    date: '2026-09-17',
    startTime: '10:00 AM',
    endTime: '07:00 PM',
    zone: 'Cash Desk',
    isManagerOnDuty: false
  },

  // Friday Sep 18 (Today)
  {
    id: 'SH-01',
    employeeId: 'EMP-001',
    employeeName: 'Marcus Sterling',
    date: '2026-09-18',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: true
  },
  {
    id: 'SH-02',
    employeeId: 'EMP-003',
    employeeName: 'David Chen',
    date: '2026-09-18',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: false
  },
  {
    id: 'SH-03',
    employeeId: 'EMP-006',
    employeeName: 'Aaliyah Washington',
    date: '2026-09-18',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    zone: 'Cash Desk',
    isManagerOnDuty: false
  },
  {
    id: 'SH-04',
    employeeId: 'EMP-005',
    employeeName: 'Liam Vance',
    date: '2026-09-18',
    startTime: '07:30 AM',
    endTime: '04:30 PM',
    zone: 'Stockroom / Receiving',
    isManagerOnDuty: false
  },
  {
    id: 'SH-05',
    employeeId: 'EMP-002',
    employeeName: 'Elena Rostova',
    date: '2026-09-18',
    startTime: '01:00 PM',
    endTime: '09:30 PM',
    zone: 'Sales Floor - Apparel',
    isManagerOnDuty: true
  },

  // Saturday Sep 19 (Weekend High Volume)
  {
    id: 'SH-17-SAT',
    employeeId: 'EMP-001',
    employeeName: 'Marcus Sterling',
    date: '2026-09-19',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: true
  },
  {
    id: 'SH-18-SAT',
    employeeId: 'EMP-002',
    employeeName: 'Elena Rostova',
    date: '2026-09-19',
    startTime: '11:00 AM',
    endTime: '08:00 PM',
    zone: 'Sales Floor - Apparel',
    isManagerOnDuty: true
  },
  {
    id: 'SH-19-SAT',
    employeeId: 'EMP-004',
    employeeName: 'Sarah Jenkins',
    date: '2026-09-19',
    startTime: '08:00 AM',
    endTime: '04:30 PM',
    zone: 'Visual Merchandising',
    isManagerOnDuty: false
  },
  {
    id: 'SH-20-SAT',
    employeeId: 'EMP-003',
    employeeName: 'David Chen',
    date: '2026-09-19',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: false
  },
  {
    id: 'SH-21-SAT',
    employeeId: 'EMP-006',
    employeeName: 'Aaliyah Washington',
    date: '2026-09-19',
    startTime: '10:00 AM',
    endTime: '07:00 PM',
    zone: 'Cash Desk',
    isManagerOnDuty: false
  },
  {
    id: 'SH-22-SAT',
    employeeId: 'EMP-005',
    employeeName: 'Liam Vance',
    date: '2026-09-19',
    startTime: '01:00 PM',
    endTime: '09:30 PM',
    zone: 'Stockroom / Receiving',
    isManagerOnDuty: false
  },

  // Sunday Sep 20
  {
    id: 'SH-23-SUN',
    employeeId: 'EMP-002',
    employeeName: 'Elena Rostova',
    date: '2026-09-20',
    startTime: '10:00 AM',
    endTime: '06:30 PM',
    zone: 'Sales Floor - Apparel',
    isManagerOnDuty: true
  },
  {
    id: 'SH-24-SUN',
    employeeId: 'EMP-003',
    employeeName: 'David Chen',
    date: '2026-09-20',
    startTime: '10:00 AM',
    endTime: '06:30 PM',
    zone: 'Sales Floor - Footwear',
    isManagerOnDuty: false
  },
  {
    id: 'SH-25-SUN',
    employeeId: 'EMP-006',
    employeeName: 'Aaliyah Washington',
    date: '2026-09-20',
    startTime: '10:30 AM',
    endTime: '07:00 PM',
    zone: 'Cash Desk',
    isManagerOnDuty: false
  },
  {
    id: 'SH-26-SUN',
    employeeId: 'EMP-005',
    employeeName: 'Liam Vance',
    date: '2026-09-20',
    startTime: '09:00 AM',
    endTime: '05:30 PM',
    zone: 'Stockroom / Receiving',
    isManagerOnDuty: false
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LV-301',
    employeeId: 'EMP-003',
    employeeName: 'David Chen',
    leaveType: 'Vacation',
    startDate: '2026-09-24',
    endDate: '2026-09-28',
    status: 'Pending',
    reason: 'Annual family leave scheduled after quarterly marathon campaign.',
    submittedDate: '2026-09-16'
  },
  {
    id: 'LV-302',
    employeeId: 'EMP-005',
    employeeName: 'Liam Vance',
    leaveType: 'Training',
    startDate: '2026-09-21',
    endDate: '2026-09-21',
    status: 'Approved',
    reason: 'Certified Forklift & High-Bay Safety Workshop (Mall Admin & OSHA).',
    submittedDate: '2026-09-12'
  }
];

export const INITIAL_VM_DIRECTIVES: VMDirective[] = [
  {
    id: 'VM-101',
    title: 'Autumn Velocity Window Façade & Mannequins',
    area: 'Store Front Window',
    type: 'Exterior',
    seasonCampaign: 'Autumn Sport High-Velocity 2026',
    guidelineNotes: 'Trio mannequin posture: Dynamic sprint pose. Footwear must spotlight AeroGlide Elite with directional 3000K spotlights. Mall corridor glass cleaned twice daily.',
    status: 'Compliant',
    lastInspected: '2026-09-17',
    inspector: 'Sarah Jenkins (VM Lead)',
    complianceScore: 98,
    keyActions: ['Spotlight alignment verified', 'Hero card typography adheres to 100% brand tone', 'No cable exposure']
  },
  {
    id: 'VM-102',
    title: 'Entrance Commercial Focal Point (Gondola #1)',
    area: 'Main Entrance Gondola',
    type: 'Interior',
    seasonCampaign: 'Autumn Sport High-Velocity 2026',
    guidelineNotes: 'Full size run (UK 7-12) displayed in clean geometric grid. Cross-merchandise DryPro tees on side hooks with matching sport caps.',
    status: 'Compliant',
    lastInspected: '2026-09-17',
    inspector: 'Marcus Sterling (Store Manager)',
    complianceScore: 94,
    keyActions: ['Size run replenished', 'Security sensors positioned at heel-tab standard', 'Pricing acrylics polished']
  },
  {
    id: 'VM-103',
    title: 'HydroShield Technical Outerwear Feature Wall',
    area: 'Lifestyle Apparel Wall',
    type: 'Interior',
    seasonCampaign: 'Urban Motion Lifestyle',
    guidelineNotes: 'Facing out on waterfall brackets in color-story gradient (Slate Grey to Electric Cyan). Max 4 hangers per waterfall pin.',
    status: 'Needs Attention',
    lastInspected: '2026-09-16',
    inspector: 'Elena Rostova (Asst. Manager)',
    complianceScore: 82,
    keyActions: ['Excess hangers removed', 'Steam pressing required on size L items', 'Re-orient LED track light']
  },
  {
    id: 'VM-104',
    title: 'Cash Wrap Impulse Display & Loss Prevention Line',
    area: 'Cash Wrap Accessories',
    type: 'Interior',
    seasonCampaign: 'Autumn Sport High-Velocity 2026',
    guidelineNotes: 'Display water bottles, anti-friction running socks, and nutrition gel packs. Direct line of sight to exit gate for active anti-shoplifting deterrent.',
    status: 'Compliant',
    lastInspected: '2026-09-17',
    inspector: 'Marcus Sterling (Store Manager)',
    complianceScore: 96,
    keyActions: ['Cash desk transaction lane clear', 'EAS tags tested on 100% accessories', 'Promotional QR stand visible']
  }
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'CUST-801',
    name: 'Victoria Hawthorne',
    email: 'v.hawthorne@metrocity.org',
    phone: '+1 (555) 890-1234',
    tier: 'VIP Platinum',
    lifetimeValue: 2850,
    totalOrders: 14,
    preferredCategory: 'Running',
    lastVisit: '2026-09-15',
    notes: 'Marathon training enthusiast. Prefers size 8.5 US narrow. Always reserves new AeroGlide colorways before launch.',
    purchaseHistory: [
      { date: '2026-09-15', items: 'AeroGlide Elite + HydroShield Jacket', amount: 320 },
      { date: '2026-08-20', items: 'DryPro Breathable Tee (x2) + Socks', amount: 125 },
      { date: '2026-07-04', items: 'ProTour Gym Duffle + Smart Belt', amount: 160 },
    ],
    npsScore: 10
  },
  {
    id: 'CUST-802',
    name: 'Julian Mercer',
    email: 'julian.m@architects.io',
    phone: '+1 (555) 901-2345',
    tier: 'Gold Runner',
    lifetimeValue: 1420,
    totalOrders: 7,
    preferredCategory: 'Streetwear',
    lastVisit: '2026-09-14',
    notes: 'Fashion-forward sports enthusiast. Enjoys urban lifestyle capsules and lightweight technical layers.',
    purchaseHistory: [
      { date: '2026-09-14', items: 'CloudPulse Max Trainers', amount: 165 },
      { date: '2026-08-11', items: 'Aerocool Cap + Apex Windbreaker', amount: 158 },
    ],
    npsScore: 9
  },
  {
    id: 'CUST-803',
    name: 'Nadia Solis',
    email: 'nadia.crossfit@gmail.com',
    phone: '+1 (555) 012-3456',
    tier: 'Silver Club',
    lifetimeValue: 840,
    totalOrders: 5,
    preferredCategory: 'Training',
    lastVisit: '2026-09-16',
    notes: 'Cross-training coach. Frequent bulk purchaser for local club workout cohorts.',
    purchaseHistory: [
      { date: '2026-09-16', items: 'ProTour Gym Duffle + DryPro Tee', amount: 140 },
      { date: '2026-08-01', items: 'Speed Rope + Grip Gloves + Wristbands', amount: 95 },
    ],
    npsScore: 9
  }
];

export const HISTORICAL_PRIOR_YEAR_SALES: Record<string, PriorYearSalesRecord> = {
  '2026-09-12': {
    priorYearDate: '2025-09-12',
    priorYearRevenue: 3980,
    priorYearUnits: 43,
    priorYearTransactions: 19,
    categories: { Footwear: 2150, Apparel: 1040, Equipment: 540, Accessories: 250 }
  },
  '2026-09-13': {
    priorYearDate: '2025-09-13',
    priorYearRevenue: 4820,
    priorYearUnits: 56,
    priorYearTransactions: 25,
    categories: { Footwear: 2580, Apparel: 1280, Equipment: 630, Accessories: 330 }
  },
  '2026-09-14': {
    priorYearDate: '2025-09-14',
    priorYearRevenue: 3350,
    priorYearUnits: 44,
    priorYearTransactions: 20,
    categories: { Footwear: 1780, Apparel: 940, Equipment: 430, Accessories: 200 }
  },
  '2026-09-15': {
    priorYearDate: '2025-09-15',
    priorYearRevenue: 4490,
    priorYearUnits: 62,
    priorYearTransactions: 28,
    categories: { Footwear: 2420, Apparel: 1250, Equipment: 550, Accessories: 270 }
  },
  '2026-09-16': {
    priorYearDate: '2025-09-16',
    priorYearRevenue: 2980,
    priorYearUnits: 38,
    priorYearTransactions: 17,
    categories: { Footwear: 1590, Apparel: 790, Equipment: 400, Accessories: 200 }
  },
  '2026-09-17': {
    priorYearDate: '2025-09-17',
    priorYearRevenue: 3120,
    priorYearUnits: 42,
    priorYearTransactions: 19,
    categories: { Footwear: 1690, Apparel: 820, Equipment: 410, Accessories: 200 }
  },
  '2026-09-18': {
    priorYearDate: '2025-09-18',
    priorYearRevenue: 2680,
    priorYearUnits: 37,
    priorYearTransactions: 17,
    categories: { Footwear: 1440, Apparel: 730, Equipment: 340, Accessories: 170 }
  }
};

export const INITIAL_LOSS_INCIDENTS: LossIncident[] = [
  {
    id: 'LP-INC-001',
    incidentNumber: 'LP-2026-038',
    incidentType: 'Suspected Theft / Shoplifting',
    severity: 'High',
    status: 'Under Investigation',
    productId: 'PRD-101',
    sku: 'SPRT-SH-091',
    productName: 'AeroGlide Elite Running Shoes',
    category: 'Footwear',
    quantity: 1,
    unitCost: 72,
    unitPrice: 180,
    estimatedFinancialLoss: 72,
    occurredAt: '2026-09-17 17:45',
    loggedBy: 'Marcus Vance (Store Manager)',
    location: 'Fitting Rooms Zone B',
    notes: 'Empty shoebox and severed EAS security lanyard found hidden beneath fitting room bench during routine evening floor sweep. Security camera shows male subject entering with oversized tote bag at 17:38.',
    cctvReviewed: true,
    cctvFootageRef: 'CAM-04-1738-1752',
    policeReportFiled: true,
    policeReportNumber: 'PD-2026-88412',
    actionTaken: 'Archived CCTV clip; shared suspect description with district retail security network; EAS gate sensitivity recalibrated on Pedestal 1.',
    deductedFromFloorStock: true
  },
  {
    id: 'LP-INC-002',
    incidentNumber: 'LP-2026-037',
    incidentType: 'Damaged Goods / Packaging',
    severity: 'Medium',
    status: 'Write-Off Approved',
    productId: 'PRD-103',
    sku: 'APP-JKT-440',
    productName: 'HydroShield Storm Runner Jacket',
    category: 'Apparel',
    quantity: 2,
    unitCost: 50,
    unitPrice: 140,
    estimatedFinancialLoss: 100,
    occurredAt: '2026-09-16 11:20',
    loggedBy: 'Elena Rostova (Assistant Manager)',
    location: 'Stockroom Receiving Bay 2',
    notes: 'Inbound shipment box-knife penetration across outer protective carton into waterproof membrane seam. Breached weatherproofing, rendering product unsellable at full retail value.',
    cctvReviewed: false,
    policeReportFiled: false,
    actionTaken: 'Logged inbound vendor freight damage claim #CLM-9034; units removed from salable stock and quarantined for vendor credit return.',
    deductedFromFloorStock: true
  },
  {
    id: 'LP-INC-003',
    incidentNumber: 'LP-2026-036',
    incidentType: 'Floor Display Wear & Tear',
    severity: 'Low',
    status: 'Write-Off Approved',
    productId: 'PRD-106',
    sku: 'EQP-PL-302',
    productName: 'ProGrip Carbon Trekking Poles',
    category: 'Equipment',
    quantity: 1,
    unitCost: 38,
    unitPrice: 95,
    estimatedFinancialLoss: 38,
    occurredAt: '2026-09-15 14:10',
    loggedBy: 'Marcus Vance (Store Manager)',
    location: 'Equipment Demonstration Area',
    notes: 'Floor demo unit dropped on concrete flooring by customer testing locking mechanism; lower carbon collar fractured and can no longer lock securely under bodyweight load.',
    cctvReviewed: true,
    cctvFootageRef: 'CAM-02-1408',
    policeReportFiled: false,
    actionTaken: 'Written off as promotional display sample expense; fresh demo unit deployed with protective bumper sleeve.',
    deductedFromFloorStock: true
  },
  {
    id: 'LP-INC-004',
    incidentNumber: 'LP-2026-035',
    incidentType: 'Unexplained Shrinkage / Inventory Discrepancy',
    severity: 'High',
    status: 'Pending Review',
    productId: 'PRD-107',
    sku: 'ACC-FL-501',
    productName: 'ThermaTech Hydration Flask 1L',
    category: 'Accessories',
    quantity: 3,
    unitCost: 14,
    unitPrice: 42,
    estimatedFinancialLoss: 42,
    occurredAt: '2026-09-14 20:30',
    loggedBy: 'Elena Rostova (Assistant Manager)',
    location: 'Cash Wrap Accessories Gondola',
    notes: 'Nightly cycle count of impulse cash wrap accessories revealed 12 units on shelf versus 15 units registered in POS stock ledger. No registered voids, damaged tags, or pending stock transfers.',
    cctvReviewed: false,
    policeReportFiled: false,
    actionTaken: 'Flagged for register cashier training on item barcode scan confirmation; scheduled POS log review for missed barcode scans.',
    deductedFromFloorStock: false
  },
  {
    id: 'LP-INC-005',
    incidentNumber: 'LP-2026-034',
    incidentType: 'Suspected Theft / Shoplifting',
    severity: 'Critical',
    status: 'Recovered / Closed',
    productId: 'PRD-102',
    sku: 'SPRT-SH-092',
    productName: 'CloudPulse Max Cushion Trainers',
    category: 'Footwear',
    quantity: 1,
    unitCost: 65,
    unitPrice: 165,
    estimatedFinancialLoss: 0,
    occurredAt: '2026-09-12 16:15',
    loggedBy: 'Marcus Vance (Store Manager)',
    location: 'Main Entrance Pedestal',
    notes: 'EAS pedestal alarm activated when customer exited quickly. Manager On Duty provided polite receipt-check customer service intervention. Merchandise voluntarily surrendered without confrontation.',
    cctvReviewed: true,
    cctvFootageRef: 'CAM-01-1614-1620',
    policeReportFiled: false,
    actionTaken: 'Footwear fully inspected, magnetic security tag reapplied correctly, and unit returned to live sales floor with $0 financial shrinkage loss.',
    deductedFromFloorStock: false
  }
];

