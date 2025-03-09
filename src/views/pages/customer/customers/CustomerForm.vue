<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
//import CustomerAttachments from './CustomerAttachments.vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CustomerAttachmentsNew from './CustomerAttachmentsNew.vue';

import apiClient from '@/api/apiClient';

import { handleError } from '@/utilities/errorHandler';

const props = defineProps<{
  show: boolean;
  customer?: any; // For edit mode
  readOnly?: boolean; // For view mode
  action?: string;
}>();

const emit = defineEmits(['close', 'submit']);

// Initialize left column tab state
const leftColumnTab = ref('basic');

// Map refs
const mapRef = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const marker = ref<L.Marker | null>(null);
const searchResults = ref<any[]>([]);
const searchQuery = ref('');
const locationError = ref('');
const mapZoom = ref(12);

const selectedRegion = ref('');

// Form data with all fields
const formData = ref({
  // Basic Information
  id: props.customer?.id || '',
  name: props.customer?.name || '',
  type: props.customer?.type || 'business',
  mobile: props.customer?.primaryPhone || '',
  email: props.customer?.email || '',

  Region: props.customer?.selectedRegion || '',

  // Business Information
  cr: props.customer?.crNumber || '',
  vat: props.customer?.vatNumber || '',

  // Financial Information
  creditLimit: props.customer?.creditLimit || 0,
  paymentTerms: props.customer?.paymentTerms || '75',
  bankName: props.customer?.bankName || '',
  bankAccount: props.customer?.accountNumber || '',
  iban: props.customer?.iban || '',
  swiftCode: props.customer?.swiftCode || '',
  financialNotes: props.customer?.financeNotes || '',
  bulkStorageLocation: props.customer?.bulkStorageLocation || '',
  bulkOrderType: props.customer?.bulkOrderType || '',

  // Address Information
  buildingNumber: props.customer?.buildingNumber || '',
  streetName: props.customer?.streetName || '',
  district: props.customer?.district || '',
  city: props.customer?.city || '',
  postalCode: props.customer?.postalCode || '',
  additionalNumber: props.customer?.additionalNumber || '',
  latitude: props.customer?.latitude || 24.7136,
  altitude: props.customer?.altitude || 46.6753,
  // Location
  location: {
    lat: props.customer?.latitude || 24.7136,
    lng: props.customer?.altitude || 46.6753,
    address: props.customer?.location?.address || ''
  },

  // Attachments
  attachments: props.customer?.attachments || [],
  notes: props.customer?.additionalNotes || ''
});
const attachments = ref(props.customer?.attachments || []);

// Left column tabs
const leftTabs = [
  { id: 'basic', name: 'Basic_Information', icon: 'user' },
  { id: 'business', name: 'Business_Information', icon: 'building' },
  { id: 'financial', name: 'Financial_Information', icon: 'wallet' },
  { id: 'address', name: 'Address_Information', icon: 'map-marker' },
  { id: 'documents', name: 'Documents', icon: 'folder' },
  { id: 'notes', name: 'Notes', icon: 'file-edit' }
];

// Payment terms options
const paymentTermsOptions = [
  { value: '30', label: '30 Days' },
  { value: '45', label: '45 Days' },
  { value: '60', label: '60 Days' },
  { value: '75', label: '75 Days' },
  { value: '90', label: '90 Days' }
];

// Initialize map
const initMap = async () => {
  if (!mapRef.value || map.value) return;

  await nextTick();

  try {
    map.value = L.map(mapRef.value).setView([formData.value.location.lat, formData.value.location.lng], mapZoom.value);

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    osmLayer.addTo(map.value);

    const baseLayers = {
      Street: osmLayer,
      Satellite: satelliteLayer
    };
    L.control.layers(baseLayers).addTo(map.value);

    L.control
      .zoom({
        position: 'topright'
      })
      .addTo(map.value);

    L.control
      .scale({
        imperial: false,
        position: 'bottomright'
      })
      .addTo(map.value);

    marker.value = L.marker([formData.value.location.lat, formData.value.location.lng], { draggable: !props.readOnly }).addTo(map.value);

    if (!props.readOnly) {
      marker.value.on('dragend', async () => {
        const position = marker.value?.getLatLng();
        if (!position) return;
        await reverseGeocode(position.lat, position.lng);
      });
    }

    if (!props.readOnly) {
      const searchControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          const searchBox = L.DomUtil.create('div', 'leaflet-control-search', container);

          searchBox.innerHTML = `
            <div class="relative">
              <span class="p-input-icon-left w-full">
                <i class="pi pi-search"></i>
                <input type="text" 
                       class="p-inputtext w-full"
                       placeholder="Search address...">
              </span>
            </div>
          `;

          const input = searchBox.querySelector('input');

          L.DomEvent.disableClickPropagation(container);

          let timeout: NodeJS.Timeout;
          input?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            clearTimeout(timeout);
            timeout = setTimeout(() => searchAddress(target.value), 500);
          });

          return container;
        }
      });
      map.value.addControl(new searchControl());
    }
  } catch (error) {
    console.error('Error initializing map:', error);
  }
};

