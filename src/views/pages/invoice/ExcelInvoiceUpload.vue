<!-- src/views/pages/invoice/ExcelInvoiceUpload.vue -->
<template>
  <div class="p-6">
    <div class="flex flex-column row-gap-5 px-3 lg:flex-row justify-content-between mb-5 lg:mb-0">
      <div class="lg:col-8 px-0 pt-2">
        <h3 class="text-700 text-3xl font-semibold">Invoice Excel Upload</h3>
        <p class="text-500 text-lg">Upload Excel files with invoice data for batch processing.</p>
      </div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-6">
        <Card class="mb-4">
          <template #content>
            <div class="flex flex-column gap-3">
              <div
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onDrop"
                :class="['border-2 border-dashed p-5 border-round-lg flex flex-column align-items-center justify-content-center gap-3', isDragging ? 'surface-hover border-primary' : 'surface-ground']"
                style="min-height: 250px"
              >
                <i class="pi pi-file-excel text-5xl text-primary"></i>
                <h3 class="m-0 font-semibold">Drag & Drop your Excel file here</h3>
                <p class="m-0 text-color-secondary">or</p>
                <input type="file" ref="fileInput" accept=".xlsx, .xls" class="hidden" @change="onFileSelected" />
                <Button @click="browseFiles" label="Browse Files" icon="pi pi-upload" class="p-button-outlined" />
              </div>

              <div class="field">
                <label for="batchNote" class="font-medium">Batch Note</label>
                <Textarea id="batchNote" v-model="batchNote" rows="3" placeholder="Enter any notes for this batch upload" class="w-full" />
              </div>

              <Button label="Upload Invoices" icon="pi pi-check" class="w-full" :disabled="!selectedFile || uploading" :loading="uploading" @click="uploadFile" />
            </div>
          </template>
        </Card>

        <!-- Template Info -->
        <Card class="mb-4">
          <template #header>
            <div class="flex align-items-center gap-2 px-3 py-2">
              <i class="pi pi-info-circle text-primary"></i>
              <h4 class="m-0">Excel Template Information</h4>
            </div>
          </template>
          <template #content>
            <p class="mb-3">Your Excel file should contain the following columns:</p>
            <DataTable :value="templateColumns" responsiveLayout="scroll" class="p-datatable-sm">
              <Column field="name" header="Column Name"></Column>
              <Column field="description" header="Description"></Column>
            </DataTable>
            <div class="flex justify-content-end mt-3">
              <Button label="Download Template" icon="pi pi-download" class="p-button-outlined p-button-sm" @click="downloadTemplate" />
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 lg:col-6">
        <Card v-if="selectedFile">
          <template #header>
            <div class="flex align-items-center gap-2 px-3 py-2">
              <i class="pi pi-file text-primary"></i>
              <h4 class="m-0">{{ selectedFile.name }}</h4>
            </div>
          </template>
          <template #content>
            <div class="flex align-items-center gap-2 mb-3">
              <i class="pi pi-file-excel text-green-500"></i>
              <span class="font-medium">{{ formatFileSize(selectedFile.size) }}</span>
              <Button icon="pi pi-times" class="p-button-rounded p-button-text p-button-sm ml-auto" @click="clearSelectedFile" />
            </div>

            <div v-if="filePreviewLoading" class="flex flex-column align-items-center gap-2 py-3">
              <ProgressSpinner style="width: 50px; height: 50px" />
              <span>Parsing file preview...</span>
            </div>

            <div v-else-if="previewData.length" class="preview-container">
              <h5>File Preview</h5>
              <DataTable :value="previewData" responsiveLayout="scroll" class="p-datatable-sm" :rows="5" :scrollable="true" scrollHeight="350px">
                <Column v-for="col in previewHeaders" :key="col" :field="col" :header="col"></Column>
              </DataTable>
            </div>

            <div v-else-if="previewError" class="p-4 border-round bg-red-50 text-red-700 mb-3">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-exclamation-circle"></i>
                <span class="font-medium">Error parsing file:</span>
              </div>
              <p class="m-0 mt-2">{{ previewError }}</p>
            </div>
          </template>
        </Card>

        <Card v-if="uploadResults.length > 0">
          <template #header>
            <div class="flex align-items-center gap-2 px-3 py-2">
              <i class="pi pi-history text-primary"></i>
              <h4 class="m-0">Recent Uploads</h4>
            </div>
          </template>
          <template #content>
            <DataTable :value="uploadResults" responsiveLayout="scroll" class="p-datatable-sm">
              <Column field="invoiceUplaodingNote" header="Notes">
                <template #body="slotProps">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-file-excel text-green-500"></i>
                    <span>{{ slotProps.data.invoiceUplaodingNote }}</span>
                  </div>
                </template>
              </Column>
              <Column field="numberOfInvoices" header="Number Of Invoices"></Column>
              <!-- <Column field="status" header="Status">
                <template #body="slotProps">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': slotProps.data.status === 'success',
                      'bg-red-100 text-red-800': slotProps.data.status === 'error'
                    }"
                    class="px-2 py-1 border-round text-xs"
                  >
                    {{ slotProps.data.status === 'success' ? 'Success' : 'Error' }}
                  </span>
                </template>
              </Column> -->
            </DataTable>
          </template>
        </Card>
      </div>
    </div>

    <Dialog v-model:visible="showUploadResult" :modal="true" class="p-fluid" :style="{ width: '450px' }">
      <template #header>
        <div class="flex align-items-center gap-2">
          <i
            :class="{
              'pi pi-check-circle text-green-500': lastUploadStatus === 'success',
              'pi pi-times-circle text-red-500': lastUploadStatus === 'error'
            }"
            style="font-size: 1.5rem"
          ></i>
          <span class="font-bold text-lg">
            {{ lastUploadStatus === 'success' ? 'Upload Successful' : 'Upload Failed' }}
          </span>
        </div>
      </template>
      <div class="mt-3">
        <p v-if="lastUploadStatus === 'success'">Your file has been successfully uploaded and is being processed.</p>
        <p v-else>There was an error uploading your file. Please try again or contact support if the problem persists.</p>
        <p class="font-medium mt-3" v-if="lastUploadMessage">{{ lastUploadMessage }}</p>
      </div>
      <template #footer>
        <Button label="OK" @click="showUploadResult = false" class="p-button-sm" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import * as XLSX from 'xlsx';

