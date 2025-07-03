<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CustomerAttachmentsNew from './CustomerAttachmentsNew.vue';
import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

const props = defineProps<{
  show: boolean;
  customer?: any;
  readOnly?: boolean;
  action?: string;
}>();

const emit = defineEmits(['close', 'submit']);

// Validation Schema
const validationSchema = yup.object({
  name: yup.string().required('Customer name is required'),
  branchId: yup.string().required('Branch selection is required'),
  Region: yup.string().required('Region selection is required'),
  mobile: yup.string().required('Mobile number is required'),
  email: yup.string().email('Please enter a valid email').nullable().optional(),
  buildingNumber: yup.string()
    .nullable()
    .optional()
    .test('is-number', 'Building number must contain only numbers', function(value) {
      if (!value || value.length === 0) return true;
      return /^\d+$/.test(value);
    }),
  postalCode: yup.string()
    .nullable()
    .optional()
    .test('is-five-digits', 'Postal code must be exactly 5 digits', function(value) {
      if (!value || value.length === 0) return true;
      return /^\d{5}$/.test(value);
    }),
  latitude: yup.number().optional(),
  longitude: yup.number().optional()
});

// Form setup
const { handleSubmit, errors, defineField, resetForm, setValues, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
    branchId: props.customer?.branchId || '',
    name: props.customer?.name || '',
    type: props.customer?.type || 'business',
    mobile: props.customer?.primaryPhone || '',
    email: props.customer?.email || '',
    Region: props.customer?.regionId || '',
    cr: props.customer?.crNumber || '',
    vat: props.customer?.vatNumber || '',
    creditLimit: props.customer?.creditLimit || 0,
    paymentTerm: props.customer?.paymentTerm || '75',
    bankName: props.customer?.bankName || '',
    bankAccount: props.customer?.accountNumber || '',
    iban: props.customer?.iban || '',
    swiftCode: props.customer?.swiftCode || '',
    financialNotes: props.customer?.financeNotes || '',
    buildingNumber: props.customer?.buildingNumber || '',
    streetName: props.customer?.streetName || '',
    district: props.customer?.district || '',
    city: props.customer?.city || '',
    postalCode: props.customer?.postalCode || '',
    additionalNumber: props.customer?.additionalNumber || '',
    notes: props.customer?.additionalNotes || '',
    latitude: props.customer?.latitude || 24.7136,
    longitude: props.customer?.altitude || 46.6753
  }
});

// Define form fields
const [branchId, branchIdAttrs] = defineField('branchId');
const [name, nameAttrs] = defineField('name');
const [mobile, mobileAttrs] = defineField('mobile');
const [email, emailAttrs] = defineField('email');
const [Region, RegionAttrs] = defineField('Region');
const [cr, crAttrs] = defineField('cr');
const [vat, vatAttrs] = defineField('vat');
const [bankName, bankNameAttrs] = defineField('bankName');
const [bankAccount, bankAccountAttrs] = defineField('bankAccount');
const [iban, ibanAttrs] = defineField('iban');
const [swiftCode, swiftCodeAttrs] = defineField('swiftCode');
const [financialNotes, financialNotesAttrs] = defineField('financialNotes');
const [buildingNumber, buildingNumberAttrs] = defineField('buildingNumber');
const [streetName, streetNameAttrs] = defineField('streetName');
const [district, districtAttrs] = defineField('district');
const [city, cityAttrs] = defineField('city');
const [postalCode, postalCodeAttrs] = defineField('postalCode');
const [additionalNumber, additionalNumberAttrs] = defineField('additionalNumber');
const [notes, notesAttrs] = defineField('notes');
const [latitude, latitudeAttrs] = defineField('latitude');
const [longitude, longitudeAttrs] = defineField('longitude');

// Map configuration
const mapRef = ref<HTMLDivElement | null>(null);
const map = ref<L.Map | null>(null);
const marker = ref<L.Marker | null>(null);
const locationError = ref('');
const mapInitialized = ref(false);

// Customer data
const attachments = ref(props.customer?.attachments || []);
const CustomerLookups = ref({ regions: [], paymentTerms: [], branches: [] });

// Tab state
const activeTab = ref(0);

