<template>
    <component :is="tag"><slot></slot>{{ counter }}</component>
</template>
<script setup>
import { ref, onMounted } from 'vue';
const props = defineProps({
    tag: {
        type: String,
        required: false,
        default: 'span'
    },
    value: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: false,
        default: 1000
    },
    force: {
        type: Boolean,
        required: false,
        default: false
    }
});
const counter = ref(0);
const interval = ref(props.duration / props.value);
const jumpInterval = ref((props.value / props.duration) * 100);
onMounted(() => {
    let i = 0;
    const intervalId = setInterval(
        () => {
            counter.value = i;
            i += props.force ? jumpInterval.value : 1;
            if (i > props.value) {
                clearInterval(intervalId);
                counter.value = props.value;
            }
        },
        props.force ? 100 : Math.round(interval.value)
    );
});
</script>
