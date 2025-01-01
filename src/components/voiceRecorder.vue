<template>
    <div class="flex">
        <div
            v-if="primeVue"
            class="relative flex  gap-1 align-items-center max-w-min"
        >
            <Button
                v-if="mediaRecorder && !isPaused && pausable"
                :disabled="sendingAudio"
                @click="pauseRecording"
                icon="pi pi-pause"
                outlined
                rounded
                severity="warning"
                v-tooltip.top="pauseText"
            ></Button>
            <Button
                v-if="!mediaRecorder || isPaused"
                :disabled="sendingAudio"
                @click="startRecording"
                icon="pi pi-microphone"
                outlined
                rounded
                severity="success"
                v-tooltip.top="startText"
            ></Button>
            <Button
                v-if="mediaRecorder"
                :disabled="sendingAudio"
                @click="stopRecording"
                icon="pi pi-stop-circle"
                outlined
                rounded
                severity="danger"
                v-tooltip.top="stopText"
            ></Button>
            <audio
                controls
                v-if="audioUrl && !sendingAudio"
                :src="audioUrl"
            ></audio>
            <div
                v-else
                class="flex flex-row-reverse gap-1 align-items-center w-[300px] h-[54px] p-4 border-circle surface-0"
            >
                <span v-if="sendingAudio">{{ sendingText }}</span>
                <span v-else
                    >{{
                        recordingLength % 60 < 10
                            ? parseInt(recordingLength / 60) +
                              ":" +
                              "0" +
                              (recordingLength % 60)
                            : parseInt(recordingLength / 60) +
                              ":" +
                              (recordingLength % 60)
                    }}<span v-if="showMax"
                        >/{{
                            maxRecordingTime % 60 < 10
                                ? parseInt(maxRecordingTime / 60) +
                                  ":" +
                                  "0" +
                                  (maxRecordingTime % 60)
                                : parseInt(maxRecordingTime / 60) +
                                  ":" +
                                  (maxRecordingTime % 60)
                        }}</span
                    ></span
                >
                <ProgressBar
                    v-if="(pausable && isPaused) || showMax"
                    :value="(recordingLength / props.maxRecordingTime) * 100"
                    style="height: 6px; width: 235px"
                    >{{ "" }}</ProgressBar
                >
                <ProgressBar
                    v-else-if="mediaRecorder || sendingAudio"
                    mode="indeterminate"
                    style="height: 6px; width: 235px"
                ></ProgressBar>
                <ProgressBar
                    v-else
                    :value="0"
                    style="height: 6px; width: 235px"
                ></ProgressBar>
            </div>
            <Button
                v-if="audioUrl"
                :disabled="sendingAudio"
                @click="deleteAudio"
                icon="pi pi-trash"
                outlined
                rounded
                severity="danger"
                v-tooltip.top="deleteText"
            />
            <Button
                v-if="audioUrl"
                :disabled="sendingAudio"
                @click="sendAudioCallback"
                icon="pi pi-send"
                outlined
                rounded
                severity="success"
                v-tooltip.top="sendText"
            />
        </div>
        <div
            v-else
            class="relative flex flex-row-reverse gap-1 items-center max-w-min"
        >
            <div
                v-if="mediaRecorder && !isPaused && pausable"
                class="group flex relative justify-center"
            >
                <button
                    :disabled="sendingAudio"
                    @click="pauseRecording"
                    type="button"
                    class="text-orange-500 border border-orange-500 hover:bg-orange-300 focus:ring-4 focus:outline-none focus:ring-orange-500 font-medium rounded-full text-sm p-2 text-center inline-flex items-center dark:border-orange-500 dark:text-orange-500 dark:focus:ring-orange-500 dark:hover:bg-orange-500"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            d="M8 5V19M16 5V19"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>

                <span
                    class="group-hover:opacity-100 transition-opacity bg-surface-700 px-3 py-2 text-sm text-white rounded-md absolute -translate-y-full opacity-0 m-4 mx-auto"
                    >{{ pauseText }}</span
                >
            </div>
            <div
                v-if="!mediaRecorder || isPaused"
                class="group flex relative justify-center"
            >
                <button
                    :disabled="sendingAudio"
                    @click="startRecording"
                    type="button"
                    class="text-green-500 border border-green-500 hover:bg-green-300 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-full text-sm p-2 text-center inline-flex items-center dark:border-green-500 dark:text-green-500 dark:focus:ring-green-500 dark:hover:bg-green-500"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <rect
                            x="9"
                            y="3"
                            width="6"
                            height="11"
                            rx="3"
                            stroke-width="1.5"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M5 11C5 12.8565 5.7375 14.637 7.05025 15.9497C8.36301 17.2625 10.1435 18 12 18C13.8565 18 15.637 17.2625 16.9497 15.9497C18.2625 14.637 19 12.8565 19 11"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M12 21V19"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <span
                    class="group-hover:opacity-100 transition-opacity bg-surface-700 px-3 py-2 text-sm text-white rounded-md absolute -translate-y-full opacity-0 m-4 mx-auto"
                    >{{ startText }}</span
                >
            </div>
            <div
                v-if="mediaRecorder"
                class="group flex relative justify-center"
            >
                <button
                    :disabled="sendingAudio"
                    @click="stopRecording"
                    type="button"
                    class="text-red-500 border border-red-500 hover:bg-red-300 focus:ring-4 focus:outline-none focus:ring-red-500 font-medium rounded-full text-sm p-2 text-center inline-flex items-center dark:border-red-500 dark:text-red-500 dark:focus:ring-red-500 dark:hover:bg-red-500"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-7 w-7"
                        fill="red"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            d="M12 21C10.22 21 8.47991 20.4722 6.99987 19.4832C5.51983 18.4943 4.36628 17.0887 3.68509 15.4442C3.0039 13.7996 2.82567 11.99 3.17294 10.2442C3.5202 8.49836 4.37737 6.89472 5.63604 5.63604C6.89472 4.37737 8.49836 3.5202 10.2442 3.17294C11.99 2.82567 13.7996 3.0039 15.4442 3.68509C17.0887 4.36628 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C21 14.387 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.387 21 12 21ZM12 4.5C10.5166 4.5 9.0666 4.93987 7.83323 5.76398C6.59986 6.58809 5.63856 7.75943 5.07091 9.12988C4.50325 10.5003 4.35473 12.0083 4.64411 13.4632C4.9335 14.918 5.64781 16.2544 6.6967 17.3033C7.7456 18.3522 9.08197 19.0665 10.5368 19.3559C11.9917 19.6453 13.4997 19.4968 14.8701 18.9291C16.2406 18.3614 17.4119 17.4001 18.236 16.1668C19.0601 14.9334 19.5 13.4834 19.5 12C19.5 10.0109 18.7098 8.10323 17.3033 6.6967C15.8968 5.29018 13.9891 4.5 12 4.5Z"
                        />
                        <path
                            d="M14.5 8H9.5C8.67157 8 8 8.67157 8 9.5V14.5C8 15.3284 8.67157 16 9.5 16H14.5C15.3284 16 16 15.3284 16 14.5V9.5C16 8.67157 15.3284 8 14.5 8Z"
                        />
                    </svg>
                </button>
                <span
                    class="group-hover:opacity-100 transition-opacity bg-surface-700 px-3 py-2 text-sm text-white rounded-md absolute -translate-y-full opacity-0 m-4 mx-auto"
                    >{{ stopText }}</span
                >
            </div>
            <audio
                controls
                v-if="audioUrl && !sendingAudio"
                :src="audioUrl"
            ></audio>
            <div
                v-else
                class="flex flex-row-reverse gap-1 items-center w-[300px] h-[54px] p-4 rounded-full bg-surface-0"
            >
                <span v-if="sendingAudio">{{ sendingText }}</span>
                <span v-else
                    >{{
                        recordingLength % 60 < 10
                            ? parseInt(recordingLength / 60) +
                              ":" +
                              "0" +
                              (recordingLength % 60)
                            : parseInt(recordingLength / 60) +
                              ":" +
                              (recordingLength % 60)
                    }}<span v-if="showMax"
                        >/{{
                            maxRecordingTime % 60 < 10
                                ? parseInt(maxRecordingTime / 60) +
                                  ":" +
                                  "0" +
                                  (maxRecordingTime % 60)
                                : parseInt(maxRecordingTime / 60) +
                                  ":" +
                                  (maxRecordingTime % 60)
                        }}</span
                    ></span
                >
                <div
                    v-if="(pausable && isPaused) || showMax"
                    class="bg-surface-200 rounded-full h-1.5 mb-4 dark:bg-surface-700"
                    style="width: 235px"
                >
                    <div
                        class="bg-primary-600 h-1.5 rounded-full dark:bg-primary-500"
                        :style="{
                            width:
                                (recordingLength / props.maxRecordingTime) *
                                    100 +
                                '%',
                        }"
                    ></div>
                </div>

                <div
                    v-else-if="mediaRecorder || sendingAudio"
                    class="bg-primary-500 rounded-full h-1.5 mb-4 dark:bg-surface-700 animate-pulse"
                    style="width: 235px"
                >
                    <div
                        class="bg-primary-600 h-1.5 rounded-full dark:bg-primary-500"
                        :style="{ width: '0%' }"
                    ></div>
                </div>
                <div
                    v-else
                    class="bg-surface-200 rounded-full h-1.5 mb-4 dark:bg-surface-700"
                    style="width: 235px"
                >
                    <div
                        class="bg-primary-600 h-1.5 rounded-full dark:bg-primary-500"
                        :style="{ width: '0%' }"
                    ></div>
                </div>
            </div>
            <div v-if="audioUrl" class="group flex relative justify-center">
                <button
                    :disabled="sendingAudio"
                    @click="deleteAudio"
                    type="button"
                    class="text-red-500 border border-red-500 hover:bg-red-300 focus:ring-4 focus:outline-none focus:ring-red-500 font-medium rounded-full text-sm p-2 text-center inline-flex items-center dark:border-red-500 dark:text-red-500 dark:focus:ring-red-500 dark:hover:bg-red-500"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <span
                    class="group-hover:opacity-100 transition-opacity bg-surface-700 px-3 py-2 text-sm text-white rounded-md absolute -translate-y-full opacity-0 m-4 mx-auto"
                    >{{ deleteText }}</span
                >
            </div>
            <div v-if="audioUrl" class="group flex relative justify-center">
                <button
                    :disabled="sendingAudio"
                    @click="sendAudioCallback"
                    type="button"
                    class="text-green-500 border border-green-500 hover:bg-green-300 focus:ring-4 focus:outline-none focus:ring-green-500 font-medium rounded-full text-sm p-2 text-center inline-flex items-center dark:border-green-500 dark:text-green-500 dark:focus:ring-green-500 dark:hover:bg-green-500"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            d="M10.3009 13.6949L20.102 3.89742M10.5795 14.1355L12.8019 18.5804C13.339 19.6545 13.6075 20.1916 13.9458 20.3356C14.2394 20.4606 14.575 20.4379 14.8492 20.2747C15.1651 20.0866 15.3591 19.5183 15.7472 18.3818L19.9463 6.08434C20.2845 5.09409 20.4535 4.59896 20.3378 4.27142C20.2371 3.98648 20.013 3.76234 19.7281 3.66167C19.4005 3.54595 18.9054 3.71502 17.9151 4.05315L5.61763 8.2523C4.48114 8.64037 3.91289 8.83441 3.72478 9.15032C3.56153 9.42447 3.53891 9.76007 3.66389 10.0536C3.80791 10.3919 4.34498 10.6605 5.41912 11.1975L9.86397 13.42C10.041 13.5085 10.1295 13.5527 10.2061 13.6118C10.2742 13.6643 10.3352 13.7253 10.3876 13.7933C10.4468 13.87 10.491 13.9585 10.5795 14.1355Z"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <span
                    class="group-hover:opacity-100 transition-opacity bg-surface-700 px-3 py-2 text-sm text-white rounded-md absolute -translate-y-full opacity-0 m-4 mx-auto"
                    >{{ sendText }}</span
                >
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from "vue";
const audioUrl = defineModel({ required: false, default: null });
const props = defineProps({
    startText: {
        type: String,
        default: "تسجيل",
    },
    pauseText: {
        type: String,
        default: "وقف",
    },
    stopText: {
        type: String,
        default: "انهاء",
    },
    deleteText: {
        type: String,
        default: "مسح",
    },
    sendText: {
        type: String,
        default: "ارسال",
    },
    sendingText: {
        type: String,
        default: "...جاري الارسال",
    },
    pausable: {
        type: Boolean,
        default: true,
    },
    maxRecordingTime: {
        type: Number,
        default: 30,
    },
    showMax: {
        type: Boolean,
        default: true,
    },
    primeVue: {
        type: Boolean,
        default: true,
    },
});