import apiClient from '@/api/apiClient';
import { handleError } from '@/utilities/errorHandler';
import { useMainStore } from '@/stores/mainStore';
import { useInvoiceExcelStore } from '@/stores/invoiceExcelStore';


const mainStore = useMainStore();
const invoiceExcelStore = useInvoiceExcelStore();

const fileInput = ref(null);
const selectedFile = ref(null);
const batchNote = ref('');
const isDragging = ref(false);
const uploading = ref(false);
const previewData = ref([]);
const previewHeaders = ref([]);
const filePreviewLoading = ref(false);
const previewError = ref('');
const uploadResults = computed(()=>invoiceExcelStore.uploadHistory);
const showUploadResult = ref(false);
const lastUploadStatus = ref('');
const lastUploadMessage = ref('');

const templateColumns = [
  { name: 'FI Doc', description: 'Financial document number' },
  { name: 'SAP Customer Code', description: 'Customer code in SAP system' },
  { name: 'Invoice Date', description: 'Date the invoice was issued' },
  { name: 'Total Amount', description: 'Total invoice amount' },
  { name: 'Paid Amount', description: 'Amount already paid' },
  { name: 'Remaining Amount', description: 'Outstanding balance' },
  { name: 'Customer Name', description: 'Name of the customer' },
  { name: 'Due Date', description: 'Date when payment is due' },
  { name: 'Payment Term(SAP Code)', description: 'Payment term code from SAP' }
];

const browseFiles = () => {
  fileInput.value.click();
};

