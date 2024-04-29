<template>
    <div id="map-wrap">
        <MapboxGLInit @mapboxGLLoaded="mapboxGLLoadedFunc" :center="center"></MapboxGLInit>
    </div>
    <div class="file-modal" v-show="showModal"></div>
    <ContentArea 
        :fileInfoList="fileInfoList" 
        @removeItemClick="removeItemClick"
        @draggableSortChange="draggableSortChange"
        ></ContentArea>
</template>

<script setup>
import { onMounted, onUnmounted, ref, toRaw } from 'vue';
import MapboxGLInit from '../Map/MapboxGLInit.vue';
import ContentArea from '../Form/ContentArea.vue'

import { zoomextent } from '../../core/geojson.io/lib/zoomextent';

import { DropFileTransfer } from '../../core/geojson.io/dom/DropFileTransfer'

import { FillStyleClass } from '../../core/mapbox/styles/fill';
import { CircleStyleClass } from '../../core/mapbox/styles/circle';
import { LineStyleClass } from '../../core/mapbox/styles/line';
import VoxelRender  from '../../core/mapbox/model/VoxelRender/VoxelRender';

import { VoxelFormat } from '../../core/parseFile/Voxel/VoxelFormat';

import { throttle, debounce } from 'lodash';

const center = ref([104.1465432836781, 30.857102559661133]);

const showModal = ref(false);

const mapboxGLLoadedFunc = (map) => {
    console.log('mapboxGLLoadedFunc ==>', map)
    map.on('click', (event) => {
        console.log('@click ==>', event.lngLat);
    })
    addMapboxLayer(map);
}

let dft;

const fileInfoList = ref([]);

const createFileInfo = (instance, fd) => {
    return {
        fd: fd,
        instance: toRaw(instance),
        status: {
            showLayer: true,
            openEditor: false
        }
    }
}

const addFileInfo = (instance, fd) => {
    fileInfoList.value.push(createFileInfo(instance, fd));
}

const removeFileInfo = (fileInfo) => {
    const index = fileInfoList.value.findIndex(info => info === fileInfo);

    fileInfoList.value.splice(index, 1);
    
    if (fileInfo.instance.isThree) {
        fileInfo.instance.removeData(fileInfo.fd.id);
    } else {
        fileInfo.instance.removeLayer();
    }

}

const moveFileInfo = (id, beforeId) => {
    const map = window.mapIns;
    if (map) {
        const layers = map.getStyle().layers;
        const index = layers.findIndex(layer => layer.id === id);
        if (index < 0) {
            new Error("Window not exist map instance.")
        } 
        map.moveLayer(id, beforeId);
    } else {
        new Error("Window not exist map instance.")
    }
}

const removeItemClick = (layer) => {
    removeFileInfo(layer);
}

const draggableSortChange = ({ id, beforeId }) => {
    moveFileInfo(id, beforeId);
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
        
        let fileInfo;
        if (shapeType === 'point') {
            fileInfo = new CircleStyleClass(fd.name, map, geojson);
        } else if (shapeType.includes('line')) {
            fileInfo = new LineStyleClass(fd.name, map, geojson);
        } else if (shapeType.includes('poly')) {
            fileInfo= new FillStyleClass(fd.name, map, geojson);
        }

        fileInfo.addLayer();

        addFileInfo(fileInfo, fd);

        zoomextent(map, geojson);
    })

    let voxelRender;
    let bbox = [];
    const _fitBounds =  throttle((map, bbox) => {
        map.fitBounds(bbox, { padding: 50, duration: 1000 } );
    }, 1000)

    dft.on('zip-data', (data) => {
        console.log('zip-data ==>', data);
        const fd = data.fd;

        const instance = VoxelFormat.parser(data.data);
        console.log('VoxelFormat ==>', instance);

        const volume = {
            id: 'voxel-'+Date.now(),
            minLongitude: instance.header.leftLongitude / 10000,
            minLatitude: instance.header.bottomLatitude / 10000,
            maxLongitude: instance.header.rightLongitude / 10000,
            maxLatitude: instance.header.topLatitude / 10000,
            data: instance.voxelData.slice(0, instance.voxelData.length),
            width:  instance.header.horDataCnt,
            height: instance.header.verDataCnt,
            depth:  instance.header.levelCnt,
            cutHeight: 500
        }
        console.log('volume ==>', volume)
        if (!voxelRender || voxelRender.isDispose) {
            voxelRender = new VoxelRender(fd.name + '-' + fd.size, map);
        }
        voxelRender.addData(volume);

        fd.id = volume.id;

        addFileInfo(voxelRender, fd);

        // map.fitBounds(
        //     [ volume.minLongitude, volume.minLatitude, volume.maxLongitude, volume.maxLatitude ], 
        //     { padding: 50, duration: 1000 }
        // );

        bbox[0] = volume.minLongitude;
        bbox[1] = volume.minLatitude;
        bbox[2] = volume.maxLongitude;
        bbox[3] = volume.maxLatitude;

        _fitBounds(map, bbox);
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
  