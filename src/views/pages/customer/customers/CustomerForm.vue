<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import CustomerAttachments from './CustomerAttachments.vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const props = defineProps<{
  show: boolean
  customer?: any // For edit mode
  readOnly?: boolean // For view mode
}>()

const emit = defineEmits(['close', 'submit'])

// Initialize left column tab state
const leftColumnTab = ref('basic')

// Map refs
const mapRef = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const marker = ref<L.Marker | null>(null)
const searchResults = ref<any[]>([])
const searchQuery = ref('')
const locationError = ref('')
const mapZoom = ref(12)

// Form data with all fields
const formData = ref({
  // Basic Information
  name: props.customer?.name || '',
  type: props.customer?.type || 'business',
  mobile: props.customer?.mobile || '',
  email: props.customer?.email || '',
  
  // Business Information
  cr: props.customer?.cr || '',
  vat: props.customer?.vat || '',
  
  // Financial Information
  creditLimit: props.customer?.creditLimit || 0,
  paymentTerms: props.customer?.paymentTerms || '75',
  bankName: props.customer?.bankName || '',
  bankAccount: props.customer?.bankAccount || '',
  iban: props.customer?.iban || '',
  swiftCode: props.customer?.swiftCode || '',
  financialNotes: props.customer?.financialNotes || '',
  
  // Address Information
  buildingNumber: props.customer?.buildingNumber || '',
  streetName: props.customer?.streetName || '',
  district: props.customer?.district || '',
  city: props.customer?.city || '',
  postalCode: props.customer?.postalCode || '',
  additionalNumber: props.customer?.additionalNumber || '',
  
  // Location
  location: {
    lat: props.customer?.location?.lat || 24.7136,
    lng: props.customer?.location?.lng || 46.6753,
    address: props.customer?.location?.address || ''
  },
  
  // Attachments
  attachments: props.customer?.attachments || []
})

// Left column tabs
const leftTabs = [
  { id: 'basic', name: 'Basic Information', icon: 'person' },
  { id: 'business', name: 'Business Information', icon: 'business' },
  { id: 'financial', name: 'Financial Information', icon: 'account_balance' },
  { id: 'address', name: 'Address Information', icon: 'location_on' },
  { id: 'documents', name: 'Documents', icon: 'folder' },
  { id: 'notes', name: 'Notes', icon: 'notes' }
]

// Payment terms options
const paymentTermsOptions = [
  { value: '30', label: '30 Days' },
  { value: '45', label: '45 Days' },
  { value: '60', label: '60 Days' },
  { value: '75', label: '75 Days' },
  { value: '90', label: '90 Days' }
]

// Initialize map
const initMap = async () => {
  if (!mapRef.value || map.value) return

  // Wait for the map container to be rendered
  await nextTick()

  try {
    // Create map centered on customer location or default
    map.value = L.map(mapRef.value).setView(
      [formData.value.location.lat, formData.value.location.lng], 
      mapZoom.value
    )

    // Add base layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    })

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })

    // Add layers to map
    osmLayer.addTo(map.value)
    
    // Add layer control
    const baseLayers = {
      "Street": osmLayer,
      "Satellite": satelliteLayer
    }
    L.control.layers(baseLayers).addTo(map.value)

    // Add zoom control in top right
    L.control.zoom({
      position: 'topright'
    }).addTo(map.value)

    // Add scale control
    L.control.scale({
      imperial: false,
      position: 'bottomright'
    }).addTo(map.value)

    // Add marker
    marker.value = L.marker(
      [formData.value.location.lat, formData.value.location.lng],
      { draggable: !props.readOnly }
    ).addTo(map.value)

    // Handle marker drag if not in read-only mode
    if (!props.readOnly) {
      marker.value.on('dragend', async () => {
        const position = marker.value?.getLatLng()
        if (!position) return

        // Update location in form
        await reverseGeocode(position.lat, position.lng)
      })
    }

    // Add search control if not in read-only mode
    if (!props.readOnly) {
      const searchControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
          const searchBox = L.DomUtil.create('div', 'leaflet-control-search', container)
          
          searchBox.innerHTML = `
            <div class="relative">
              <input type="text" 
                     class="w-64 px-4 py-2 pr-10 border-round-lg border bg-white"
                     placeholder="Search address...">
              <span class="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
            </div>
          `
          
          const input = searchBox.querySelector('input')
          
          // Prevent map zoom when scrolling the input
          L.DomEvent.disableClickPropagation(container)
          
          // Handle search
          let timeout: NodeJS.Timeout
          input?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement
            clearTimeout(timeout)
            timeout = setTimeout(() => searchAddress(target.value), 500)
          })
          
          return container
        }
      })
      map.value.addControl(new searchControl())
    }
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

