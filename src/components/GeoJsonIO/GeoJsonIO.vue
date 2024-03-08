<template>
    <div id="map-wrap">
        <MapboxGLInit @mapboxGLLoaded="mapboxGLLoadedFunc" :center="center"></MapboxGLInit>
    </div>
    <div class="file-modal" v-show="showModal"></div>
    <ContentArea :fileLayerList="fileLayerList"></ContentArea>
</template>

<script setup>
import { onMounted, onUnmounted, ref, toRaw } from 'vue';
import MapboxGLInit from '../Map/MapboxGLInit.vue';
import ContentArea from '../Form/ContentArea.vue'
import { drawCircle } from '../../core/geojson.io/layer/circle';
import { zoomextent } from '../../core/geojson.io/lib/zoomextent';

import { DropFileTransfer } from '../../core/geojson.io/dom/DropFileTransfer'

import { FillStyleClass } from '../../core/mapbox/styles/fill';
import { LineStyleClass } from '../../core/mapbox/styles/line';

const center = ref([104.1465432836781, 30.857102559661133]);

const showModal = ref(false);

const mapboxGLLoadedFunc = (map) => {
    console.log('mapboxGLLoadedFunc ==>', map)
    addMapboxLayer(map);
}

let dft;

const fileLayerList = ref([]);

const createFileLayer = (mapLayer, fd) => {
    return {
        fd: fd,
        layer: toRaw(mapLayer),
        status: {
            showLayer: true,
            openEditor: false
        }
    }
}

const addFileLayer = (layer, fd) => {
    fileLayerList.value.push(createFileLayer(layer, fd));
}

const removeFileLayer = (layer) => {
    const index = fileLayerList.value.findIndex(lay => lay === layer);
    fileLayerList.value.splice(index, 1);
}

const addMapboxLayer = (map) => {
    dft = new DropFileTransfer();
    dft.on('geojson-data', (data) => {
        const geojson = data.data;
        const fd = data.fd;

        console.log('geojson ==>', geojson);
        console.log('fd ==>', fd);

        const type = geojson.features[0].geometry.type;

        const shapeType = type.toLocaleLowerCase();
        
        if (shapeType === 'point') {
            drawCircle(map, geojson);
        } else if (shapeType.includes('line')) {
            const lineLayer = new LineStyleClass(fd.name, map, geojson);
            console.log('line ==>', lineLayer);
            lineLayer.addLayer();

            addFileLayer(lineLayer, fd);
        } else if (shapeType.includes('poly')) {
            const fillLayer = new FillStyleClass(fd.name, map, geojson);
            console.log('fill ==>', fillLayer);
            fillLayer.addLayer();

            addFileLayer(fillLayer, fd);
        }

        zoomextent(map, geojson);
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
  