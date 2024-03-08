<template>
    <div class="content-area">
        <div class="content-head">图层：</div>
        <div class="content-item" v-for="(file, index) in fileLayerList" :key="index">
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
            </div>
        </div>
    </div>
    <Dialog v-if="currentFile && currentFile.status.openEditor" :file="currentFile" :show="currentFile.status.openEditor"></Dialog>
</template>
<script>
import { ref } from 'vue';
import Dialog from './Dialog.vue'
export default {
    name: 'contentArea',
    components: { Dialog },
    props: {
        fileLayerList: {
            type: Array,
            default: () => []
        }
    },
    setup (props) {
        const showLayerClickHandle = (fileItem) => {
            const layer = fileItem.layer;
            fileItem.status.showLayer = !fileItem.status.showLayer;
            const show = fileItem.status.showLayer;
            if (layer) {
                layer.showLayer(show);
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
                } else {
                    currentFile.value = null;
                }
            }, 100)
        }

        return {
            currentFile,
            showLayerClickHandle,
            editClickHandle
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
            background: rgb(94, 144, 209);
            color: beige;
            padding-left: 10px;
            font-size: 16px;
        }

        .content-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0px 20px 0px 20px;
            height: 28px;
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