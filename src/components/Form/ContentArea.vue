<template>
    <div class="content-area">
        <div class="content-head">图层：</div>
        <draggable :list="fileInfoList" @change="draggableSortChange" class="file-list">
            <div class="content-item" v-for="(file, index) in fileInfoList" :key="index">
                <div class="content-item-name">
                    <el-icon><CopyDocument /></el-icon>
                    <span>{{ file.fd.name }}</span>
                </div>
                <div class="content-item-operator">
                    <div class="content-item-editor">
                        <el-icon @click="editClickHandle(file)"><Edit class="pointer"/></el-icon>
                    </div>
                    <div class="content-item-view-layer">
                        <el-icon class="pointer" @click="showLayerClickHandle(file)">
                            <View v-if="file.status.showLayer" />
                            <Hide v-if="!file.status.showLayer"/>
                        </el-icon>
                    </div>
                    <div class="content-item-delete">
                        <el-icon class="pointer" @click="deleteItemLayer(file)"><Delete /></el-icon>
                    </div>
                </div>
            </div>
        </draggable>
    </div>
    <Dialog v-if="currentFile && currentFile.status.openEditor && currentFile.status.layer" :file="currentFile" :show="currentFile.status.openEditor"></Dialog>
</template>
<script>
import { ref } from 'vue';
import Dialog from './Dialog.vue'
import { VueDraggableNext } from 'vue-draggable-next';
export default {
    name: 'contentArea',
    components: { Dialog, draggable: VueDraggableNext, },
    props: {
        fileInfoList: {
            type: Array,
            default: () => []
        }
    },
    emits: ['removeItemClick', 'draggableSortChange'],
    setup (props, { emit }) {
        const showLayerClickHandle = (fileItem) => {
            const layer = fileItem.layer;
            fileItem.status.showLayer = !fileItem.status.showLayer;
            const show = fileItem.status.showLayer;
            if (layer) {
                layer.showLayer(show);
            }

            if (fileItem.instance) {
                fileItem.instance.showMesh(show, fileItem.fd.id);
            }
        }

        const currentFile = ref(null);

        const editClickHandle = (fileItem) => {
            if (currentFile.value && fileItem !== currentFile.value) {
                currentFile.value.status.openEditor = false;
            }
            setTimeout(() => {
                fileItem.status.openEditor = !fileItem.status.openEditor;
                if (fileItem.status.openEditor) {
                    currentFile.value = fileItem;
                    fileItem.instance.showGUI()
                } else {
                    currentFile.value = null;
                }

                if(fileItem.instance) {
                    fileItem.instance.showGUI(fileItem.status.openEditor);
                }
            }, 100)
        }

        const deleteItemLayer = (file) => {
            emit('removeItemClick', file)
        }

        const draggableSortChange = (event) => {
            // console.log('draggableSortChange', event)
            const size = props.fileInfoList.length;
            const id = props.fileInfoList[event.moved.newIndex].layer.id;
            const beforeId = event.moved.newIndex + 1 < size ?  props.fileInfoList[event.moved.newIndex + 1].layer.id : null;

            emit('draggableSortChange', { id, beforeId })
        }

        return {
            currentFile,
            showLayerClickHandle,
            editClickHandle,
            deleteItemLayer,
            draggableSortChange
        }
    }
}
</script>
<style scoped lang="scss">
    .content-area {
        position: fixed;
        top: 0px;
        left: 0px;
        width: 300px;
        height: 100vh;
        background: rgba(255, 255, 255, 0.6);
        .content-head{
            height: 32px;
            line-height: 32px;
            text-align: left;
            background:  var(--head-bg-color);;
            color: beige;
            padding-left: 10px;
            font-size: 16px;
        }

        .file-list {
            height: 100%;
            overflow-y: scroll;
        }

        .content-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0px 20px 0px 20px;
            height: 40px;
            column-gap: 5px;
            font-size: 14px;

            user-select: none;

            .content-item-name {
                display: flex;
                align-items: center;
                height: 100%;
                column-gap: 5px;
            }
            .pointer {
                cursor: pointer;
            }

            .content-item-operator {
                display: flex;
                align-items: center;
                height: 100%;
                column-gap: 5px;
            }
        }

        .content-item:hover {
            background: rgba(255, 255, 255, 0.9);
        }
    }
</style>