<template>
    <div id="map-wrap">
        <MapboxGLInit @mapboxGLLoaded="mapboxGLLoadedFunc" :center="center"></MapboxGLInit>
    </div>
    <div class="file-modal" v-show="showModal"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import MapboxGLInit from '../Map/MapboxGLInit.vue';
import { geojsonIO } from '../../core/geojson.io/ui/dnd';
import { drawCircle } from '../../core/geojson.io/layer/circle';
import { drawLine } from '../../core/geojson.io/layer/line';
import { zoomextent } from '../../core/geojson.io/lib/zoomextent';

import { DropFileTransfer } from '../../core/geojson.io/dom/DropFileTransfer'

import { FillStyleClass } from '../../core/mapbox/styles/fill';
import { LineStyleClass } from '../../core/mapbox/styles/line';

const showModal = ref(false);

const mapboxGLLoadedFunc = (map) => {
    console.log('mapboxGLLoadedFunc ==>', map)
    addDemoModelLayer(map);
}

let dft;

const center = ref([104.1465432836781, 30.857102559661133]);
const addDemoModelLayer = (map) => {
    // geojsonIO(map, (geojson) => {
    //     console.log('geojson ==>', geojson)
    //     const type = geojson.features[0].geometry.type;

    //     if (type.toLocaleLowerCase() === 'point') {
    //         drawCircle(map, geojson);
    //     } else {
    //         drawLine(map, geojson);
    //     }
    // })

    dft = new DropFileTransfer();
    dft.on('geojson-data', (data) => {
        const geojson = data.data;
        zoomextent(map, geojson);
        console.log('geojson ==>', geojson)
        const type = geojson.features[0].geometry.type;
        const shapeType = type.toLocaleLowerCase();
        if (shapeType === 'point') {
            drawCircle(map, geojson);
        } else if (shapeType.includes('line')) {
            // drawLine(map, geojson);
            // const fillLayer = new FillStyleClass('fill-demo', map, geojson);
            const lineLayer = new LineStyleClass('line-demo', map, geojson);
            console.log('line ==>', lineLayer);
            lineLayer.addLayer();
        } else if (shapeType.includes('poly')) {
            const fillLayer = new FillStyleClass('fill-demo', map, geojson);
            console.log('fill ==>', fillLayer);
            fillLayer.addLayer();
        }
    })

    dft.on('drag-enter', () => { showModal.value = true })
    dft.on('drag-leave', () => { showModal.value = false })
    dft.on('drop-over',  () => { showModal.value = false })
}

onMounted(() => {
    dft = new DropFileTransfer();
})

onUnmounted(() => {
    if(dft) dft.dispose();
})
    
</script>

<style lang="scss" scoped>
.dragover {
    background: rgba(255, 255, 255, 0.5);
}

.file-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.6);
    pointer-events: none;
}
</style>
  