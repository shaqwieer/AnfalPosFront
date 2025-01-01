<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n(); // Access translation function

</script>
<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>{{ t('hello') }}</h5>
                <p>Use this page to start from scratch and place your custom content.</p>

            </div>
        </div>
    </div>
</template>
