import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Company {
  id: string
  name: string
  nameAr: string
  logo: string
  website: string
  currency: string
  address: {
    street: string
    city: string
    region: string
    phone: string
  }
  categories: string[]
  services: any[]
  customerFields: {
    id: string
    label: string
    labelAr: string
    type: string
    required: boolean
    showFor: 'all' | 'individual' | 'business'
  }[]
}

// Company configurations
const companies: Company[] = [
  {
    id: 'tireshop',
    name: 'MotoCare',
    nameAr: 'موتوكير',
    logo: 'https://motocare.com.sa/wp-content/uploads/2023/11/MotoCareLogo-2-1536x281.png',
    website: 'motocare.com.sa',
    currency: 'SAR',
    address: {
      street: 'Olaya Street',
      city: 'Riyadh',
      region: 'Al Olaya',
      phone: '920001234'
    },
    categories: ['Quick Service', 'Tire Service', 'Alignment', 'Maintenance'],
    services: [
      {
        sku: 'TRS-001',
        name: 'Tire Rotation Service',
        nameAr: 'تبديل مواقع الإطارات',
        unit: 'Service',
        size: '15-18"',
        price: 180,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c',
        category: 'Quick Service',
        batchManaged: true,
        description: 'Regular tire rotation promotes even wear of your tires, extending their lifespan and improving vehicle handling.',
        features: [
          'Even tire wear distribution',
          'Improved vehicle handling',
          'Extended tire life',
          'Better fuel efficiency'
        ],
        specifications: {
          'Service Time': '30-45 minutes',
          'Recommended Interval': 'Every 5,000-8,000 km',
          'Warranty': '90 days',
          'Equipment Used': 'Hydraulic lift, Torque wrench'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'TRS-001-2024-001',
            quantity: 50,
            manufactureDate: '2024-01-15',
            expiryDate: '2025-01-15'
          },
          {
            id: 'b2',
            batchNumber: 'TRS-001-2024-002',
            quantity: 30,
            manufactureDate: '2024-02-01',
            expiryDate: '2025-02-01'
          },
          {
            id: 'b3',
            batchNumber: 'TRS-001-2024-003',
            quantity: 25,
            manufactureDate: '2024-03-01',
            expiryDate: '2025-03-01'
          }
        ]
      },
       {
        sku: 'TRS-001',
        name: 'Tire Rotation Service',
        nameAr: 'تبديل مواقع الإطارات',
        unit: 'Service',
        size: '15-18"',
        price: 180,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c',
        category: 'Quick Service',
        batchManaged: true,
        description: 'Regular tire rotation promotes even wear of your tires, extending their lifespan and improving vehicle handling.',
        features: [
          'Even tire wear distribution',
          'Improved vehicle handling',
          'Extended tire life',
          'Better fuel efficiency'
        ],
        specifications: {
          'Service Time': '30-45 minutes',
          'Recommended Interval': 'Every 5,000-8,000 km',
          'Warranty': '90 days',
          'Equipment Used': 'Hydraulic lift, Torque wrench'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'TRS-001-2024-001',
            quantity: 50,
            manufactureDate: '2024-01-15',
            expiryDate: '2025-01-15'
          },
          {
            id: 'b2',
            batchNumber: 'TRS-001-2024-002',
            quantity: 30,
            manufactureDate: '2024-02-01',
            expiryDate: '2025-02-01'
          },
          {
            id: 'b3',
            batchNumber: 'TRS-001-2024-003',
            quantity: 25,
            manufactureDate: '2024-03-01',
            expiryDate: '2025-03-01'
          }
        ]
      },
       {
        sku: 'TRS-001',
        name: 'Tire Rotation Service',
        nameAr: 'تبديل مواقع الإطارات',
        unit: 'Service',
        size: '15-18"',
        price: 180,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c',
        category: 'Quick Service',
        batchManaged: true,
        description: 'Regular tire rotation promotes even wear of your tires, extending their lifespan and improving vehicle handling.',
        features: [
          'Even tire wear distribution',
          'Improved vehicle handling',
          'Extended tire life',
          'Better fuel efficiency'
        ],
        specifications: {
          'Service Time': '30-45 minutes',
          'Recommended Interval': 'Every 5,000-8,000 km',
          'Warranty': '90 days',
          'Equipment Used': 'Hydraulic lift, Torque wrench'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'TRS-001-2024-001',
            quantity: 50,
            manufactureDate: '2024-01-15',
            expiryDate: '2025-01-15'
          },
          {
            id: 'b2',
            batchNumber: 'TRS-001-2024-002',
            quantity: 30,
            manufactureDate: '2024-02-01',
            expiryDate: '2025-02-01'
          },
          {
            id: 'b3',
            batchNumber: 'TRS-001-2024-003',
            quantity: 25,
            manufactureDate: '2024-03-01',
            expiryDate: '2025-03-01'
          }
        ]
      },
       {
        sku: 'TRS-001',
        name: 'Tire Rotation Service',
        nameAr: 'تبديل مواقع الإطارات',
        unit: 'Service',
        size: '15-18"',
        price: 180,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c',
        category: 'Quick Service',
        batchManaged: true,
        description: 'Regular tire rotation promotes even wear of your tires, extending their lifespan and improving vehicle handling.',
        features: [
          'Even tire wear distribution',
          'Improved vehicle handling',
          'Extended tire life',
          'Better fuel efficiency'
        ],
        specifications: {
          'Service Time': '30-45 minutes',
          'Recommended Interval': 'Every 5,000-8,000 km',
          'Warranty': '90 days',
          'Equipment Used': 'Hydraulic lift, Torque wrench'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'TRS-001-2024-001',
            quantity: 50,
            manufactureDate: '2024-01-15',
            expiryDate: '2025-01-15'
          },
          {
            id: 'b2',
            batchNumber: 'TRS-001-2024-002',
            quantity: 30,
            manufactureDate: '2024-02-01',
            expiryDate: '2025-02-01'
          },
          {
            id: 'b3',
            batchNumber: 'TRS-001-2024-003',
            quantity: 25,
            manufactureDate: '2024-03-01',
            expiryDate: '2025-03-01'
          }
        ]
      },
       {
        sku: 'TRS-001',
        name: 'Tire Rotation Service',
        nameAr: 'تبديل مواقع الإطارات',
        unit: 'Service',
        size: '15-18"',
        price: 180,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c',
        category: 'Quick Service',
        batchManaged: true,
        description: 'Regular tire rotation promotes even wear of your tires, extending their lifespan and improving vehicle handling.',
        features: [
          'Even tire wear distribution',
          'Improved vehicle handling',
          'Extended tire life',
          'Better fuel efficiency'
        ],
        specifications: {
          'Service Time': '30-45 minutes',
          'Recommended Interval': 'Every 5,000-8,000 km',
          'Warranty': '90 days',
          'Equipment Used': 'Hydraulic lift, Torque wrench'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'TRS-001-2024-001',
            quantity: 50,
            manufactureDate: '2024-01-15',
            expiryDate: '2025-01-15'
          },
          {
            id: 'b2',
            batchNumber: 'TRS-001-2024-002',
            quantity: 30,
            manufactureDate: '2024-02-01',
            expiryDate: '2025-02-01'
          },
          {
            id: 'b3',
            batchNumber: 'TRS-001-2024-003',
            quantity: 25,
            manufactureDate: '2024-03-01',
            expiryDate: '2025-03-01'
          }
        ]
      },
       {
        sku: 'TRS-001',
        name: 'Tire Rotation Service',
        nameAr: 'تبديل مواقع الإطارات',
        unit: 'Service',
        size: '15-18"',
        price: 180,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c',
        category: 'Quick Service',
        batchManaged: true,
        description: 'Regular tire rotation promotes even wear of your tires, extending their lifespan and improving vehicle handling.',
        features: [
          'Even tire wear distribution',
          'Improved vehicle handling',
          'Extended tire life',
          'Better fuel efficiency'
        ],
        specifications: {
          'Service Time': '30-45 minutes',
          'Recommended Interval': 'Every 5,000-8,000 km',
          'Warranty': '90 days',
          'Equipment Used': 'Hydraulic lift, Torque wrench'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'TRS-001-2024-001',
            quantity: 50,
            manufactureDate: '2024-01-15',
            expiryDate: '2025-01-15'
          },
          {
            id: 'b2',
            batchNumber: 'TRS-001-2024-002',
            quantity: 30,
            manufactureDate: '2024-02-01',
            expiryDate: '2025-02-01'
          },
          {
            id: 'b3',
            batchNumber: 'TRS-001-2024-003',
            quantity: 25,
            manufactureDate: '2024-03-01',
            expiryDate: '2025-03-01'
          }
        ]
      },
       {
        sku: 'TRS-001',
        name: 'Tire Rotation Service',
        nameAr: 'تبديل مواقع الإطارات',
        unit: 'Service',
        size: '15-18"',
        price: 180,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c',
        category: 'Quick Service',
        batchManaged: true,
        description: 'Regular tire rotation promotes even wear of your tires, extending their lifespan and improving vehicle handling.',
        features: [
          'Even tire wear distribution',
          'Improved vehicle handling',
          'Extended tire life',
          'Better fuel efficiency'
        ],
        specifications: {
          'Service Time': '30-45 minutes',
          'Recommended Interval': 'Every 5,000-8,000 km',
          'Warranty': '90 days',
          'Equipment Used': 'Hydraulic lift, Torque wrench'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'TRS-001-2024-001',
            quantity: 50,
            manufactureDate: '2024-01-15',
            expiryDate: '2025-01-15'
          },
          {
            id: 'b2',
            batchNumber: 'TRS-001-2024-002',
            quantity: 30,
            manufactureDate: '2024-02-01',
            expiryDate: '2025-02-01'
          },
          {
            id: 'b3',
            batchNumber: 'TRS-001-2024-003',
            quantity: 25,
            manufactureDate: '2024-03-01',
            expiryDate: '2025-03-01'
          }
        ]
      },
      {
        sku: 'WHA-001',
        name: 'Wheel Alignment Service',
        nameAr: 'ضبط زوايا العجلات',
        unit: 'Service',
        size: 'Standard',
        price: 280,
        image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f',
        category: 'Quick Service',
        description: 'Professional wheel alignment service to ensure your vehicle drives straight and handles properly.',
        features: [
          'Precise computerized alignment',
          'Reduced tire wear',
          'Improved steering response',
          'Better fuel economy'
        ],
        specifications: {
          'Service Time': '60-90 minutes',
          'Recommended Interval': 'Annually or every 20,000 km',
          'Warranty': '6 months',
          'Equipment Used': '3D alignment system, Lift rack'
        }
      }
    ],
    customerFields: [
      { id: 'name', label: 'Customer Name', labelAr: 'اسم العميل', type: 'text', required: true, showFor: 'all' },
      { id: 'mobile', label: 'Mobile Number', labelAr: 'رقم الجوال', type: 'tel', required: true, showFor: 'all' },
      { id: 'email', label: 'Email', labelAr: 'البريد الإلكتروني', type: 'email', required: false, showFor: 'all' },
      { id: 'type', label: 'Customer Type', labelAr: 'نوع العميل', type: 'select', required: true, showFor: 'all' },
      // Vehicle Information
      { id: 'plateNo', label: 'Plate Number', labelAr: 'رقم اللوحة', type: 'text', required: true, showFor: 'all' },
      { id: 'make', label: 'Vehicle Make', labelAr: 'نوع المركبة', type: 'text', required: true, showFor: 'all' },
      { id: 'model', label: 'Vehicle Model', labelAr: 'موديل المركبة', type: 'text', required: true, showFor: 'all' },
      { id: 'year', label: 'Vehicle Year', labelAr: 'سنة الصنع', type: 'number', required: true, showFor: 'all' },
      { id: 'vin', label: 'VIN', labelAr: 'رقم الهيكل', type: 'text', required: false, showFor: 'all' },
      // Business Customer Fields
      { id: 'cr', label: 'CR Number', labelAr: 'رقم السجل التجاري', type: 'text', required: true, showFor: 'business' },
      { id: 'vat', label: 'VAT Number', labelAr: 'الرقم الضريبي', type: 'text', required: true, showFor: 'business' },
      { id: 'fleet', label: 'Fleet Size', labelAr: 'حجم الأسطول', type: 'number', required: false, showFor: 'business' }
    ]
  },
  {
    id: 'alathar',
    name: 'Al Athar Perfumes',
    nameAr: 'العطر للعطور',
    logo: 'https://alathar.com/wp-content/uploads/2023/12/Alathar-logo-only-blue.svg',
    website: 'alathar.com',
    currency: 'SAR',
    address: {
      street: 'King Fahd Road',
      city: 'Riyadh',
      region: 'Al Worood',
      phone: '920002345'
    },
    categories: ['Perfumes', 'Oils', 'Incense', 'Accessories'],
    services: [
      {
        sku: 'PRF-001',
        name: 'Royal Oud Perfume',
        nameAr: 'العود الملكي',
        unit: 'Bottle',
        size: '100ml',
        price: 1850,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f',
        category: 'Perfumes',
        description: 'Premium oud-based fragrance with rich woody notes.',
        features: [
          'Premium oud essence',
          'Long-lasting fragrance',
          'Luxury glass bottle',
          'Gift box included'
        ],
        specifications: {
          'Volume': '100ml',
          'Concentration': 'Parfum',
          'Notes': 'Oud, Amber, Musk',
          'Origin': 'UAE'
        },
        batches: [
          {
            id: 'b1',
            batchNumber: 'LOT-2024-001',
            quantity: 25,
            manufactureDate: '2024-01-01',
            expiryDate: '2026-01-01'
          }
        ]
      },
      {
        sku: 'OIL-001',
        name: 'Pure Agarwood Oil',
        nameAr: 'دهن العود الخالص',
        unit: 'Bottle',
        size: '12ml',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc',
        category: 'Oils',
        description: 'Pure agarwood oil extracted from premium quality wood.',
        features: [
          '100% pure oil',
          'Traditional extraction',
          'Premium quality',
          'Authentic source'
        ],
        specifications: {
          'Volume': '12ml',
          'Purity': '100%',
          'Source': 'Indian Agarwood',
          'Grade': 'Premium'
        }
      }
    ],
    customerFields: [
      { id: 'name', label: 'Customer Name', labelAr: 'اسم العميل', type: 'text', required: true, showFor: 'all' },
      { id: 'mobile', label: 'Mobile Number', labelAr: 'رقم الجوال', type: 'tel', required: true, showFor: 'all' },
      { id: 'email', label: 'Email', labelAr: 'البريد الإلكتروني', type: 'email', required: false, showFor: 'all' },
      { id: 'type', label: 'Customer Type', labelAr: 'نوع العميل', type: 'select', required: true, showFor: 'all' },
      // Loyalty Program Fields
      { id: 'membershipNo', label: 'Membership Number', labelAr: 'رقم العضوية', type: 'text', required: false, showFor: 'individual' },
      { id: 'birthDate', label: 'Birth Date', labelAr: 'تاريخ الميلاد', type: 'date', required: false, showFor: 'individual' },
      { id: 'preferences', label: 'Fragrance Preferences', labelAr: 'تفضيلات العطور', type: 'multiselect', required: false, showFor: 'individual' },
      // Business Customer Fields
      { id: 'cr', label: 'CR Number', labelAr: 'رقم السجل التجاري', type: 'text', required: true, showFor: 'business' },
      { id: 'vat', label: 'VAT Number', labelAr: 'الرقم الضريبي', type: 'text', required: true, showFor: 'business' },
      { id: 'sector', label: 'Business Sector', labelAr: 'القطاع', type: 'select', required: false, showFor: 'business' },
      { id: 'purchaseLimit', label: 'Monthly Purchase Limit', labelAr: 'حد الشراء الشهري', type: 'number', required: false, showFor: 'business' }
    ]
  }
]

export const useCompanyStore = defineStore('company', () => {
  const selectedCompanyId = ref(localStorage.getItem('selectedCompanyId') || 'tireshop')

  // Save selected company to localStorage when changed
  const setSelectedCompany = (companyId: string) => {
    selectedCompanyId.value = companyId
    localStorage.setItem('selectedCompanyId', companyId)
  }

  const selectedCompany = computed(() => {
    return companies.find(c => c.id === selectedCompanyId.value) || companies[0]
  })

  const getCustomerFields = (customerType: 'individual' | 'business') => {
    return selectedCompany.value.customerFields.filter(field => 
      field.showFor === 'all' || field.showFor === customerType
    )
  }

  const getServices = () => {
    return selectedCompany.value.services
  }

  const getCategories = () => {
    return selectedCompany.value.categories
  }

  // Format price in SAR with English numbers
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price) + ' SAR'
  }

  return {
    companies,
    selectedCompanyId,
    selectedCompany,
    setSelectedCompany,
    getCustomerFields,
    getServices,
    getCategories,
    formatPrice
  }
})