<template>
    <div class="flex flex-column gap-2">
        <div class="flex justify-content-between">
            <span class="text-3xl font-semibold text-primary-600">{{ t('quizPage.score') }}: {{ results.score * 10 }}/{{ quiz.questions.length * 10 }} </span>
            <span class="text-3xl font-semibold text-primary-600">{{ t('quizPage.timeTaken') }}: {{ parseInt(results.timeTaken / 60) + (results.timeTaken % 60 < 10 ? ':0' : ':') + (results.timeTaken % 60) }}</span>
        </div>
        <div v-for="question in quiz.questions" :class="['animation-duration-500 flex flex-column border-3 min-h-full border-round-lg border-primary p-4 shadow-6', mainStore.isRTL ? 'fadeinleft' : 'fadeinright']">
            <span class="text-2xl font-semibold pb-5">{{ question.Question }}</span>
            <div class="grid p-3">
                <div
                    v-if="question.type == 'mcq'"
                    v-for="(answer, index) in question.Answers"
                    :key="answer"
                    :class="[
                        'col-6 mt-5 flex gap-3 align-items-center border-3 border-transparent hover:bg-primary hover:bg-opacity-20 px-3 pb-2 p-1 border-round-xl cursor-pointer',
                        index == question.CorrectAnswer ? 'bg-green-500 ' : '',
                        index == results.Answers[question.Id].answer && index != question.CorrectAnswer ? 'bg-red-500 border-primary' : '',
                        index == results.Answers[question.Id].answer ? 'border-primary' : ''
                    ]"
                >
                    <input
                        type="radio"
                        name="language"
                        :id="answer"
                        :value="answer"
                        :class="['appearance-none h-2rem w-2rem border-circle border-2 border-300 focus:ring-rich-black mr-3 bg-primary-50 hover ', index == results.Answers[question.Id].answer ? ' border-double border-300 bg-primary' : '']"
                    />
                    <span class="text-sm leading-6 font-medium text-black flex-grow text-start">{{ answer }}</span>
                </div>
                <div
                    v-if="question.type == 'img'"
                    v-for="(answer, index) in question.Answers"
                    :key="answer"
                    :class="[
                        'col-3 mt-5 flex gap-3 align-items-center border-3  border-transparent hover:border-primary hover:bg-opacity-20 px-3 pb-2 p-1 border-round-xl cursor-pointer',
                        userAnswer == index ? ' border-primary bg-primary' : '',
                        index == question.CorrectAnswer ? 'bg-green-500 ' : '',
                        index == results.Answers[question.Id].answer && index != question.CorrectAnswer ? 'bg-red-500 border-primary' : '',
                        index == results.Answers[question.Id].answer ? 'border-primary' : ''
                    ]"
                >
                    <img :src="answer" :alt="answer" class="w-12" />
                </div>

                <div v-if="question.type == 'writing'" :key="answer" :class="['col-12 mt-5 flex gap-3 align-items-center  px-3 pb-2 p-1 border-round-xl cursor-pointer']">
                    <Textarea v-model="results.Answers[question.Id].answer" disabled class="w-full border-3 border-primary-200 text-xl font-semibold" rows="3" cols="30" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import {  computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { useQuizStore } from '@/stores/quizStore.js';
import { useI18n } from 'vue-i18n'; // Import useI18n hook
const { t } = useI18n();
const mainStore = useMainStore();
const quizStore = useQuizStore();
const quiz = computed(() => quizStore.quiz);
const results = computed(() => quizStore.quizResults);
</script>
