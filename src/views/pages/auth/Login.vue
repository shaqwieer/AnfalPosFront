<script setup>
import { computed, ref, onMounted } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import AppConfig from '@/layout/AppConfig.vue';

const mainStore = useMainStore();
const rtl = computed(() => mainStore.isRTL);
const { layoutConfig } = useLayout();
const { t } = useI18n();

const darkMode = computed(() => {
    return layoutConfig.colorScheme.value !== 'light';
});

// Enhanced password visibility with better UX
const isPasswordVisible = ref(false);
const passwordFocused = ref(false);
const emailFocused = ref(false);
const isLoading = ref(false);
const loginAttempts = ref(0);
const showWelcome = ref(true);

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

const passwordFieldType = computed(() => (isPasswordVisible.value ? 'text' : 'password'));

// Enhanced validation schema with original localization keys
const loginSchema = yup.object({
    email: yup
        .string()
        .email(t('loginPage.usernameError'))
        .min(3, t('loginPage.usernameError'))
        .required(t('loginPage.usernameRequired')),
    password: yup
        .string()
        .min(6, t('loginPage.passwordError'))
        .required(t('loginPage.passwordRequired')),
    rememberMe: yup.boolean().notRequired().default(false)
});

const loginInformationInitial = ref({ 
    email: '', 
    password: '', 
    rememberMe: false 
});

