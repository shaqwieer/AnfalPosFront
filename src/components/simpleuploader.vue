<template>
    <div
        @dragover.prevent="dragover"
        @dragleave.prevent="dragleave"
        @drop.prevent="drop"
        :class="['max-w-md mx-auto  p-2  border-round-lg h-16m shadow-1 border-2 border-dashed border-round-lg  text-center transition-colors', isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400']"
    >
        <input type="file" ref="fileInput" @change="handleFileSelect" class="hidden" accept="image/*" />

        <div v-if="!selectedFile">
            <ImageIcon class="w-4rem mt-2 h-4rem mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600 mb-4">{{ t('uploader.mainlabel') }}</p>
            <Button @click="$refs.fileInput.click()" text severity="info" class="mx-auto py-1 h-2rem">{{ t('uploader.secondarylabel') }}</Button>
        </div>

        <div v-else class="flex flex-column align-items-center">
            <img  :src="previewUrl" alt="Logo preview" class="max-w-full max-h-16rem mb-4 border-round-lg" />
            <p class="text-sm text-gray-600 mb-2">{{ selectedFile.name }}</p>
            <Button severity="danger" text @click="removeFile">
                <XIcon class="w-1rem h-1rem" />
            </Button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ImageIcon, XIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const selectedFile = defineModel("logoFile");
const imageChanged = defineModel("imageChanged");

const props = defineProps({
    IsUpdate: {
        required: false,
        default: false
    },
    PhotoString: {
        required: false
    }
});
const fileInput = ref(null);
// const selectedFile = ref(null);
const isDragging = ref(false);
const errorMessage = ref('');

const previewUrl = computed(() => {
    selectedFile.value=selectedFile.value
    if(selectedFile.value !==props.PhotoString){
        imageChanged.value=true
        console.log(imageChanged.value);
    }
    console.log(selectedFile.value);
    return selectedFile.value ? (!props.IsUpdate && !(selectedFile.value instanceof Blob) ? selectedFile.value : URL.createObjectURL(selectedFile.value)) : null;
});


const dragover = (e) => {
    isDragging.value = true;
};

const dragleave = (e) => {
    isDragging.value = false;
};

const drop = (e) => {
    isDragging.value = false;
    const file = e.dataTransfer.files[0];
    if (file) addFile(file);
};

const handleFileSelect = (e) => {
    const file = e.target.files[0];
    selectedFile.value = file;

    // if (file) addFile(file);
};
const addFile = (file) => {
    if (file.type.startsWith('image/')) {
        if (file.size <= 5 * 1024 * 1024) {
            if (selectedFile.value instanceof Blob) {
                URL.revokeObjectURL(selectedFile.value);
            }
            selectedFile.value = file;
            errorMessage.value = '';
        } else {
            errorMessage.value = 'File size exceeds 5MB limit.';
        }
    } else {
        errorMessage.value = 'Please select an image file.';
    }
};

const removeFile = () => {
    selectedFile.value = null;
    errorMessage.value = '';
};
</script>
<style scoped>
.max-w-md {
    max-width: 760px;
}
</style>
