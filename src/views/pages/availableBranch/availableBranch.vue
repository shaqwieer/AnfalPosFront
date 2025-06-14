<template>
    <!-- Main Content -->
    <div class="branch-selection-container w-full h-screen flex flex-column align-items-center justify-content-center" v-if="!loading">
        <!-- Background Elements -->
        <div class="background-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
        </div>
        
        <!-- Content -->
        <div class="content-wrapper flex flex-column align-items-center z-2">
            <!-- Header Section -->
            <div class="header-section text-center mb-6 fadein animation-duration-1000">
                <div class="icon-wrapper mb-4">
                    <div class="main-icon">
                        <i class="pi pi-building text-6xl text-primary"></i>
                        <div class="icon-glow"></div>
                    </div>
                </div>
                <h1 class="main-title text-5xl font-bold mb-3 text-900">
                    {{ t('availableBranch.title') }}
                </h1>
                <p class="subtitle text-xl text-600 max-w-30rem line-height-3">
                    {{ t('availableBranch.subtitle') || 'Select your branch to continue with your work session' }}
                </p>
            </div>

            <!-- Branch Cards Grid -->
            <div class="branch-grid flex flex-wrap justify-content-center align-items-center gap-4 max-w-screen-lg">
                <div 
                    v-for="(branch, index) in entities" 
                    :key="branch.name"
                    class="branch-card-wrapper"
                    :style="{ '--delay': index * 100 + 'ms' }"
                    @click="choosedBranch(branch)"
                >
                    <div class="branch-card relative overflow-hidden cursor-pointer">
                        <!-- Card Background Pattern -->
                        <div class="card-pattern"></div>
                        
                        <!-- Card Content -->
                        <div class="card-content relative z-1 p-5">
                            <div class="branch-icon mb-3">
                                <i class="pi pi-home text-3xl text-primary"></i>
                            </div>
                            
                            <h3 class="branch-name text-xl font-bold text-900 mb-2">
                                {{ branch.name }}
                            </h3>
                            
                            <div class="branch-details text-sm text-600 mb-3">
                                <div v-if="branch.uniqueIdentifier" class="detail-item flex align-items-center gap-2 mb-1">
                                    <i class="pi pi-tag text-xs"></i>
                                    <span>{{ branch.uniqueIdentifier }}</span>
                                </div>
                            </div>
                            
                            <!-- Action Button -->
                            <div class="action-area mt-4">
                                <Button 
                                    :label="t('availableBranch.select') || 'Select Branch'" 
                                    icon="pi pi-arrow-right" 
                                    class="w-full select-btn"
                                    size="small"
                                />
                            </div>
                        </div>
                        
                        <!-- Hover Effect -->
                        <div class="hover-overlay absolute top-0 left-0 w-full h-full"></div>
                    </div>
                </div>
            </div>
            
            <!-- Footer Info -->
            <div class="footer-info mt-6 text-center fadein animation-duration-1500">
                <p class="text-sm text-500">
                    <i class="pi pi-info-circle mr-2"></i>
                    {{ entities.length }} {{ entities.length === 1 ? 'branch' : 'branches' }} available
                </p>
            </div>
        </div>
    </div>

    <!-- Enhanced Loading Screen -->
    <div class="loading-container w-full h-screen flex flex-column align-items-center justify-content-center" v-else>
        <!-- Background -->
        <div class="loading-background"></div>
        
        <!-- Loading Content -->
        <div class="loading-content text-center">
            <!-- Animated Logo/Icon -->
            <div class="loading-icon mb-4">
                <div class="pulse-ring"></div>
                <div class="pulse-ring pulse-ring-delay-1"></div>
                <div class="pulse-ring pulse-ring-delay-2"></div>
                <i class="pi pi-building text-4xl text-primary z-2 relative"></i>
            </div>
            
            <!-- Loading Text -->
            <h3 class="loading-title text-2xl font-semibold text-900 mb-2">
                {{ t('availableBranch.loading') || 'Setting up your workspace' }}
            </h3>
            <p class="loading-subtitle text-600">
                {{ t('availableBranch.loadingDesc') || 'Please wait while we prepare everything for you...' }}
            </p>
            
            <!-- Progress Dots -->
            <div class="loading-dots flex justify-content-center gap-2 mt-4">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { handleError } from '@/utilities/errorHandler';
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/apiClient';
import { useMainStore } from '@/stores/mainStore';
const mainStore = useMainStore();
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const loading = ref(false);

