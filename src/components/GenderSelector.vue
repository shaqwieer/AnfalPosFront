<template>
    <div :class="['flex border-round-3xl surface-200 p-3 gap-4 max-w-min border-2 border-200', error ? 'border-2 border-red-600' : '']" style="max-height: max-content;">
        <div
            v-for="gender in localizedGenders"
            @click="
                () => {
                    if (!props.disabled)
                        selectedGender = gender.code;
                }
            "
            :class="['cursor-pointer transition-all transition-duration-500 transition-ease-in-out flex flex-column align-items-center justify-content-center p-2 border-round-2xl border-1 border-200', selectedGender == gender.code ? 'surface-0 border-1 border-300' : '']"
        >
            <img :src="gender.icon" height="100" />
            <span class="text-lg font-semibold">{{ gender.name }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const selectedGender = defineModel(true);
const props = defineProps({
    error: {
        type: String,
        required: false
    },
    disabled: {
        type: Boolean,
        required: false 
    }
});

const genders = ref([
    { name: t('genders.male'), icon: 'https://vectorified.com/images/avatar-icon-png-3.png', code: true },
    { name: t('genders.female'), icon: 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/7914838/woman-icon-md.png', code: false }
]);

const localizedGenders = genders.value;
</script>
