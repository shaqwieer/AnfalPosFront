<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  customerId: string
  readOnly?: boolean
}>()

const emit = defineEmits(['update'])

// Document types
const documentTypes = [
  { id: 'cr', name: 'Commercial Registration', required: true, hasExpiry: true },
  { id: 'vat', name: 'VAT Certificate', required: true, hasExpiry: true },
  { id: 'shop', name: 'Shop Pictures', required: false, hasExpiry: false, multiple: true },
  { id: 'planogram', name: 'Planogram', required: false, hasExpiry: true, multiple: true, description: 'Store layout and product placement diagrams' },
  { id: 'other', name: 'Other Documents', required: false, hasExpiry: true, multiple: true }
]

// Document attachments state
const attachments = ref([
  {
    id: 'doc-' + Date.now().toString(36),
    type: 'cr',
    name: 'CR Document.pdf',
    file: null,
    uploadDate: new Date().toISOString(),
    expiryDate: '2025-03-20',
    status: 'valid',
    mimeType: 'application/pdf',
    url: '/sample.pdf'
  }
])

// UI state
const showUploadDialog = ref(false)
const selectedType = ref('')
const selectedFile = ref<File | null>(null)
const expiryDate = ref('')
const documentNotes = ref('')

// Document viewer state
const showViewer = ref(false)
const viewingDocument = ref<any>(null)

// Add preview state
const showPreview = ref(false)
const previewDocument = ref<any>(null)

// Computed properties
const documentsByType = computed(() => {
  const grouped: { [key: string]: typeof attachments.value } = {}
  documentTypes.forEach(type => {
    grouped[type.id] = attachments.value.filter(doc => doc.type === type.id)
  })
  return grouped
})

const expiringDocuments = computed(() => {
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  return attachments.value.filter(doc => {
    if (!doc.expiryDate) return false
    const expiryDate = new Date(doc.expiryDate)
    return expiryDate <= thirtyDaysFromNow
  })
})

// Methods
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    selectedFile.value = input.files[0]
  }
}

const uploadDocument = () => {
  if (!selectedFile.value || !selectedType.value) return

  const newDoc = {
    id: 'doc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
    type: selectedType.value,
    name: selectedFile.value.name,
    file: selectedFile.value,
    uploadDate: new Date().toISOString(),
    expiryDate: expiryDate.value || undefined,
    notes: documentNotes.value,
    status: 'valid',
    mimeType: selectedFile.value.type,
    url: URL.createObjectURL(selectedFile.value)
  }

  attachments.value.push(newDoc)
  resetUploadForm()
  emit('update', attachments.value)
}

const deleteDocument = (docId: string) => {
  attachments.value = attachments.value.filter(doc => doc.id !== docId)
  emit('update', attachments.value)
}

const resetUploadForm = () => {
  showUploadDialog.value = false
  selectedType.value = ''
  selectedFile.value = null
  expiryDate.value = ''
  documentNotes.value = ''
}

const viewDocument = (doc: any) => {
  viewingDocument.value = doc
  showViewer.value = true
}

const closeViewer = () => {
  showViewer.value = false
  viewingDocument.value = null
}