// Search address using Nominatim
const searchAddress = async (query: string) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=sa`);
    const results = await response.json();

    if (results.length > 0) {
      searchResults.value = results;
      const { lat, lon } = results[0];
      map.value?.setView([lat, lon], 16);
      marker.value?.setLatLng([lat, lon]);

      await reverseGeocode(lat, lon);
    }
  } catch (error) {
    console.error('Error searching address:', error);
  }
};

// Reverse geocode coordinates
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();

    formData.value.location = {
      lat,
      lng,
      address: data.display_name
    };

    updateAddressFromGeocoding(data);
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    formData.value.location.address = 'Address lookup failed';
  }
};

// Update address fields from geocoding result
const updateAddressFromGeocoding = (data: any) => {
  if (!data.address) return;

  formData.value.buildingNumber = data.address.house_number || '';
  formData.value.streetName = data.address.road || '';
  formData.value.district = data.address.suburb || '';
  formData.value.city = data.address.city || 'Riyadh';
  formData.value.postalCode = data.address.postcode || '';
};

// Get current location
const getCurrentLocation = async () => {
  if (props.readOnly) return;

  try {
    locationError.value = '';

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;

    if (map.value && marker.value) {
      map.value.setView([latitude, longitude], 16);
      marker.value.setLatLng([latitude, longitude]);
    }

    await reverseGeocode(latitude, longitude);
  } catch (error: any) {
    console.error('Error getting location:', error);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        locationError.value = 'Location access was denied. Please enable location services.';
        break;
      case error.POSITION_UNAVAILABLE:
        locationError.value = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        locationError.value = 'Location request timed out.';
        break;
      default:
        locationError.value = 'Unable to get current location.';
    }
  }
};

const handleSubmit = () => {
  if (props.readOnly) return;
  formData.value.attachments = attachments.value;
  console.log('formData.value');
  console.log(formData.value);
  emit('submit', formData.value);
};

const handleAttachmentsUpdate = (attachments: any[]) => {
  if (props.readOnly) return;
  formData.value.attachments = attachments;
};

onMounted(() => {
  if (leftColumnTab.value === 'address') {
    initMap();
  }
});

watch(leftColumnTab, (newTab) => {
  if (newTab === 'address' && !map.value) {
    nextTick(() => {
      initMap();
    });
  }
});

import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';

const zoom = ref(13);
const center = ref([formData.value.location.lat, formData.value.location.lng]); // الرياض
const markerPosition = ref([formData.value.location.lat, formData.value.location.lng]);
const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const isLoaded = ref(false);

onMounted(() => {
  isLoaded.value = true;
});

const Regions = ref([]);

const gitRegions = async () => {
  try {
    const response = await apiClient.get(`/Regions`);
    Regions.value = response.data.data;
    console.log(Regions.value);
  } catch (err) {
    handleError(err);
  }
};
</script>

<template>
  <Dialog closable :close-on-click-outside="true" :modal="true" v-model:visible="props.show" class="flex justify-content-center" style="width: 100vw; max-width: 80%" :header="$t(`Customer.Customer_Details`)" @update:visible="$emit('close')">
    <form @submit.prevent="handleSubmit" class="flex-1 overflow-hidden relative pb-8">
      <TabView>
        <TabPanel header="Customer Info">
          <div v-if="show" style="height: 500px" class="inset-0 flex pt-5 justify-content-center z-5">
            <div class="surface-card border-round-xl w-full max-w-7xl max-h-90vh flex flex-column">
              <!-- Single column layout -->
              <div class="h-full flex flex-column">
                <!-- Tab Content - Scrollable -->
                <div class="flex-1 overflow-y-auto px-6">
                  <!-- Basic Information -->
                  <div v-show="leftColumnTab === 'basic'" class="flex flex-column gap-4">
                    <div>
                      <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Customer_Name`) }}</label>
                      <input v-model="formData.name" type="text" required :disabled="readOnly" class="w-full p-inputtext" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Mobile_Number`) }}</label>
                      <input v-model="formData.mobile" type="tel" required :disabled="readOnly" class="w-full p-inputtext" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Email`) }}</label>
                      <input v-model="formData.email" type="email" :disabled="readOnly" class="w-full p-inputtext" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Business">
          <div v-if="show" style="height: 500px" class="inset-0 flex pt-5 justify-content-center z-5">
            <div class="surface-card border-round-xl w-full max-w-7xl max-h-90vh flex flex-column">
              <!-- Single column layout -->
              <div class="h-full flex flex-column">
                <!-- Tab Content - Scrollable -->
                <div class="flex-1 overflow-y-auto px-6">
                  <!-- Business Information -->
                  <div v-show="leftColumnTab === 'business'" class="flex flex-column gap-4">
                    <div>
                      <label class="block text-sm font-medium text-700 mb-1">CR </label>
                      <input v-model="formData.cr" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-700 mb-1">VAT </label>
                      <input v-model="formData.vat" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                    </div>

                    {{ selectedRegion.regionCode }}

                    <Dropdown @click="gitRegions" v-model="selectedRegion" :options="Regions" optionLabel="name" placeholder="Select a City" class="w-full md:w-14rem">
                      <template #option="slotProps">
                        {{ slotProps.option.name }}
                      </template>
                    </Dropdown>

                    <!-- <Dropdown @click="gitRegions" v-model="selectedCity" :options="cities" optionLabel="name" placeholder="Select a City" class="w-full md:w-14rem" /> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Bank">
          <div v-if="show" style="height: 500px" class="inset-0 flex pt-5 justify-content-center z-5">
            <div class="surface-card border-round-xl w-full max-w-7xl max-h-90vh flex flex-column">
              <!-- Single column layout -->
              <div class="h-full flex flex-column">
                <!-- Tab Content - Scrollable -->
                <div class="flex-1 overflow-y-auto px-6">
                  <!-- Financial Information -->
                  <div v-show="leftColumnTab === 'financial'" class="flex flex-column gap-4 mt-2">
                    <!-- Bank Information -->
                    <div class="surface-100 p-4 border-round-lg flex flex-column gap-4">
                      <h4 class="font-medium text-900">{{ $t(`Customer.Bank_Information`) }}</h4>
                      <div class="grid">
                        <div class="col-12 md:col-6">
                          <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Bank_Name`) }} </label>
                          <input v-model="formData.bankName" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                        </div>
                        <div class="col-12 md:col-6">
                          <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Account_Number`) }}</label>
                          <input v-model="formData.bankAccount" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                        </div>
                        <div class="col-12 md:col-6">
                          <label class="block text-sm font-medium text-700 mb-1">IBAN</label>
                          <input v-model="formData.iban" type="text" :disabled="readOnly" class="w-full p-inputtext" placeholder="SA..." />
                        </div>

                        <div class="col-12 md:col-6">
                          <label class="block text-sm font-medium text-700 mb-1">SWIFT Code</label>
                          <input v-model="formData.swiftCode" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Address">
          <div v-if="show" style="height: 500px" class="inset-0 flex pt-5 justify-content-center z-5">
            <div class="surface-card border-round-xl w-full max-w-7xl max-h-90vh flex flex-column">
              <!-- Single column layout -->
              <div class="h-full flex flex-column">
                <div class="flex-1 overflow-y-auto px-6">
                  <!-- Address Information -->
                  <div class="flex flex-column gap-6">
                    <!-- Map View -->

                    <div class="h-300px border-round-lg border-1 surface-border overflow-hidden relative">
                      <!-- <div ref="mapRef" class="w-full h-full"></div> -->
                      <div>
                        <l-map v-if="isLoaded" v-model:zoom="zoom" v-model:center="center" style="height: 400px; width: 100%">
                          <l-tile-layer :url="tileLayerUrl"></l-tile-layer>

                          <l-marker :lat-lng="markerPosition"></l-marker>
                        </l-map>
                      </div>

                      <!-- Search Results Dropdown -->
                      <div v-if="!readOnly && searchResults.length > 0" class="absolute top-4rem left-3rem w-20rem surface-card border-round-lg shadow-5 border-1 surface-border z-5 max-h-12rem overflow-y-auto">
                        <div v-for="result in searchResults" :key="result.place_id" class="p-2 hover:surface-100 cursor-pointer" @click="selectSearchResult(result)">
                          <div class="font-medium text-900">{{ result.display_name }}</div>
                          <div class="text-xs text-600">{{ result.type }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Location Error -->
                    <div v-if="locationError" class="text-red-600 text-sm">
                      {{ locationError }}
                    </div>

                    <!-- Location Info -->
                    <div class="grid">
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Latitude`) }}</label>
                        <input v-model="formData.location.lat" type="number" step="0.000001" class="w-full p-inputtext" readonly />
                      </div>
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Longitude`) }}</label>
                        <input v-model="formData.location.lng" type="number" step="0.000001" class="w-full p-inputtext" readonly />
                      </div>
                    </div>

                    <!-- Address Fields -->
                    <div class="grid">
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Building_Number`) }}</label>
                        <input v-model="formData.buildingNumber" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                      </div>
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Street_Name`) }}</label>
                        <input v-model="formData.streetName" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                      </div>
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.District`) }}</label>
                        <input v-model="formData.district" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                      </div>
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.City`) }}</label>
                        <input v-model="formData.city" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                      </div>
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Postal_Code`) }}</label>
                        <input v-model="formData.postalCode" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                      </div>
                      <div class="col-12 md:col-6">
                        <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Additional_Number`) }}</label>
                        <input v-model="formData.additionalNumber" type="text" :disabled="readOnly" class="w-full p-inputtext" />
                      </div>
                    </div>

                    <!-- Current Location Button -->
                    <div v-if="!readOnly" class="flex justify-content-end pb-5">
                      <button type="button" @click="getCurrentLocation" class="p-button p-button-primary">
                        <i class="pi pi-map-marker mr-2"></i>
                        {{ $t(`Customer.Get_Current_Location`) }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Attachment">
          <div v-if="show" style="height: 500px" class="inset-0 flex pt-5 justify-content-center z-5">
            <div class="surface-card border-round-xl w-full max-w-7xl max-h-90vh flex flex-column">
              <!-- Single column layout -->
              <div class="h-full flex flex-column">
                <div class="flex-1 overflow-y-auto px-6">
                  <!-- Documents -->
                  <div>
                    <CustomerAttachmentsNew :customer-id="customer?.id || 'new'" :read-only="readOnly" v-model="attachments" />
                  </div>

                  <!-- Notes -->
                  <div v-show="leftColumnTab === 'notes'" class="flex flex-column gap-4">
                    <h3 class="text-lg font-medium text-900">{{ $t(`Customer.Additional_Notes`) }}</h3>
                    <textarea v-model="formData.notes" rows="4" :disabled="readOnly" class="w-full p-inputtextarea" :placeholder="$t(`Customer.Add_any_additional_notes`)"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Financial info">
          <div v-if="show" style="height: 500px" class="inset-0 flex pt-5 justify-content-center z-5">
            <div class="surface-card border-round-xl w-full max-w-7xl max-h-90vh flex flex-column">
              <!-- Single column layout -->
              <div class="h-full flex flex-column">
                <div class="flex-1 overflow-y-auto px-6">
                  <!-- Credit and Payment Terms -->
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.Credit_Limit`) }} (SAR)</label>
                      <input v-model="formData.creditLimit" type="number" min="0" step="1000" required :disabled="readOnly" class="w-full p-inputtext" />
                    </div>

                    <div class="col-12 md:col-6">
                      <label class="block text-sm font-medium text-700 mb-1"> {{ $t(`Customer.Payment_Terms`) }} </label>
                      <select v-model="formData.paymentTerms" required :disabled="readOnly" class="w-full p-inputtext">
                        <option v-for="term in paymentTermsOptions" :key="term.value" :value="term.value">
                          {{ term.label }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Financial Notes -->
                  <div>
                    <label class="block text-sm font-medium text-700 mb-1">{{ $t(`Customer.FinancialNotes`) }}</label>
                    <textarea v-model="formData.financialNotes" rows="3" :disabled="readOnly" class="w-full p-inputtextarea" :placeholder="$t(`Customer.Add_any_financial_notes_or_special_payment_arrangements`)"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>

      <!-- Form Actions -->
      <div style="width: 94%; bottom: 0; padding: 15px !important; border: 0px" class="bg-white surface-border flex justify-content-end gap-2 fixed">
        <button type="button" @click="$emit('close')" class="p-button p-button-outlined">
          {{ readOnly ? `${$t('Customer.Close')}` : `${$t('Customer.Cancel')}` }}
        </button>

        <button v-if="!readOnly" type="submit" class="p-button p-button-primary">
          {{ customer ? `${$t('Customer.Update_Customer')}` : `${$t('Customer.Create_Customer')}` }}
        </button>
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
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
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-alpha-10);
}

.leaflet-control-fullscreen a {
  background: white;
  color: var(--text-color-secondary);
}

.leaflet-control-fullscreen a:hover {
  background: var(--surface-100);
}

.leaflet-control-layers {
  border: none !important;
  box-shadow: var(--card-shadow) !important;
  border-radius: var(--border-radius) !important;
}

.leaflet-control-layers-toggle {
  width: 34px !important;
  height: 34px !important;
}

.leaflet-touch .leaflet-control-layers-toggle {
  width: 34px !important;
  height: 34px !important;
}
/* 
:deep(.p-dialog .p-dialog-content) {
  height: 500px !important;
} */
</style>
