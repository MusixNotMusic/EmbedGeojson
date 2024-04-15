<template>
    <router-view />
</template>

<script setup>
import { ColorSystem }from '../core/color/ColorSystem'
import { checkWebGL, queryWebGLExtensions } from 'webgl-device-check';
const colorSystem = new ColorSystem();
colorSystem.initColorTexture();
window['__YW__'] = {}
window['__YW__'].colorSystem = colorSystem;

checkWebGL()
queryWebGLExtensions()
</script>

<style scoped>
</style>
