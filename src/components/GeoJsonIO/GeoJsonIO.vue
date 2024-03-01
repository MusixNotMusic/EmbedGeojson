<template>
    <div id="map-wrap">
        <MapboxGLInit @mapboxGLLoaded="mapboxGLLoadedFunc" :center="center"></MapboxGLInit>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import MapboxGLInit from '../Map/MapboxGLInit.vue';
import { geojsonIO } from '../../core/geojson.io/ui/dnd';
import { drawCircle } from '../../core/geojson.io/layer/circle';
import { drawLine } from '../../core/geojson.io/layer/line';

const mapboxGLLoadedFunc = (map) => {
    console.log('mapboxGLLoadedFunc ==>', map)
    addDemoModelLayer(map);
}

const center = ref([104.1465432836781, 30.857102559661133]);
const addDemoModelLayer = (map) => {
    geojsonIO(map, (geojson) => {
        console.log('geojson ==>', geojson)
        const type = geojson.features[0].geometry.type;

        if (type.toLocaleLowerCase() === 'point') {
            drawCircle(map, geojson);
        } else {
            drawLine(map, geojson);
        }
    })
}

onMounted(() => {
})

onUnmounted(() => {
})
    
</script>

<style>
.dragover {
    background: rgba(255, 255, 255, 0.5);
}
</style>
  