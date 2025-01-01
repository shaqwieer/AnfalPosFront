<template>
    <div :class="['animation-duration-500 flex flex-column border-3 min-h-full border-round-lg border-primary p-4 shadow-6', mainStore.isRTL ? 'fadeinleft' : 'fadeinright']">
        <span class="text-2xl font-semibold pb-5">{{ question.Question }}</span>
        <div class="grid p-3">
            <div
                v-if="question.type == 'mcq'"
                v-for="(answer, index) in question.Answers"
                :key="answer"
                @click="
                    () => {
                        if (userAnswer == index) userAnswer = null;
                        else userAnswer = index;
                    }
                "
                :class="['col-6 mt-5 flex gap-3 align-items-center border-3 border-transparent hover:bg-primary hover:bg-opacity-20 px-3 pb-2 p-1 border-round-xl cursor-pointer', userAnswer == index ? ' border-primary' : '']"
            >
                <input
                    type="radio"
                    name="language"
                    :id="answer"
                    :value="answer"
                    v-model="userAnswer"
                    :class="['appearance-none h-2rem w-2rem border-circle border-2 border-300 focus:ring-rich-black mr-3 bg-primary-50 hover ', userAnswer == index ? ' border-double border-300 bg-primary-500' : '']"
                />
                <span class="text-sm leading-6 font-medium text-black flex-grow text-start">{{ answer }}</span>
            </div>
            <div
                v-if="question.type == 'img'"
                v-for="(answer, index) in question.Answers"
                :key="answer"
                @click="
                    () => {
                        if (userAnswer == index) userAnswer = null;
                        else userAnswer = index;
                    }
                "
                :class="['col-3 mt-5 flex gap-3 align-items-center border-3  border-transparent hover:border-primary hover:bg-opacity-20 px-3 pb-2 p-1 border-round-xl cursor-pointer', userAnswer == index ? ' border-primary bg-primary' : '']"
            >
                <img :src="answer" :alt="answer" class="w-12" />
            </div>

            <div v-if="question.type == 'writing'" :key="answer" :class="['col-12 mt-5 flex gap-3 align-items-center  px-3 pb-2 p-1 border-round-xl cursor-pointer']">
                <Textarea v-model="userAnswer" class="w-full border-3 border-primary-200 text-xl font-semibold" rows="3" cols="30" />
            </div>
        </div>
        <div class="flex w-full justify-content-between">
            <Button v-if="mode != 1" @click="prev" :disabled="question.Id == 0">
                {{ t('quizPage.prevButton') }}
            </Button>
            <span></span>

            <Button v-if="!final" @click="next">
                {{ t('quizPage.nextButton') }}
            </Button>
            <Button v-else @click="finish">
                {{ t('quizPage.finishButton') }}
            </Button>
        </div>
    </div>
</template>
<script setup>
import { useMainStore } from '@/stores/mainStore';
import { useI18n } from 'vue-i18n'; // Import useI18n hook
const { t } = useI18n();
const mainStore = useMainStore();
const props = defineProps({
    question: {
        type: Object,
        required: true
    },
    next: {
        type: Function,
        required: true
    },
    prev: {
        type: Function,
        required: false
    },
    finish: {
        type: Function,
        required: true
    },
    mode: {
        type: Number,
        required: true
    },
    final: {
        type: Boolean,
        required: true
    }
});

const userAnswer = defineModel();
</script>