// Initialize Leaflet icons
const initializeLeafletIcons = () => {
  // Fix for default markers in Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Initialize map
const initializeMap = async () => {
  if (!mapRef.value || mapInitialized.value || props.readOnly) return;

  try {
    await nextTick();
    
    // Initialize Leaflet icons
    initializeLeafletIcons();

    // Create map
    map.value = L.map(mapRef.value, {
      center: [latitude.value as number, longitude.value as number],
      zoom: 13,
      zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.value);

    // Add marker
    marker.value = L.marker([latitude.value as number, longitude.value as number], {
      draggable: !props.readOnly
    }).addTo(map.value);

    // Map click event
    map.value.on('click', onMapClick);

    // Marker drag event
    if (marker.value && !props.readOnly) {
      marker.value.on('dragend', onMarkerDrag);
    }

    mapInitialized.value = true;
    console.log('Map initialized successfully');

  } catch (error) {
    console.error('Error initializing map:', error);
    locationError.value = 'Failed to initialize map';
  }
};

// Map click handler
const onMapClick = async (event: L.LeafEvent) => {
  if (props.readOnly) return;

  const { lat, lng } = (event as L.LocationEvent).latlng;
  updateMapPosition(lat, lng);
  await reverseGeocode(lat, lng);
};

// Marker drag handler
const onMarkerDrag = async (event: L.DragEndEvent) => {
  if (props.readOnly) return;

  const { lat, lng } = event.target.getLatLng();
  updateMapPosition(lat, lng, false);
  await reverseGeocode(lat, lng);
};

// Update map position
const updateMapPosition = (lat: number, lng: number, updateView = true) => {
  // Update form coordinates
  setFieldValue('latitude', lat);
  setFieldValue('longitude', lng);

  // Update marker position
  if (marker.value) {
    marker.value.setLatLng([lat, lng]);
  }

  // Update map view
  if (map.value && updateView) {
    map.value.setView([lat, lng], map.value.getZoom());
  }
};

// Reverse geocode
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CustomerManagementApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    if (data.address) {
      // Update form fields with geocoded data
      if (data.address.house_number) {
        setFieldValue('buildingNumber', data.address.house_number);
      }
      if (data.address.road) {
        setFieldValue('streetName', data.address.road);
      }
      if (data.address.suburb || data.address.neighbourhood) {
        setFieldValue('district', data.address.suburb || data.address.neighbourhood);
      }
      if (data.address.city || data.address.town) {
        setFieldValue('city', data.address.city || data.address.town);
      }
      if (data.address.postcode) {
        setFieldValue('postalCode', data.address.postcode.slice(0, 5));
      }
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    locationError.value = 'Failed to get address details';
    setTimeout(() => { locationError.value = ''; }, 3000);
  }
};

// Get current location
const getCurrentLocation = () => {
  if (props.readOnly) return;
  
  locationError.value = '';
  
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by this browser';
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      updateMapPosition(lat, lng);
      
      // Update map zoom for current location
      if (map.value) {
        map.value.setView([lat, lng], 16);
      }
      
      await reverseGeocode(lat, lng);
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = 'Location access was denied';
          break;
        case error.POSITION_UNAVAILABLE:
          locationError.value = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          locationError.value = 'Location request timed out';
          break;
        default:
          locationError.value = 'An unknown error occurred';
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000 // 10 minutes
    }
  );
};

// Watch for coordinate changes to update map
watch([latitude, longitude], ([newLat, newLng]) => {
  if (map.value && marker.value && newLat && newLng) {
    const currentMarkerPos = marker.value.getLatLng();
    
    // Only update if coordinates actually changed
    if (Math.abs(currentMarkerPos.lat - newLat) > 0.000001 || 
        Math.abs(currentMarkerPos.lng - newLng) > 0.000001) {
      marker.value.setLatLng([newLat, newLng]);
      map.value.setView([newLat, newLng], map.value.getZoom());
    }
  }
});

// Watch for active tab changes
watch(activeTab, async (newTab) => {
  if (newTab === 3 && !mapInitialized.value) { // Address tab
    await nextTick();
    setTimeout(initializeMap, 100); // Small delay to ensure DOM is ready
  }
});

// Initialize on mount
onMounted(() => {
  getCustomerLookups();
});

// Cleanup on unmount
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
    mapInitialized.value = false;
  }
});