const choosedBranch = async (availableBranch) => {
    try {
        console.log(availableBranch);
        loading.value = true;
        const formData = new FormData();
        formData.append('Id', availableBranch.id );
        formData.append('UniqueIdentifier', availableBranch.uniqueIdentifier);
        formData.append('Name', availableBranch.name );
        formData.append('SapStorageLocation', availableBranch.sapStorageLocation ?? '');
        formData.append('ProfitCenter', availableBranch.profitCenter ?? '');
        formData.append('CajoNumber', availableBranch.cajoNumber ?? '');
        formData.append('CashCustomer', availableBranch.cashCustomer ?? '');
        formData.append('BranchTypeId', availableBranch.branchTypeId ?? '');
        await mainStore.chooseBranch(formData);
        loading.value = false;
    } catch (err) {
        loading.value = false;
    }
};

const entities = ref([]);

onMounted(async () => {
    try {
        const response = await apiClient.get(`/UserBranches/GetAvailableBranches`);
        entities.value = response.data.data;
    } catch (err) {
        handleError(err, mainStore.loading);
    }
});
</script>

<style scoped>
/* Main Container */
.branch-selection-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
}

/* Background Shapes */
.background-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
}

.shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.shape-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -150px;
    animation: float 8s ease-in-out infinite;
}

.shape-2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: -100px;
    animation: float 6s ease-in-out infinite reverse;
}

.shape-3 {
    width: 150px;
    height: 150px;
    top: 50%;
    left: -75px;
    animation: float 10s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

/* Content Wrapper */
.content-wrapper {
    position: relative;
    z-index: 2;
    padding: 2rem;
}

/* Header Section */
.header-section {
    animation: slideInFromTop 1s ease-out;
}

.icon-wrapper {
    position: relative;
    display: inline-block;
}

.main-icon {
    position: relative;
    display: inline-block;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
}

.icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

.main-title {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.subtitle {
    color: rgba(255, 255, 255, 0.9);
}

/* Branch Cards */
.branch-grid {
    animation: slideInFromBottom 1s ease-out;
}

.branch-card-wrapper {
    animation: slideInScale 0.6s ease-out forwards;
    animation-delay: var(--delay);
    opacity: 0;
    transform: translateY(30px) scale(0.8);
}

.branch-card {
    width: 280px;
    min-height: 200px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.branch-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-pattern {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: linear-gradient(45deg, var(--primary-color), var(--primary-color-text));
    opacity: 0.1;
    border-radius: 0 20px 0 100px;
}

.card-content {
    padding: 1.5rem;
}

.branch-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.branch-icon i {
    color: white !important;
}

.branch-name {
    text-align: center;
    margin-bottom: 0.5rem;
}

.branch-details {
    text-align: center;
    min-height: 40px;
}

.detail-item {
    justify-content: center;
    opacity: 0.8;
}

.select-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
}

.select-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
}

.hover-overlay {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 20px;
}

.branch-card:hover .hover-overlay {
    opacity: 1;
}

/* Footer */
.footer-info {
    color: rgba(255, 255, 255, 0.8);
}

/* Loading Screen */
.loading-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
}

.loading-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.loading-content {
    position: relative;
    z-index: 2;
    color: white;
}

.loading-icon {
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
}

.pulse-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: pulse-ring 2s ease-out infinite;
}

.pulse-ring-delay-1 {
    animation-delay: 0.5s;
}

.pulse-ring-delay-2 {
    animation-delay: 1s;
}

.loading-title {
    color: white;
    margin-bottom: 0.5rem;
}

.loading-subtitle {
    color: rgba(255, 255, 255, 0.8);
}

.loading-dots {
    margin-top: 1rem;
}

.dot {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

/* Animations */
@keyframes slideInFromTop {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInFromBottom {
    from {
        opacity: 0;
        transform: translateY(50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInScale {
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
    50% {
        opacity: 0.5;
        transform: translate(-50%, -50%) scale(1.1);
    }
}

@keyframes pulse-ring {
    0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0;
    }
}

@keyframes bounce {
    0%, 80%, 100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .branch-card {
        width: 250px;
        min-height: 180px;
    }
    
    .main-title {
        font-size: 2.5rem !important;
    }
    
    .content-wrapper {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .branch-grid {
        flex-direction: column;
        align-items: center;
    }
    
    .branch-card {
        width: 100%;
        max-width: 300px;
    }
    
    .main-title {
        font-size: 2rem !important;
    }
}
</style>