const emits = defineEmits(["send"]);

let mediaRecorder = null;
let audioChunks = [];
let streamBeingCaptured = null;
const recordingLength = ref(0);
let timeCounterInterval = null;

const startRecording = () => {
    if (mediaRecorder) {
        mediaRecorder.resume();
        timeCounterInterval = setInterval(() => {
            recordingLength.value++;
            if (recordingLength.value >= props.maxRecordingTime)
                stopRecording();
        }, 1000);
        isPaused.value = false;
        return;
    }
    deleteAudio();
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamBeingCaptured = stream;
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener("dataavailable", (event) => {
            audioChunks.push(event.data);
        });
        mediaRecorder.start();
        timeCounterInterval = setInterval(() => {
            recordingLength.value++;
            if (recordingLength.value >= props.maxRecordingTime)
                stopRecording();
        }, 1000);
    });
};

const audioBlob = ref(null);
// const stopRecording = () => {
//     let mimeType = mediaRecorder.mimeType;
//     mediaRecorder.addEventListener("stop", () => {
//         clearInterval(timeCounterInterval);
//         audioBlob.value = new Blob(audioChunks, { type: mimeType });
//         audioUrl.value = URL.createObjectURL(audioBlob.value);
//     });
//     mediaRecorder.stop();
//     streamBeingCaptured.getTracks().forEach((track) => track.stop());
//     resetValues();
// };
let fileWithExtension=null;
const stopRecording = () => {
    let mimeType = mediaRecorder.mimeType;
    mediaRecorder.addEventListener("stop", () => {
        clearInterval(timeCounterInterval);
        audioBlob.value = new Blob(audioChunks, { type: mimeType });

        const fileExtension = ".webm";
        const fileName = `recording${fileExtension}`;
        audioUrl.value = URL.createObjectURL(audioBlob.value);
         fileWithExtension = new File([audioBlob.value], fileName, { type: mimeType });
    });
    mediaRecorder.stop();
    streamBeingCaptured.getTracks().forEach((track) => track.stop());
    resetValues();
};

const isPaused = ref(false);
const pauseRecording = () => {
    mediaRecorder.pause();
    clearInterval(timeCounterInterval);
    isPaused.value = true;
};

const resetValues = () => {
    recordingLength.value = 0;
    audioChunks = [];
    streamBeingCaptured = null;
    mediaRecorder = null;
};

const deleteAudio = () => {
    audioUrl.value = null;
    audioBlob.value = null;
    resetValues();
};

const sendingAudio = ref(false);
const sendAudioCallback = () => {
    sendingAudio.value = true;
    // emits("send", audioBlob.value);
    emits("send", fileWithExtension);

    sendingAudio.value = false;
};
</script>
<style scoped>
audio::-webkit-media-controls-play-button,
audio::-webkit-media-controls-panel {
    background-color: #fff;
    color: #000;
}
</style>
