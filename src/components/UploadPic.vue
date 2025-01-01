<template>
    <div class="flex flex-column w-full p-3 border-round-xl surface-200">
        <img
            :src="img != '' ? img : gender ? 'https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG.png' : 'https://cdn4.iconfinder.com/data/icons/women-avatars-icons-set-2/300/16-512.png'"
            alt="profile"
            class="w-full border-circle border-2 border-300 surface-0"
        />
    </div>
    <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" chooseLabel="Upload Image" :auto="true" customUpload @uploader="customBase64Uploader" />
</template>
<script setup>

</script>
