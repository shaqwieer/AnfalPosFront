<script setup>
import RoleCard from '@/views/pages/userRolePage/RoleCard.vue';
import Users from '@/views/pages/userRolePage/Users.vue';
</script>
<template>
    <div class="flex flex-column gap-6">
        <RoleCard />
        <Users/>
    </div>
</template>
<style scoped>
.rtl-direction :deep(.p-datatable .p-datatable-tbody > tr > td) {
    text-align: right;
}
:deep(.p-paginator .p-dropdown .p-dropdown-label) {
    padding-right: 1rem;
}
.rtl-direction :deep(.p-paginator .p-paginator-first) {
    rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-prev) {
    rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-next) {
    rotate: 180deg;
}
.rtl-direction :deep(.p-paginator .p-paginator-last) {
    rotate: 180deg;
}

</style>