const { handleSubmit, errors, resetForm, defineField, meta } = useForm({
    validationSchema: loginSchema,
    initialValues: loginInformationInitial.value
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [rememberMe, rememberMeAttrs] = defineField('rememberMe');

// Enhanced login with better error handling and UX feedback
const login = handleSubmit(async (loginData) => {
    isLoading.value = true;
    loginAttempts.value++;
    
    try {
        const payload = new FormData();
        payload.append('Email', loginData.email);
        payload.append('Password', loginData.password);
        payload.append('RememberMe', loginData.rememberMe);
        
        await mainStore.login(payload);
        resetForm();
        loginAttempts.value = 0;
    } catch (error) {
        // Handle login error with user-friendly feedback
        console.error('Login failed:', error);
    } finally {
        isLoading.value = false;
    }
});

// Welcome animation
onMounted(() => {
    setTimeout(() => {
        showWelcome.value = false;
    }, 100);
});

// Password strength indicator (simplified for old localization)
const passwordStrength = computed(() => {
    if (!password.value) return 0;
    let strength = 0;
    if (password.value.length >= 6) strength += 50;
    if (password.value.length >= 8) strength += 50;
    return strength;
});

const passwordStrengthColor = computed(() => {
    if (passwordStrength.value < 50) return 'var(--red-500)';
    return 'var(--green-500)';
});

const passwordStrengthText = computed(() => {
    if (passwordStrength.value < 50) return t('loginPage.passwordError');
    return 'Strong';
});
</script>

<template>
    <div class="login-container" :data-dark="darkMode">
        <!-- SAP-inspired background with subtle animations -->
        <div class="background-wrapper">
            <div class="background-gradient"></div>
            <div class="background-pattern"></div>
            <div class="floating-elements">
                <div class="float-element" v-for="i in 8" :key="i"></div>
            </div>
        </div>

        <!-- Main login card with SAP Fiori styling -->
        <div class="login-wrapper" :class="{ 'welcome-animation': showWelcome }">
            <div class="login-card" @keyup.enter="login">
                <!-- Header section with branding -->
                <div class="login-header">
                    <div class="brand-section">
                        <div class="brand-icon">
                            <i class="pi pi-shopping-cart"></i>
                        </div>
                        <div class="brand-text">
                            <h1 class="brand-title">Sales Hub</h1>
                            <p class="brand-subtitle">Point of Sale System</p>
                        </div>
                    </div>
                    <div class="welcome-section">
                        <h2 class="welcome-title">{{ t('loginPage.title') }}</h2>
                        <p class="welcome-subtitle">{{ t('loginPage.subtitle') }}</p>
                    </div>
                </div>

                <!-- Login form with enhanced UX -->
                <form class="login-form" @submit.prevent="login">
                    <!-- Email field with floating label -->
                    <div class="form-group">
                        <div class="input-wrapper" :class="{ 
                            'focused': emailFocused, 
                            'filled': email,
                            'error': errors.email 
                        }">
                            <label class="floating-label">{{ t('loginPage.usernamePlaceholder') }}</label>
                            <div class="input-container">
                                <i class="input-icon pi pi-envelope"></i>
                                <input
                                    v-model="email"
                                    v-bind="emailAttrs"
                                    type="email"
                                    class="form-input"
                                    @focus="emailFocused = true"
                                    @blur="emailFocused = false"
                                    autocomplete="username"
                                    :disabled="isLoading"
                                />
                            </div>
                        </div>
                        <transition name="error-slide">
                            <div v-if="errors.email" class="error-message">
                                <i class="pi pi-exclamation-triangle"></i>
                                {{ errors.email }}
                            </div>
                        </transition>
                    </div>

                    <!-- Password field with strength indicator -->
                    <div class="form-group">
                        <div class="input-wrapper" :class="{ 
                            'focused': passwordFocused, 
                            'filled': password,
                            'error': errors.password 
                        }">
                            <label class="floating-label">{{ t('loginPage.passwordPlaceholder') }}</label>
                            <div class="input-container">
                                <i class="input-icon pi pi-lock"></i>
                                <input
                                    v-model="password"
                                    v-bind="passwordAttrs"
                                    :type="passwordFieldType"
                                    class="form-input"
                                    @focus="passwordFocused = true"
                                    @blur="passwordFocused = false"
                                    autocomplete="current-password"
                                    :disabled="isLoading"
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="togglePasswordVisibility"
                                    :disabled="isLoading"
                                >
                                    <i :class="isPasswordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Password strength indicator -->
                        <transition name="strength-fade">
                            <div v-if="password && passwordFocused" class="password-strength">
                                <div class="strength-bar">
                                    <div 
                                        class="strength-fill" 
                                        :style="{ width: passwordStrength + '%', backgroundColor: passwordStrengthColor }"
                                    ></div>
                                </div>
                                <span class="strength-text" :style="{ color: passwordStrengthColor }">
                                    {{ passwordStrengthText }}
                                </span>
                            </div>
                        </transition>

                        <transition name="error-slide">
                            <div v-if="errors.password" class="error-message">
                                <i class="pi pi-exclamation-triangle"></i>
                                {{ errors.password }}
                            </div>
                        </transition>
                    </div>

                    <!-- Additional options -->
                    <div class="form-options">
                        <label class="checkbox-wrapper">
                            <input
                                type="checkbox"
                                v-model="rememberMe"
                                v-bind="rememberMeAttrs"
                                :disabled="isLoading"
                            />
                            <span class="checkmark"></span>
                            <span class="checkbox-label">{{ t('loginPage.rememberMe') }}</span>
                        </label>
                        
                        <a href="#" class="forgot-password">{{ t('loginPage.resetPassword') }}</a>
                    </div>

                    <!-- Submit button with loading state -->
                    <button
                        type="submit"
                        class="login-button"
                        :disabled="isLoading || !meta.valid"
                        :class="{ 'loading': isLoading }"
                    >
                        <span v-if="!isLoading" class="button-content">
                            <i class="pi pi-sign-in"></i>
                            {{ t('loginPage.loginButton') }}
                        </span>
                        <div v-else class="loading-spinner">
                            <div class="spinner"></div>
                            Signing In...
                        </div>
                    </button>

                    <!-- Login attempts warning -->
                    <transition name="warning-fade">
                        <div v-if="loginAttempts >= 3" class="security-warning">
                            <i class="pi pi-shield"></i>
                            Multiple login attempts detected. Please try again later.
                        </div>
                    </transition>
                </form>

                <!-- Footer -->
                <div class="login-footer">
                    <p class="help-text">
                        Need help?
                        <a href="#" class="help-link">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>

        <AppConfig simple />
    </div>
</template>

<style scoped>
/* SAP Fiori Design System inspired styles with enhanced dark/light mode support */
.login-container {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: '72', 'Helvetica Neue', Arial, sans-serif;
    color: var(--text-color, #1a1a1a);
}

.background-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.background-gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, 
        var(--primary-500, #0070f3) 0%,
        var(--primary-600, #0056b3) 35%,
        var(--primary-700, #003d82) 100%);
}

.background-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%);
    background-size: 200px 200px;
    animation: patternMove 20s linear infinite;
}

@keyframes patternMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
}

.floating-elements {
    position: absolute;
    width: 100%;
    height: 100%;
}

.float-element {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: float 15s infinite linear;
}

