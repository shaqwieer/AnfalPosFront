<template>
    <div class="card p-fluid">
      <h2 class="text-2xl font-bold mb-4">Upload Your Logo</h2>
      <FileUpload
        mode="advanced"
        :customUpload="true"
        @uploader="onUpload"
        @select="onSelect"
        :maxFileSize="1000000"
        accept="image/*"
        :auto="true"
        chooseLabel="Select Logo"
        :showCancelButton="false"
        :showUploadButton="false"
      >
        <!-- <template #empty>
          <p class="m-0">Drag and drop your logo here to upload.</p>
        </template> -->
      </FileUpload>
  
      <div v-if="file" class="mt-4">
        <h3 class="text-xl font-semibold mb-2">Preview</h3>
        <div class="surface-card p-4 shadow-2 border-round">
          <img :src="previewUrl" alt="Logo Preview" class="w-full max-w-20rem mx-auto" />
        </div>
      </div>
  
      <ProgressBar v-if="uploadProgress > 0" :value="uploadProgress" class="mt-4"></ProgressBar>
  
      <small v-if="errorMessage" class="p-error block mt-2">{{ errorMessage }}</small>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import FileUpload from 'primevue/fileupload';
  import ProgressBar from 'primevue/progressbar';
  
  const file = ref(null);
  const previewUrl = ref('');
  const uploadProgress = ref(0);
  const errorMessage = ref('');
  
  const onSelect = (event) => {
    const selectedFile = event.files[0];
    
    if (selectedFile.type.startsWith('image/')) {
      file.value = selectedFile;
      previewUrl.value = URL.createObjectURL(selectedFile);
      errorMessage.value = '';
    } else {
      errorMessage.value = 'Please select an image file.';
      event.files = [];
    }
  };
  
  const onUpload = () => {
    if (!file.value) return;
  
    // Simulating upload progress
    uploadProgress.value = 0;
    const interval = setInterval(() => {
      uploadProgress.value += 10;
      if (uploadProgress.value >= 100) {
        clearInterval(interval);
        // Here you would typically make an API call to upload the file
        console.log('File uploaded:', file.value);
      }
    }, 100);
  };
  </script>
  
  <style scoped>
  /* Add any additional custom styles here */
  .p-fileupload-content {
    @apply flex items-center justify-center min-h-10rem;
  }
  
  .max-w-20rem {
    max-width: 20rem;
  }
  </style>