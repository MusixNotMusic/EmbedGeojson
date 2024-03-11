<template>
    <div id="map-wrap">
        <MapboxGLInit @mapboxGLLoaded="mapboxGLLoadedFunc" :center="center"></MapboxGLInit>
    </div>
    <div class="file-modal" v-show="showModal"></div>
    <ContentArea 
        :fileLayerList="fileLayerList" 
        @removeItemClick="removeItemClick"
        @draggableSortChange="draggableSortChange"
        ></ContentArea>
</template>

<script setup>
import { onMounted, onUnmounted, ref, toRaw } from 'vue';
import MapboxGLInit from '../Map/MapboxGLInit.vue';
import ContentArea from '../Form/ContentArea.vue'
import { drawCircle } from '../../core/geojson.io/layer/circle';
import { zoomextent } from '../../core/geojson.io/lib/zoomextent';

import { DropFileTransfer } from '../../core/geojson.io/dom/DropFileTransfer'

import { FillStyleClass } from '../../core/mapbox/styles/fill';
import { CircleStyleClass } from '../../core/mapbox/styles/circle';
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

const removeFileLayer = (fileLayer) => {
    const index = fileLayerList.value.findIndex(lay => lay === fileLayer);
    fileLayerList.value.splice(index, 1);
    fileLayer.layer.removeLayer();
}

const moveLayer = (id, beforeId) => {
    const map = window.mapIns;
    let _beforeId = beforeId;
    if (map) {
        const layers = map.getStyle().layers;
        const size = layers.length - 1;
        const index = layers.findIndex(layer => layer.id === id);
        if (index < 0) {
            new Error("Window not exist map instance.")
        } 
        // else {
        //     if (!_beforeId) {
        //         _beforeId = index + 1 > size ? null : layers[index + 1].id;
        //     }
        // }
        map.moveLayer(id, beforeId);
    } else {
        new Error("Window not exist map instance.")
    }
}

const removeItemClick = (layer) => {
    removeFileLayer(layer);
}

const draggableSortChange = ({ id, beforeId }) => {
    moveLayer(id, beforeId);
}   

const addMapboxLayer = (map) => {
    window.mapIns = map;

    dft = new DropFileTransfer();
    
    dft.on('geojson-data', (data) => {
        const geojson = data.data;
        const fd = data.fd;

        console.log('geojson ==>', geojson);
        console.log('fd ==>', fd);

        const type = geojson.features[0].geometry.type;

        const shapeType = type.toLocaleLowerCase();
        
        let fileLayer;
        if (shapeType === 'point') {
            fileLayer = new CircleStyleClass(fd.name, map, geojson);
        } else if (shapeType.includes('line')) {
            fileLayer = new LineStyleClass(fd.name, map, geojson);
        } else if (shapeType.includes('poly')) {
            fileLayer= new FillStyleClass(fd.name, map, geojson);
        }

        fileLayer.addLayer();

        addFileLayer(fileLayer, fd);

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
  