// Get customer lookups
const getCustomerLookups = async () => {
  try {
    const response = await apiClient.get(`/Customers/GetCustomerLookups`);
    CustomerLookups.value = response.data.data;
  } catch (err) {
    handleError(err);
  }
};

// Form submission
const onSubmit = handleSubmit((values) => {
  if (props.readOnly) return;
  
  const formData = {
    id: props.customer?.id,
    ...values,
    latitude: latitude.value,
    altitude: longitude.value, // Note: API expects 'altitude' for longitude
    attachments: attachments.value,
    location: {
      lat: latitude.value,
      lng: longitude.value
    }
  };
  
  console.log('Form Data:', formData);
  emit('submit', formData);
});

// Helper function to get error message
const getErrorMessage = (fieldName: string) => {
  return errors.value[fieldName];
};

// Helper function to check if field has error
const hasError = (fieldName: string) => {
  return !!errors.value[fieldName];
};

const tabs = [
  { label: 'Basic Info', icon: 'pi pi-user' },
  { label: 'Business', icon: 'pi pi-building' },
  { label: 'Banking', icon: 'pi pi-credit-card' },
  { label: 'Address', icon: 'pi pi-map-marker' },
  { label: 'Attachments', icon: 'pi pi-paperclip' },
  { label: 'Financial', icon: 'pi pi-dollar' }
];
</script>

