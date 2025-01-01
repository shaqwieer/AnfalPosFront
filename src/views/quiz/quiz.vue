<template>
    <div class="card card-w-title flex flex-column gap-4 min-h-full">
        <ProgressBar :value="(currentQuestionIndex / quiz.questions.length) * 100" :showValue="false"> </ProgressBar>
        <div class="flex flex-row justify-content-between align-items-center">
            <span class="text-3xl font-bold text-700">Quiz 1</span>
            <span class="text-2xl font-semibold text-primary-600"> {{ currentQuestionIndex }}/{{ quiz.questions.length }} </span>

            <RadialProgress v-if="quiz.mode != 0" :diameter="55" :completed-steps="quiz.mode == 2 ? fullTime - totalTime : timer" :total-steps="fullTime" startColor="#6366f1" stopColor="#6366f1" strokeWidth="5" innerStrokeWidth="5">
                {{ quiz.mode == 1 ? timer : parseInt(totalTime / 60) + (totalTime % 60 < 10 ? ':0' : ':') + (totalTime % 60) }}
            </RadialProgress>
        </div>

        <div v-if="quizStore.loading" class="loader">
            <div class="spinner">
                <span></span>
            </div>
        </div>
        <div v-else-if="!isStarted" class="loader">
            <Button @click="StartQuiz">{{ t('quizPage.startQuizButton') }}</Button>
        </div>
        <question
            v-else-if="currentQuestionIndex < quiz.questions.length"
            :key="currentQuestionIndex"
            v-model="quizStore.quizResults.Answers[currentQuestionIndex].answer"
            :question="quiz.questions[currentQuestionIndex]"
            :next="nextQuestion"
            :prev="prevQuestion"
            :finish="endQuiz"
            :mode="quiz.mode"
            :final="currentQuestionIndex + 1 == quiz.questions.length"
        />
        <resultsComp v-else-if="results"> </resultsComp>
        <div v-else class="loader gap-4">
            <Button @click="">{{ t('quizPage.ExitQuizButton') }}</Button>
            <Button @click="showResults">{{ t('quizPage.showResultsButton') }}</Button>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import question from '@/views/quiz/question.vue';
import resultsComp from '@/views/quiz/results.vue';
import { useQuizStore } from '@/stores/quizStore.js';
import RadialProgress from 'vue3-radial-progress';
import { useI18n } from 'vue-i18n'; // Import useI18n hook
const { t } = useI18n();
const route = useRoute();
const quizStore = useQuizStore();
const quiz = computed(() => quizStore.quiz);
const currentQuestionIndex = ref(0);
const userAnswer = ref(null);
const timer = ref(0);
const fullTime = ref(0);
const totalTime = ref(0);
const timeInterval = ref(null);
const nextQuestion = () => {
    if (quiz.value.mode == 1) {
        clearInterval(timeInterval.value);
        timer.value = fullTime.value;
        timeInterval.value = setInterval(() => {
            quizStore.quizResults.Answers[currentQuestionIndex.value].time++;
            totalTime.value--;
            timer.value--;
            if (timer.value <= 0) {
                nextQuestion();
            }
        }, 1000);
    } else {
        timer.value = 0;
    }
    quizStore.quizResults.Answers[currentQuestionIndex.value].correct =
        quizStore.quizResults.Answers[currentQuestionIndex.value].answer == quiz.value.questions[currentQuestionIndex.value].CorrectAnswer || quiz.value.questions[currentQuestionIndex.value].CorrectAnswer == null;
    currentQuestionIndex.value++;
};
const prevQuestion = () => {
    timer.value = 0;
    currentQuestionIndex.value--;
};
const endQuiz = () => {
    clearInterval(timeInterval.value);
    currentQuestionIndex.value++;
    quizStore.finishQuiz();
};
const isStarted = ref(false);
const StartQuiz = () => {
    isStarted.value = true;
    if (quiz.value.mode == 1) {
        fullTime.value = quiz.value.time / quiz.value.questions.length;
        totalTime.value = quiz.value.time / quiz.value.questions.length;
        timer.value = totalTime.value;
        timeInterval.value = setInterval(() => {
            quizStore.quizResults.Answers[currentQuestionIndex.value].time++;
            totalTime.value--;
            timer.value--;
            if (timer.value <= 0) {
                nextQuestion();
            }
        }, 1000);
    } else if (quiz.value.mode == 2) {
        fullTime.value = quiz.value.time;
        totalTime.value = quiz.value.time;
        timeInterval.value = setInterval(() => {
            quizStore.quizResults.Answers[currentQuestionIndex.value].time++;
            timer.value++;
            totalTime.value--;
            if (totalTime.value <= 0) {
                clearInterval(timeInterval.value);
            }
        }, 1000);
    } else {
        timeInterval.value = setInterval(() => {
            quizStore.quizResults.Answers[currentQuestionIndex.value].time++;
            timer.value++;
        }, 1000);
    }
};
const results = ref(false);
const showResults = () => {
    results.value = true;
};
onMounted(() => {
    quizStore.getQuiz(route.params.id);
    if (quiz.value.mode == 0) {
        StartQuiz();
    }
});
</script>
<style scoped>
.loader {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 70vh;
    width: 100%;
    background-color: transparent;
}
.loader .spinner {
    position: relative;
    top: -5%;
    width: 105px;
    height: 105px;
    background: transparent;
    border: 3px solid #161a1f;
    border-radius: 50%;
    text-align: center;
    line-height: 150px;
    font-family: sans-serif;
    font-size: 20px;
    color: #6366f1;
    letter-spacing: 4px;
    text-transform: uppercase;
    text-shadow: 0 0 10px #6366f1;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}
.loader .spinner:before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid #6366f1;
    border-right: 3px solid #6366f1;
    border-radius: 50%;
    animation: preloader-rotate-c 1s linear infinite;
}
.loader .spinner span {
    display: block;
    position: absolute;
    top: calc(50% - 2px);
    left: 50%;
    width: 50%;
    height: 4px;
    background: transparent;
    transform-origin: left;
    animation: preloader-rotate 1s linear infinite;
}
.loader .spinner span:before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    top: -6px;
    right: -8px;
    box-shadow: 0 0 20px #6366f1;
}

@keyframes preloader-rotate-c {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
@keyframes preloader-rotate {
    0% {
        transform: rotate(45deg);
    }
    100% {
        transform: rotate(405deg);
    }
}
</style>