// Search address using Nominatim
const searchAddress = async (query: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=sa`
    )
    const results = await response.json()
    
    if (results.length > 0) {
      searchResults.value = results
      const { lat, lon } = results[0]
      map.value?.setView([lat, lon], 16)
      marker.value?.setLatLng([lat, lon])
      
      // Update form with address details
      await reverseGeocode(lat, lon)
    }
  } catch (error) {
    console.error('Error searching address:', error)
  }
}

// Reverse geocode coordinates
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
    const data = await response.json()
    
    formData.value.location = {
      lat,
      lng,
      address: data.display_name
    }

    // Update address fields
    updateAddressFromGeocoding(data)
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    formData.value.location.address = 'Address lookup failed'
  }
}

// Update address fields from geocoding result
const updateAddressFromGeocoding = (data: any) => {
  if (!data.address) return

  formData.value.buildingNumber = data.address.house_number || ''
  formData.value.streetName = data.address.road || ''
  formData.value.district = data.address.suburb || ''
  formData.value.city = data.address.city || 'Riyadh'
  formData.value.postalCode = data.address.postcode || ''
}

// Get current location
const getCurrentLocation = async () => {
  if (props.readOnly) return

  try {
    locationError.value = ''
    
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })

    const { latitude, longitude } = position.coords

    // Update map and marker
    if (map.value && marker.value) {
      map.value.setView([latitude, longitude], 16)
      marker.value.setLatLng([latitude, longitude])
    }

    // Update form and get address
    await reverseGeocode(latitude, longitude)
  } catch (error: any) {
    console.error('Error getting location:', error)
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        locationError.value = 'Location access was denied. Please enable location services.'
        break
      case error.POSITION_UNAVAILABLE:
        locationError.value = 'Location information is unavailable.'
        break
      case error.TIMEOUT:
        locationError.value = 'Location request timed out.'
        break
      default:
        locationError.value = 'Unable to get current location.'
    }
  }
}

const handleSubmit = () => {
  if (props.readOnly) return

  emit('submit', {
    ...formData.value,
    status: 'draft',
    approvalStatus: 'pending',
    createdDate: new Date().toISOString().split('T')[0]
  })
}

const handleAttachmentsUpdate = (attachments: any[]) => {
  if (props.readOnly) return
  formData.value.attachments = attachments
}

// Initialize map when component mounts
onMounted(() => {
  if (leftColumnTab.value === 'address') {
    initMap()
  }
})

// Watch for tab changes to initialize map when needed
watch(leftColumnTab, (newTab) => {
  if (newTab === 'address' && !map.value) {
    nextTick(() => {
      initMap()
    })
  }
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex align-items-center justify-content-center z-50">
    <div class="bg-white border-round-xl w-full max-w-7xl max-h-[90vh] flex flex-column">
      <!-- Header -->
      <div class="p-4 border-b flex align-items-center justify-content-between">
        <h2 class="text-xl font-semibold">
          {{ readOnly ? 'Customer Details' : customer ? 'Edit Customer' : 'New Customer' }}
        </h2>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex-1 overflow-hidden">
        <!-- Single column layout -->
        <div class="h-full flex flex-column">
          <!-- Tabs -->
          <div class="flex border-b overflow-x-auto">
            <button v-for="tab in leftTabs"
                    :key="tab.id"
                    type="button"
                    @click="leftColumnTab = tab.id"
                    class="px-4 py-2 flex align-items-center space-x-2 relative whitespace-nowrap"
                    :class="leftColumnTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'">
              <span class="material-icons text-sm">{{ tab.icon }}</span>
              <span>{{ tab.name }}</span>
              <div v-if="leftColumnTab === tab.id" 
                   class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            </button>
          </div>

          <!-- Tab Content - Scrollable -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Basic Information -->
            <div v-show="leftColumnTab === 'basic'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Customer Name</label>
                <input v-model="formData.name" 
                       type="text" 
                       required
                       :disabled="readOnly"
                       class="w-full border-round-lg border">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Mobile Number</label>
                <input v-model="formData.mobile" 
                       type="tel" 
                       required
                       :disabled="readOnly"
                       class="w-full border-round-lg border">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input v-model="formData.email" 
                       type="email"
                       :disabled="readOnly"
                       class="w-full border-round-lg border">
              </div>
            </div>

            <!-- Business Information -->
            <div v-show="leftColumnTab === 'business'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">CR Number</label>
                <input v-model="formData.cr" 
                       type="text"
                       :disabled="readOnly"
                       class="w-full border-round-lg border">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">VAT Number</label>
                <input v-model="formData.vat" 
                       type="text"
                       :disabled="readOnly"
                       class="w-full border-round-lg border">
              </div>
            </div>

            <!-- Financial Information -->
            <div v-show="leftColumnTab === 'financial'" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">Financial Information</h3>
              
              <!-- Credit and Payment Terms -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Credit Limit (SAR)</label>
                  <input v-model="formData.creditLimit"
                         type="number"
                         min="0"
                         step="1000"
                         required
                         :disabled="readOnly"
                         class="w-full border-round-lg border">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select v-model="formData.paymentTerms"
                          required
                          :disabled="readOnly"
                          class="w-full border-round-lg border">
                    <option v-for="term in paymentTermsOptions"
                            :key="term.value"
                            :value="term.value">
                      {{ term.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Bank Information -->
              <div class="bg-gray-50 p-4 border-round-lg space-y-4">
                <h4 class="font-medium">Bank Information</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input v-model="formData.bankName" 
                           type="text"
                           :disabled="readOnly"
                           class="w-full border-round-lg border">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input v-model="formData.bankAccount" 
                           type="text"
                           :disabled="readOnly"
                           class="w-full border-round-lg border">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                    <input v-model="formData.iban" 
                           type="text"
                           :disabled="readOnly"
                           class="w-full border-round-lg border" 
                           placeholder="SA...">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
                    <input v-model="formData.swiftCode" 
                           type="text"
                           :disabled="readOnly"
                           class="w-full border-round-lg border">
                  </div>
                </div>
              </div>

              <!-- Financial Notes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Financial Notes</label>
                <textarea v-model="formData.financialNotes"
                         rows="3"
                         :disabled="readOnly"
                         class="w-full border-round-lg border"
                         placeholder="Add any financial notes or special payment arrangements..."></textarea>
              </div>
            </div>

            <!-- Address Information -->
            <div v-show="leftColumnTab === 'address'" class="space-y-6">
              <!-- Map View -->
              <div class="h-[300px] border-round-lg border overflow-hidden relative">
                <div ref="mapRef" class="w-full h-full"></div>
                
                <!-- Search Results Dropdown -->
                <div v-if="!readOnly && searchResults.length > 0"
                     class="absolute top-16 left-12 w-64 bg-white border-round-lg shadow-5 border z-[1000] max-h-48 overflow-y-auto">
                  <div v-for="result in searchResults"
                       :key="result.place_id"
                       class="p-2 hover:bg-gray-50 cursor-pointer"
                       @click="selectSearchResult(result)">
                    <div class="font-medium">{{ result.display_name }}</div>
                    <div class="text-xs text-gray-500">{{ result.type }}</div>
                  </div>
                </div>
              </div>

              <!-- Location Error -->
              <div v-if="locationError" class="text-red-600 text-sm">
                {{ locationError }}
              </div>

              <!-- Location Info -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Latitude</label>
                  <input v-model="formData.location.lat"
                         type="number"
                         step="0.000001"
                         class="w-full border-round-lg border"
                         readonly>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Longitude</label>
                  <input v-model="formData.location.lng"
                         type="number"
                         step="0.000001"
                         class="w-full border-round-lg border"
                         readonly>
                </div>
              </div>

              <!-- Address Fields -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Building Number</label>
                  <input v-model="formData.buildingNumber" 
                         type="text"
                         :disabled="readOnly"
                         class="w-full border-round-lg border">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Street Name</label>
                  <input v-model="formData.streetName" 
                         type="text"
                         :disabled="readOnly"
                         class="w-full border-round-lg border">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">District</label>
                  <input v-model="formData.district" 
                         type="text"
                         :disabled="readOnly"
                         class="w-full border-round-lg border">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">City</label>
                  <input v-model="formData.city" 
                         type="text"
                         :disabled="readOnly"
                         class="w-full border-round-lg border">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Postal Code</label>
                  <input v-model="formData.postalCode" 
                         type="text"
                         :disabled="readOnly"
                         class="w-full border-round-lg border">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Additional Number</label>
                  <input v-model="formData.additionalNumber" 
                         type="text"
                         :disabled="readOnly"
                         class="w-full border-round-lg border">
                </div>
              </div>

              <!-- Current Location Button -->
              <div v-if="!readOnly" class="flex justify-end">
                <button type="button"
                        @click="getCurrentLocation"
                        class="px-3 py-1.5 text-sm bg-blue-600 text-white border-round-lg hover:bg-blue-700">
                  <span class="material-icons align-middle text-sm mr-1">my_location</span>
                  Get Current Location
                </button>
              </div>
            </div>

            <!-- Documents -->
            <div v-show="leftColumnTab === 'documents'">
              <CustomerAttachments 
                :customer-id="customer?.id || 'new'"
                :read-only="readOnly"
                @update="handleAttachmentsUpdate" />
            </div>

            <!-- Notes -->
            <div v-show="leftColumnTab === 'notes'" class="space-y-4">
              <h3 class="text-lg font-medium">Additional Notes</h3>
              <textarea v-model="formData.notes"
                        rows="4"
                        :disabled="readOnly"
                        class="w-full border-round-lg border"
                        placeholder="Add any additional notes..."></textarea>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="p-4 border-t flex justify-end space-x-3">
          <button type="button"
                  @click="$emit('close')"
                  class="px-4 py-2 border border-round-lg hover:bg-gray-50">
            {{ readOnly ? 'Close' : 'Cancel' }}
          </button>
          <button v-if="!readOnly"
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white border-round-lg hover:bg-blue-700">
            {{ customer ? 'Update Customer' : 'Create Customer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Map container styles */
.map-container {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Map-specific styles */
.leaflet-container {
  z-index: 1;
}

.leaflet-control-search input {
  min-width: 0;
  font-size: 14px;
}

.leaflet-control-search input:focus {
  outline: none;
  border-color: var(--sap-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.leaflet-control-fullscreen a {
  background: white;
  color: #666;
}

.leaflet-control-fullscreen a:hover {
  background: #f8f9fa;
}

.leaflet-control-layers {
  border: none !important;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2) !important;
  border-radius: 8px !important;
}

.leaflet-control-layers-toggle {
  width: 34px !important;
  height: 34px !important;
}

.leaflet-touch .leaflet-control-layers-toggle {
  width: 34px !important;
  height: 34px !important;
}

/* Search Results */
.search-results {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>