<template>
  <Dialog 
    v-model:visible="props.show" 
    :header="$t('Customer.Customer_Details')"
    :modal="true"
    :closable="true"
    :draggable="false"
    class="customer-dialog"
    style="width: 90vw; max-width: 1200px;"
    @update:visible="$emit('close')"
  >
    <form @submit.prevent="onSubmit" class="customer-form">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <div class="tab-buttons">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            type="button"
            class="tab-button"
            :class="{ active: activeTab === index }"
            @click="activeTab = index"
            :disabled="readOnly && index > 3"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Basic Information -->
        <div v-show="activeTab === 0" class="tab-panel">
          <div class="form-section">
            <h3 class="section-title">
              <i class="pi pi-user"></i>
              Basic Information
            </h3>
            
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label required">Branch</label>
                <Dropdown
                  v-model="branchId"
                  v-bind="branchIdAttrs"
                  :options="CustomerLookups.branches"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Branch"
                  :class="{ 'p-invalid': hasError('branchId') }"
                  :disabled="readOnly"
                />
                <small v-if="hasError('branchId')" class="error-message">
                  {{ getErrorMessage('branchId') }}
                </small>
              </div>

              <div class="form-field">
                <label class="field-label required">Customer Name</label>
                <InputText
                  v-model="name"
                  v-bind="nameAttrs"
                  :class="{ 'p-invalid': hasError('name') }"
                  :disabled="readOnly"
                  placeholder="Enter customer name"
                />
                <small v-if="hasError('name')" class="error-message">
                  {{ getErrorMessage('name') }}
                </small>
              </div>

              <div class="form-field">
                <label class="field-label required">Mobile Number</label>
                <InputText
                  v-model="mobile"
                  v-bind="mobileAttrs"
                  :class="{ 'p-invalid': hasError('mobile') }"
                  :disabled="readOnly"
                  placeholder="Enter mobile number"
                />
                <small v-if="hasError('mobile')" class="error-message">
                  {{ getErrorMessage('mobile') }}
                </small>
              </div>

              <div class="form-field">
                <label class="field-label">Email</label>
                <InputText
                  v-model="email"
                  v-bind="emailAttrs"
                  type="email"
                  :class="{ 'p-invalid': hasError('email') }"
                  :disabled="readOnly"
                  placeholder="Enter email address"
                />
                <small v-if="hasError('email')" class="error-message">
                  {{ getErrorMessage('email') }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Business Information -->
        <div v-show="activeTab === 1" class="tab-panel">
          <div class="form-section">
            <h3 class="section-title">
              <i class="pi pi-building"></i>
              Business Information
            </h3>
            
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">CR Number</label>
                <InputText
                  v-model="cr"
                  v-bind="crAttrs"
                  :disabled="readOnly"
                  placeholder="Enter CR number"
                />
              </div>

              <div class="form-field">
                <label class="field-label">VAT Number</label>
                <InputText
                  v-model="vat"
                  v-bind="vatAttrs"
                  :disabled="readOnly"
                  placeholder="Enter VAT number"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Banking Information -->
        <div v-show="activeTab === 2" class="tab-panel">
          <div class="form-section">
            <h3 class="section-title">
              <i class="pi pi-credit-card"></i>
              Banking Information
            </h3>
            
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">Bank Name</label>
                <InputText
                  v-model="bankName"
                  v-bind="bankNameAttrs"
                  :disabled="readOnly"
                  placeholder="Enter bank name"
                />
              </div>

              <div class="form-field">
                <label class="field-label">Account Number</label>
                <InputText
                  v-model="bankAccount"
                  v-bind="bankAccountAttrs"
                  :disabled="readOnly"
                  placeholder="Enter account number"
                />
              </div>

              <div class="form-field">
                <label class="field-label">IBAN</label>
                <InputText
                  v-model="iban"
                  v-bind="ibanAttrs"
                  :disabled="readOnly"
                  placeholder="SA..."
                />
              </div>

              <div class="form-field">
                <label class="field-label">SWIFT Code</label>
                <InputText
                  v-model="swiftCode"
                  v-bind="swiftCodeAttrs"
                  :disabled="readOnly"
                  placeholder="Enter SWIFT code"
                />
              </div>

              <div class="form-field full-width">
                <label class="field-label">Financial Notes</label>
                <Textarea
                  v-model="financialNotes"
                  v-bind="financialNotesAttrs"
                  :disabled="readOnly"
                  rows="3"
                  placeholder="Add financial notes..."
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div v-show="activeTab === 3" class="tab-panel">
          <div class="form-section">
            <h3 class="section-title">
              <i class="pi pi-map-marker"></i>
              Address Information
            </h3>

            <!-- Region Selection -->
            <div class="form-field">
              <label class="field-label required">Region</label>
              <Dropdown
                v-model="Region"
                v-bind="RegionAttrs"
                :options="CustomerLookups.regions"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Region"
                :class="{ 'p-invalid': hasError('Region') }"
                :disabled="readOnly"
              />
              <small v-if="hasError('Region')" class="error-message">
                {{ getErrorMessage('Region') }}
              </small>
            </div>

            <!-- Map Section -->
            <div class="map-section">
              <div class="map-controls">
                <Button
                  type="button"
                  icon="pi pi-map-marker"
                  label="Get Current Location"
                  @click="getCurrentLocation"
                  :disabled="readOnly"
                  class="location-button"
                />
              </div>

              <!-- Location Error -->
              <Message v-if="locationError" severity="error" :closable="false" class="mb-3">
                {{ locationError }}
              </Message>

              <!-- Map Container -->
              <div class="map-container">
                <div 
                  ref="mapRef" 
                  class="leaflet-map"
                  style="height: 350px; width: 100%;"
                />
              </div>

              <!-- Coordinates Display -->
              <div class="coordinates">
                <div class="coordinate-field">
                  <label>Latitude:</label>
                  <span>{{ Number(latitude).toFixed(6) }}</span>
                </div>
                <div class="coordinate-field">
                  <label>Longitude:</label>
                  <span>{{ Number(longitude).toFixed(6) }}</span>
                </div>
                <div class="coordinate-field" v-if="mapInitialized">
                  <label>Status:</label>
                  <span class="status-active">Map Active</span>
                </div>
              </div>
            </div>

            <!-- Address Fields -->
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">Building Number</label>
                <InputText
                  v-model="buildingNumber"
                  v-bind="buildingNumberAttrs"
                  :class="{ 'p-invalid': hasError('buildingNumber') }"
                  :disabled="readOnly"
                  placeholder="Building number"
                />
                <small v-if="hasError('buildingNumber')" class="error-message">
                  {{ getErrorMessage('buildingNumber') }}
                </small>
              </div>

              <div class="form-field">
                <label class="field-label">Street Name</label>
                <InputText
                  v-model="streetName"
                  v-bind="streetNameAttrs"
                  :disabled="readOnly"
                  placeholder="Street name"
                />
              </div>

              <div class="form-field">
                <label class="field-label">District</label>
                <InputText
                  v-model="district"
                  v-bind="districtAttrs"
                  :disabled="readOnly"
                  placeholder="District"
                />
              </div>

              <div class="form-field">
                <label class="field-label">City</label>
                <InputText
                  v-model="city"
                  v-bind="cityAttrs"
                  :disabled="readOnly"
                  placeholder="City"
                />
              </div>

              <div class="form-field">
                <label class="field-label">Postal Code</label>
                <InputText
                  v-model="postalCode"
                  v-bind="postalCodeAttrs"
                  :class="{ 'p-invalid': hasError('postalCode') }"
                  :disabled="readOnly"
                  placeholder="12345"
                  maxlength="5"
                />
                <small v-if="hasError('postalCode')" class="error-message">
                  {{ getErrorMessage('postalCode') }}
                </small>
              </div>

              <div class="form-field">
                <label class="field-label">Additional Number</label>
                <InputText
                  v-model="additionalNumber"
                  v-bind="additionalNumberAttrs"
                  :disabled="readOnly"
                  placeholder="Additional number"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div v-show="activeTab === 4" class="tab-panel">
          <div class="form-section">
            <h3 class="section-title">
              <i class="pi pi-paperclip"></i>
              Documents & Attachments
            </h3>
            
            <CustomerAttachmentsNew
              :customer-id="customer?.id || 'new'"
              :read-only="readOnly"
              v-model="attachments"
            />

            <div class="form-field">
              <label class="field-label">Additional Notes</label>
              <Textarea
                v-model="notes"
                v-bind="notesAttrs"
                :disabled="readOnly"
                rows="4"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
        </div>

        <!-- Financial Information -->
        <div v-show="activeTab === 5" class="tab-panel">
          <div class="form-section">
            <h3 class="section-title">
              <i class="pi pi-dollar"></i>
              Financial Information
            </h3>
            
            <div class="form-grid">
              <!-- Add financial fields as needed -->
              <div class="form-field full-width">
                <label class="field-label">Financial Notes</label>
                <Textarea
                  v-model="financialNotes"
                  v-bind="financialNotesAttrs"
                  :disabled="readOnly"
                  rows="3"
                  placeholder="Add financial notes or special arrangements..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="$emit('close')"
        />
        <Button
          v-if="!readOnly"
          type="submit"
          :label="customer ? 'Update Customer' : 'Create Customer'"
          icon="pi pi-save"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
.customer-dialog {
  --primary-color: #3b82f6;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 80vh;
}

/* Tab Navigation */
.tab-navigation {
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.tab-buttons {
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 1rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: var(--border-radius);
  white-space: nowrap;
  transition: all 0.2s ease;
  font-weight: 500;
}

.tab-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab-button.active {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--box-shadow);
}

.tab-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tab Content */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Form Sections */
.form-section {
  background: #f9fafb;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.field-label.required::after {
  content: ' *';
  color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Map Section */
.map-section {
  margin: 1.5rem 0;
}

.map-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.location-button {
  white-space: nowrap;
}

.map-container {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.leaflet-map {
  border-radius: var(--border-radius);
}

.coordinates {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.coordinate-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coordinate-field label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.coordinate-field span {
  font-family: monospace;
  color: #374151;
}

.status-active {
  color: #10b981 !important;
  font-weight: 600;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tab-buttons {
    justify-content: flex-start;
  }
  
  .tab-button span {
    display: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .coordinates {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* PrimeVue Component Overrides */
:deep(.p-dropdown) {
  width: 100%;
}

:deep(.p-inputtext) {
  width: 100%;
}

:deep(.p-inputtextarea) {
  width: 100%;
  resize: vertical;
}

:deep(.p-button) {
  border-radius: var(--border-radius);
}

:deep(.p-invalid) {
  border-color: #ef4444;
}

/* Leaflet Map Overrides */
:deep(.leaflet-container) {
  font-family: inherit;
  border-radius: var(--border-radius);
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: var(--border-radius);
}

:deep(.leaflet-control-zoom) {
  border-radius: var(--border-radius);
  overflow: hidden;
}

:deep(.leaflet-bar) {
  border-radius: var(--border-radius);
}

:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
  border-radius: 0;
}

:deep(.leaflet-control-zoom-in:first-child) {
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

:deep(.leaflet-control-zoom-out:last-child) {
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}
</style>