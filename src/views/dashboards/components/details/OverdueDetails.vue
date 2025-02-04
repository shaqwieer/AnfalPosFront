<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  data: any
  viewMode: 'chart' | 'table'
}>()

// Sample overdue data
const overdueData = ref([
  {
    salesRep: 'Mohammed Al-Saud',
    customer: 'Al-Futtaim Auto Services',
    invoice: 'INV-001',
    date: '2024-02-15',
    amount: 25000,
    days: 35,
    category: '30-60'
  },
  {
    salesRep: 'Abdullah Al-Qahtani',
    customer: 'Quick Service Center',
    invoice: 'INV-002',
    date: '2024-01-20',
    amount: 18000,
    days: 62,
    category: '60-90'
  },
  {
    salesRep: 'Khalid Al-Otaibi',
    customer: 'Premium Auto Care',
    invoice: 'INV-003',
    date: '2023-12-15',
    amount: 22000,
    days: 95,
    category: '90+'
  },
  {
    salesRep: 'Mohammed Al-Saud',
    customer: 'Auto Zone Services',
    invoice: 'INV-004',
    date: '2024-02-20',
    amount: 15000,
    days: 30,
    category: '30-60'
  },
  {
    salesRep: 'Abdullah Al-Qahtani',
    customer: 'Car Care Center',
    invoice: 'INV-005',
    date: '2023-12-10',
    amount: 20000,
    days: 100,
    category: '90+'
  }
])

// Chart data
const chartData = computed(() => {
  const salesRepData = {}
  overdueData.value.forEach(item => {
    if (!salesRepData[item.salesRep]) {
      salesRepData[item.salesRep] = {
        '30-60': 0,
        '60-90': 0,
        '90+': 0
      }
    }
    salesRepData[item.salesRep][item.category] += item.amount
  })

  return {
    labels: Object.keys(salesRepData),
    datasets: [
      {
        label: '30-60 Days',
        data: Object.values(salesRepData).map(data => data['30-60']),
        backgroundColor: '#f59e0b'
      },
      {
        label: '60-90 Days',
        data: Object.values(salesRepData).map(data => data['60-90']),
        backgroundColor: '#f97316'
      },
      {
        label: '90+ Days',
        data: Object.values(salesRepData).map(data => data['90+']),
        backgroundColor: '#ef4444'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    },
    title: {
      display: true,
      text: 'Overdue Analysis by Sales Rep'
    }
  },
  scales: {
    x: {
      stacked: true
    },
    y: {
      stacked: true,
      beginAtZero: true
    }
  }
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
}

// Summary calculations
const summary = computed(() => {
  const total30_60 = overdueData.value
    .filter(item => item.category === '30-60')
    .reduce((sum, item) => sum + item.amount, 0)
  
  const total60_90 = overdueData.value
    .filter(item => item.category === '60-90')
    .reduce((sum, item) => sum + item.amount, 0)
  
  const total90Plus = overdueData.value
    .filter(item => item.category === '90+')
    .reduce((sum, item) => sum + item.amount, 0)

  return {
    total30_60,
    total60_90,
    total90Plus,
    totalOverdue: total30_60 + total60_90 + total90Plus,
    totalInvoices: overdueData.value.length,
    totalCustomers: new Set(overdueData.value.map(item => item.customer)).size,
    totalSalesReps: new Set(overdueData.value.map(item => item.salesRep)).size
  }
})

const getAgingColor = (category: string) => {
  switch (category) {
    case '30-60': return 'bg-yellow-100 text-yellow-800'
    case '60-90': return 'bg-orange-100 text-orange-800'
    case '90+': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">30-60 Days</div>
        <div class="text-2xl font-bold text-yellow-600">{{ formatPrice(summary.total30_60) }}</div>
        <div class="text-sm text-gray-500">{{ overdueData.filter(i => i.category === '30-60').length }} invoices</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">60-90 Days</div>
        <div class="text-2xl font-bold text-orange-600">{{ formatPrice(summary.total60_90) }}</div>
        <div class="text-sm text-gray-500">{{ overdueData.filter(i => i.category === '60-90').length }} invoices</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">90+ Days</div>
        <div class="text-2xl font-bold text-red-600">{{ formatPrice(summary.total90Plus) }}</div>
        <div class="text-sm text-gray-500">{{ overdueData.filter(i => i.category === '90+').length }} invoices</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="text-sm text-gray-500">Total Overdue</div>
        <div class="text-2xl font-bold text-gray-900">{{ formatPrice(summary.totalOverdue) }}</div>
        <div class="text-sm text-gray-500">{{ summary.totalInvoices }} invoices</div>
      </div>
    </div>

    <!-- Chart View -->
    <div v-if="viewMode === 'chart'" class="bg-white rounded-lg shadow-sm border p-6">
      <div class="h-[400px]">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Rep</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aging</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in overdueData" :key="item.invoice">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.salesRep }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.customer }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.invoice }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(item.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                {{ formatPrice(item.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center">{{ item.days }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="px-2 py-1 text-xs rounded-full"
                      :class="getAgingColor(item.category)">
                  {{ item.category }} days
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total ({{ summary.totalSalesReps }} Sales Reps)
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ summary.totalCustomers }} Customers
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ summary.totalInvoices }} Invoices
              </td>
              <td class="px-6 py-4"></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                {{ formatPrice(summary.totalOverdue) }}
              </td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>