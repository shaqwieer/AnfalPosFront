<template>
    <div class="flex flex-column">
        <div class="flex w-full p-2">
            <backButton/>
        </div>
        <div class="flex p-2 gap-3 w-full">
            <div class="w-12 lg:w-3 flex flex-column gap-3">
                <div class="w-full p-4 flex flex-column card gap-2">
                    <img
                        :src="user.photoPath != '' ? user.photoPath : user.gender ? 'https://vectorified.com/images/avatar-icon-png-3.png' : 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/7914838/woman-icon-md.png'"
                        class="border-circle w-full"
                    />
                    <div class="flex flex-column gap-4">
                        <span class="text-xl font-semibold text-center">{{ upperCaseFirstLetter(user.firstName) }} {{ upperCaseFirstLetter(user.lastName) }}</span>
                        <span class="text-lg">Status: <Tag :severity="user.status === 'Active' ? 'success' : 'danger'" :value="user.status" rounded class="w-6rem h-2rem"></Tag></span>
                    </div>
                    <slot name="profile" />
                </div>
                <slot name="extra" />
            </div>
            <div class="w-12 lg:w-9">
                <slot name="tabs" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import  backButton from '@/components/backButton.vue';
const router = useRouter();
const props = defineProps({
    user: {
        type: Object,
        required: true
    }
});
const upperCaseFirstLetter = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};
</script>
