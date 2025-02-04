<template>
  <DataTable class="surface-card border-round-lg mb-4 shadow-1 border-1 surface-border" :value="customerStore.attachmentTypes" dataKey="id" :rows="10" :currentPageReportTemplate="''">
    <Column field="name" class="name" :sortable="true">
      <template #body="slotProps">
        <div class="flex flex-column align-items-start">
          <div class="font-semibold text-md">{{ slotProps.data.name }}</div>
        </div>
      </template>
    </Column>

    <Column field="Contact" header="Preview" class="" :sortable="true">
      <template #body="slotProps">
        <div class="flex flex-column align-items-start">
          <span class="text-md">{{ attachmentLocal?.find((item) => item.id == slotProps.data.id)?.file.name }}</span>
        </div>    
    </template>
    </Column>
    <Column field="Business Info" :header="'Actions'" class="" :sortable="true">
      <template #body="slotProps">
        <div class="flex w-full">
            <FileUpload class="max-w-min" name="demo[]" url="/api/upload" @before-send="(e) => saveAttachment(e, slotProps.data.id)" :chooseLabel="''" mode="basic" :multiple="false" accept="image/*" auto :maxFileSize="1000000"> </FileUpload>
        <Button
        v-show="attachmentLocal?.some((item) => item.id == slotProps.data.id)"
          icon="pi pi-trash"
          v-tooltip.top="'Delete'"
          text
          rounded
          aria-label="Delete"
          severity="danger"
          @click="
            () => {
                attachmentLocal = attachmentLocal.filter((item) => item.id !== slotProps.data.id);
                attachments = attachments.filter((item) => item.id !== slotProps.data.id);
            }
          "
        />
        </div>

      </template>
    </Column>
  </DataTable>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCustomerStore } from '../../../../stores/customerStore';

const customerStore = useCustomerStore();
const attachments = defineModel([]);
const attachmentLocal = ref([]);

const saveAttachment = (event, id) => {
  for (let [key, value] of event.formData.entries()) {
    attachmentLocal.value.push({ id: id, file: value });
    attachments.value.push({ id: id, file: value });
    console.log(value.name);
    
  }
};

onMounted(async () => {
    
  await Promise.all([customerStore.GetAttachmentTypes()]);
  attachments.value = [];
});
</script>