const onDragOver = (event) => {
  isDragging.value = true;
};

const onDragLeave = (event) => {
  isDragging.value = false;
};

const onDrop = (event) => {
  isDragging.value = false;

  if (event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    if (isValidExcelFile(file)) {
      handleFile(file);
    } else {
      previewError.value = 'Please upload a valid Excel file (.xlsx or .xls)';
    }
  }
};

const onFileSelected = (event) => {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    if (isValidExcelFile(file)) {
      handleFile(file);
    } else {
      previewError.value = 'Please upload a valid Excel file (.xlsx or .xls)';
    }
  }
};

const isValidExcelFile = (file) => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some((ext) => fileName.endsWith(ext));
};

const handleFile = async (file) => {
  selectedFile.value = file;
  previewData.value = [];
  previewHeaders.value = [];
  previewError.value = '';
  filePreviewLoading.value = true;

  try {
    // Read and parse Excel file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          previewHeaders.value = jsonData[0];
          previewData.value = jsonData.slice(1, 10).map((row) => {
            const rowData = {};
            previewHeaders.value.forEach((header, index) => {
              rowData[header] = row[index] || '';
            });
            return rowData;
          });
        } else {
          previewError.value = 'The file appears to be empty.';
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        previewError.value = 'Failed to parse the Excel file. Please check the file format.';
      } finally {
        filePreviewLoading.value = false;
      }
    };

    reader.onerror = () => {
      previewError.value = 'Error reading the file.';
      filePreviewLoading.value = false;
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error handling file:', error);
    previewError.value = 'Error processing the file.';
    filePreviewLoading.value = false;
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('File', selectedFile.value);
    formData.append('BatchNote', batchNote.value);

    const response = await apiClient.post('/InvoiceExcelUpload/ImportInvoices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    await invoiceExcelStore.getUploadHistory()
    // Add to upload results
    // uploadResults.value.unshift({
    //   filename: selectedFile.value.name,
    //   date: new Date().toLocaleString(),
    //   status: 'success'
    // });

    // Show success message
    lastUploadStatus.value = 'success';
    lastUploadMessage.value = response.data?.message || 'File uploaded successfully.';
    showUploadResult.value = true;

    // Clear form
    clearSelectedFile();
    batchNote.value = '';
  } catch (err) {
    // Add to upload results
    // uploadResults.value.unshift({
    //   filename: selectedFile.value.name,
    //   date: new Date().toLocaleString(),
    //   status: 'error'
    // });

    // Show error message
    lastUploadStatus.value = 'error';
    lastUploadMessage.value = err.response?.data?.message || 'Failed to upload the file.';
    showUploadResult.value = true;

    handleError(err, mainStore.loading);
  } finally {
    uploading.value = false;
  }
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  previewData.value = [];
  previewHeaders.value = [];
  previewError.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const downloadTemplate = () => {
  // Create a template workbook based on the required columns
  const worksheet = XLSX.utils.aoa_to_sheet([
    templateColumns.map((col) => col.name),
    // Add a sample row
    ['FI-123456', 'CUST001', '2025-04-01', '1000.00', '500.00', '500.00', 'ABC Company', '2025-05-01', 'PT30']
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice Template');

  // Generate the file
  XLSX.writeFile(workbook, 'invoice_upload_template.xlsx');
};

// Load any previously uploaded files (this would normally come from an API)
onMounted(async() => {
  // Sample data - in a real implementation, fetch this from your API
  await invoiceExcelStore.getUploadHistory()
//   uploadResults.value = [
//     {
//       filename: 'sample_invoices_march.xlsx',
//       date: '2025-04-10 10:30:45',
//       status: 'success'
//     },
//     {
//       filename: 'invoices_q1.xlsx',
//       date: '2025-04-08 14:22:15',
//       status: 'success'
//     }
//   ];
});
</script>

<style scoped>
.hidden {
  display: none;
}

.preview-container {
  max-height: 400px;
  overflow: auto;
}
</style>