const getDocumentStatus = (doc: any) => {
  if (!doc.expiryDate) return 'valid'
  
  const today = new Date()
  const expiryDate = new Date(doc.expiryDate)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  if (expiryDate < today) return 'expired'
  if (expiryDate <= thirtyDaysFromNow) return 'expiring'
  return 'valid'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'valid': return 'bg-green-100 text-green-800'
    case 'expiring': return 'bg-yellow-100 text-yellow-800'
    case 'expired': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const getRemainingDays = (expiryDate: string) => {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const isImageFile = (mimeType: string) => {
  return mimeType.startsWith('image/')
}

const isPDFFile = (mimeType: string) => {
  return mimeType === 'application/pdf'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Upload Button -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Documents & Attachments</h3>
        <p class="text-sm text-gray-500">Manage customer documents and certifications</p>
      </div>
      <button v-if="!readOnly"
              @click="showUploadDialog = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <span class="material-icons align-middle mr-1">upload_file</span>
        Upload Document
      </button>
    </div>

    <!-- Documents Table -->
    <div class="bg-white rounded-lg border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-for="type in documentTypes" :key="type.id">
              <tr v-if="documentsByType[type.id]?.length">
                <template v-for="doc in documentsByType[type.id]" :key="doc.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="material-icons text-gray-400 mr-2">description</span>
                      <div>
                        <div class="font-medium text-gray-900">{{ type.name }}</div>
                        <div class="text-sm text-gray-500">
                          {{ type.required ? 'Required' : 'Optional' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ doc.name }}</div>
                    <div class="text-xs text-gray-500">{{ doc.notes }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(doc.uploadDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div v-if="doc.expiryDate" 
                         :class="{
                           'text-red-600': getDocumentStatus(doc) === 'expired',
                           'text-yellow-600': getDocumentStatus(doc) === 'expiring',
                           'text-gray-500': getDocumentStatus(doc) === 'valid'
                         }">
                      {{ formatDate(doc.expiryDate) }}
                      <div class="text-xs">
                        <span v-if="getRemainingDays(doc.expiryDate) > 0">
                          {{ getRemainingDays(doc.expiryDate) }} days remaining
                        </span>
                        <span v-else>Expired</span>
                      </div>
                    </div>
                    <div v-else class="text-gray-500">N/A</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span class="px-2 py-1 text-xs rounded-full"
                          :class="getStatusColor(getDocumentStatus(doc))">
                      {{ getDocumentStatus(doc).toUpperCase() }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div class="flex items-center justify-center space-x-2">
                      <button @click.prevent="viewDocument(doc)"
                              class="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                        <span class="material-icons">visibility</span>
                      </button>
                      <button v-if="!readOnly"
                              @click.prevent="deleteDocument(doc.id)"
                              class="p-2 text-red-600 hover:bg-red-50 rounded-full">
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </td>
                </template>
              </tr>
              <!-- Empty Row -->
              <tr v-else>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="material-icons text-gray-400 mr-2">description</span>
                    <div>
                      <div class="font-medium text-gray-900">{{ type.name }}</div>
                      <div class="text-sm text-gray-500">
                        {{ type.required ? 'Required' : 'Optional' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4"></td>
                <td class="px-6 py-4"></td>
                <td class="px-6 py-4"></td>
                <td class="px-6 py-4"></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <button v-if="!readOnly"
                          @click="showUploadDialog = true; selectedType = type.id"
                          class="text-blue-600 hover:text-blue-700">
                    <span class="material-icons">upload_file</span>
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Upload Dialog -->
    <div v-if="showUploadDialog"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div class="bg-white rounded-xl w-full max-w-lg">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-medium">Upload Document</h3>
          <button @click="resetUploadForm" class="p-2 hover:bg-gray-100 rounded-full">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="p-6">
          <form @submit.prevent="uploadDocument" class="space-y-4">
            <!-- Document Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select v-model="selectedType" required class="w-full rounded-lg border">
                <option value="">Select document type</option>
                <option v-for="type in documentTypes"
                        :key="type.id"
                        :value="type.id"
                        :disabled="!type.multiple && documentsByType[type.id]?.length">
                  {{ type.name }}
                </option>
              </select>
            </div>

            <!-- File Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Document File</label>
              <div class="flex items-center space-x-2">
                <input type="file"
                       @change="handleFileSelect"
                       required
                       class="hidden"
                       accept=".pdf,.jpg,.jpeg,.png"
                       id="document-file" />
                <label for="document-file"
                       class="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center">
                  <span class="material-icons mr-2">upload_file</span>
                  {{ selectedFile ? selectedFile.name : 'Choose File' }}
                </label>
                <button v-if="selectedFile"
                        type="button"
                        @click="selectedFile = null"
                        class="p-2 text-red-500 hover:bg-red-50 rounded-full">
                  <span class="material-icons">close</span>
                </button>
              </div>
            </div>

            <!-- Expiry Date -->
            <div v-if="selectedType && documentTypes.find(t => t.id === selectedType)?.hasExpiry">
              <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date"
                     v-model="expiryDate"
                     required
                     class="w-full rounded-lg border"
                     :min="new Date().toISOString().split('T')[0]">
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea v-model="documentNotes"
                        rows="3"
                        class="w-full rounded-lg border"
                        placeholder="Add any notes about this document..."></textarea>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4">
              <button type="button"
                      @click="resetUploadForm"
                      class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Upload Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Document Viewer Dialog -->
    <div v-if="showViewer && viewingDocument"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-medium">Document Preview</h3>
          <button @click="closeViewer" class="p-2 hover:bg-gray-100 rounded-full">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-hidden p-6">
          <!-- Document Preview -->
          <div class="h-full flex flex-col">
            <!-- Preview Header -->
            <div class="mb-4">
              <h4 class="font-medium">{{ viewingDocument.name }}</h4>
              <p class="text-sm text-gray-500">
                Uploaded on {{ formatDate(viewingDocument.uploadDate) }}
              </p>
            </div>

            <!-- Preview Content -->
            <div class="flex-1 bg-gray-100 rounded-lg overflow-hidden">
              <!-- Image Preview -->
              <img v-if="isImageFile(viewingDocument.mimeType)"
                   :src="viewingDocument.url"
                   class="max-w-full h-auto mx-auto"
                   alt="Document preview">
              
              <!-- PDF Preview -->
              <iframe v-else-if="isPDFFile(viewingDocument.mimeType)"
                      :src="viewingDocument.url"
                      class="w-full h-full"
                      type="application/pdf">
              </iframe>

              <!-- Fallback Preview -->
              <div v-else class="h-full flex items-center justify-center text-gray-500">
                <div class="text-center">
                  <span class="material-icons text-6xl mb-2">description</span>
                  <p>Preview not available</p>
                  <p class="text-sm">Download to view this document</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t flex justify-end space-x-3">
          <button @click="closeViewer"
                  class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Close
          </button>
          <a :href="viewingDocument.url"
             download
             class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <span class="material-icons align-middle mr-1">download</span>
            Download
          </a>
        </div>
      </div>
    </div>
  </div>
</template>