.float-element:nth-child(1) { left: 10%; animation-delay: 0s; }
.float-element:nth-child(2) { left: 20%; animation-delay: 2s; }
.float-element:nth-child(3) { left: 30%; animation-delay: 4s; }
.float-element:nth-child(4) { left: 40%; animation-delay: 6s; }
.float-element:nth-child(5) { left: 50%; animation-delay: 8s; }
.float-element:nth-child(6) { left: 60%; animation-delay: 10s; }
.float-element:nth-child(7) { left: 70%; animation-delay: 12s; }
.float-element:nth-child(8) { left: 80%; animation-delay: 14s; }

@keyframes float {
    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
}

.login-wrapper {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    transition: all 0.6s ease;
}

.welcome-animation {
    transform: translateY(20px);
    opacity: 0;
}

.login-card {
    width: 100%;
    max-width: 480px;
    background: var(--surface-card, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(20px);
    border-radius: 16px;
    box-shadow: 
        0 32px 64px rgba(0, 0, 0, 0.1),
        0 16px 32px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    padding: 3rem;
    border: 1px solid var(--surface-border, rgba(255, 255, 255, 0.2));
    animation: cardAppear 0.8s ease-out 0.2s both;
    color: var(--text-color, #1a1a1a);
}

@keyframes cardAppear {
    0% {
        transform: translateY(30px) scale(0.95);
        opacity: 0;
    }
    100% {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

.login-header {
    text-align: center;
    margin-bottom: 3rem;
}

.brand-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.brand-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 8px 16px rgba(0, 112, 243, 0.3);
}

.brand-text {
    text-align: left;
}

.brand-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color, #1a1a1a);
    margin: 0 0 0.25rem 0;
    letter-spacing: -0.02em;
}

.brand-subtitle {
    font-size: 0.875rem;
    color: var(--text-color-secondary, #666666);
    margin: 0;
    font-weight: 400;
}

.welcome-section {
    margin-top: 1rem;
}

.welcome-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color, #1a1a1a);
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.01em;
}

.welcome-subtitle {
    font-size: 1rem;
    color: var(--text-color-secondary, #666666);
    margin: 0;
    font-weight: 400;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    position: relative;
}

.input-wrapper {
    position: relative;
    border: 2px solid var(--surface-border, #e1e5e9);
    border-radius: 12px;
    background: var(--surface-ground, #ffffff);
    transition: all 0.3s ease;
    overflow: hidden;
}

.input-wrapper:hover {
    border-color: var(--primary-200, #c1c9d0);
}

.input-wrapper.focused {
    border-color: var(--primary-500, #0070f3);
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
}

.input-wrapper.error {
    border-color: var(--red-500, #dc3545);
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.floating-label {
    position: absolute;
    left: 3.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary, #8a94a6);
    font-size: 1rem;
    font-weight: 400;
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 1;
}

.input-wrapper.focused .floating-label,
.input-wrapper.filled .floating-label {
    top: 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--primary-600, #0056b3);
    transform: translateY(0);
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 1rem;
    color: var(--text-color-secondary, #8a94a6);
    font-size: 1.1rem;
    z-index: 2;
    transition: color 0.3s ease;
}

.input-wrapper.focused .input-icon {
    color: var(--primary-500, #0070f3);
}

.form-input {
    width: 100%;
    padding: 1.75rem 1rem 0.75rem 3.5rem;
    border: none;
    outline: none;
    background: transparent;
    font-size: 1rem;
    color: var(--text-color, #1a1a1a);
    font-weight: 400;
    transition: all 0.3s ease;
}

.form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.password-toggle {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: var(--text-color-secondary, #8a94a6);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    z-index: 2;
}

.password-toggle:hover {
    background: rgba(0, 112, 243, 0.1);
    color: var(--primary-500, #0070f3);
}

.password-strength {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.strength-bar {
    flex: 1;
    height: 4px;
    background: var(--surface-border, #e1e5e9);
    border-radius: 2px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: all 0.3s ease;
}

.strength-text {
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
}

.error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--red-500, #dc3545);
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(220, 53, 69, 0.05);
    border: 1px solid rgba(220, 53, 69, 0.2);
    border-radius: 8px;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem 0;
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    position: relative;
}

.checkbox-wrapper input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid var(--surface-border, #c1c9d0);
    border-radius: 4px;
    background: var(--surface-ground, #ffffff);
    position: relative;
    transition: all 0.2s ease;
}

.checkbox-wrapper:hover .checkmark {
    border-color: var(--primary-500, #0070f3);
}

.checkbox-wrapper input:checked + .checkmark {
    background: var(--primary-500, #0070f3);
    border-color: var(--primary-500, #0070f3);
}

.checkbox-wrapper input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary, #666666);
    font-weight: 400;
}

.forgot-password {
    color: var(--primary-500, #0070f3);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s ease;
}

.forgot-password:hover {
    color: var(--primary-600, #0056b3);
    text-decoration: underline;
}

.login-button {
    width: 100%;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, var(--primary-500, #0070f3), var(--primary-600, #0056b3));
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    margin-top: 1rem;
    box-shadow: 
        0 4px 12px rgba(0, 112, 243, 0.3),
        0 2px 4px rgba(0, 112, 243, 0.2);
}

.login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
        0 8px 20px rgba(0, 112, 243, 0.4),
        0 4px 8px rgba(0, 112, 243, 0.3);
}

.login-button:active:not(:disabled) {
    transform: translateY(0);
}

.login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: 
        0 4px 12px rgba(0, 112, 243, 0.2),
        0 2px 4px rgba(0, 112, 243, 0.1);
}

.button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.security-warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--orange-600, #fd7e14);
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(253, 126, 20, 0.05);
    border: 1px solid rgba(253, 126, 20, 0.2);
    border-radius: 8px;
}

.login-footer {
    margin-top: 2rem;
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid var(--surface-border, #e1e5e9);
}

.help-text {
    font-size: 0.875rem;
    color: var(--text-color-secondary, #666666);
    margin: 0;
}

.help-link {
    color: var(--primary-500, #0070f3);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
}

.help-link:hover {
    color: var(--primary-600, #0056b3);
    text-decoration: underline;
}

/* Transitions */
.error-slide-enter-active,
.error-slide-leave-active {
    transition: all 0.3s ease;
}

.error-slide-enter-from,
.error-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.strength-fade-enter-active,
.strength-fade-leave-active {
    transition: all 0.3s ease;
}

.strength-fade-enter-from,
.strength-fade-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}

.warning-fade-enter-active,
.warning-fade-leave-active {
    transition: all 0.3s ease;
}

.warning-fade-enter-from,
.warning-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* Responsive design */
@media (max-width: 640px) {
    .login-wrapper {
        padding: 1rem;
    }
    
    .login-card {
        padding: 2rem 1.5rem;
    }
    
    .brand-section {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .brand-text {
        text-align: center;
    }
    
    .form-options {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
}

/* Dark mode support - using CSS variables for better theme integration */
:root {
    --text-color: #1a1a1a;
    --text-color-secondary: #666666;
    --surface-card: rgba(255, 255, 255, 0.95);
    --surface-ground: #ffffff;
    --surface-border: #e1e5e9;
}

/* Dark theme variables */
[data-theme="dark"], 
.p-dark,
body.p-dark {
    --text-color: #ffffff;
    --text-color-secondary: rgba(255, 255, 255, 0.7);
    --surface-card: rgba(26, 26, 26, 0.95);
    --surface-ground: rgba(40, 40, 40, 0.8);
    --surface-border: rgba(255, 255, 255, 0.1);
}

/* Computed dark mode based on layout config */
.login-container[data-dark="true"] {
    --text-color: #ffffff;
    --text-color-secondary: rgba(255, 255, 255, 0.7);
    --surface-card: rgba(26, 26, 26, 0.95);
    --surface-ground: rgba(40, 40, 40, 0.8);
    --surface-border: rgba(255, 255, 255, 0.1);
}

/* Enhanced text contrast for dark mode */
.login-container[data-dark="true"] .login-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
        0 32px 64px rgba(0, 0, 0, 0.3),
        0 16px 32px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.login-container[data-dark="true"] .input-wrapper:hover {
    border-color: rgba(255, 255, 255, 0.2);
}

.login-container[data-dark="true"] .floating-label,
.login-container[data-dark="true"] .input-icon,
.login-container[data-dark="true"] .password-toggle {
    color: rgba(255, 255, 255, 0.7);
}

.login-container[data-dark="true"] .input-wrapper.focused .floating-label,
.login-container[data-dark="true"] .input-wrapper.focused .input-icon {
    color: var(--primary-400, #66b3ff);
}
</style>