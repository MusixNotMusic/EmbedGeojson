<template>
    <div class="dialog" v-drag="{handle: '.dialog-head' }">
        <div class="dialog-head">
            <span>{{ file.fd.name }}</span>
            <el-icon @click="closeClickHandle" class="pointer"><Close></Close></el-icon>
        </div>
        <div class="dialog-item" v-for="(params, index) in file.paramsList" :key="index">
            <div class="dialog-item-name">
                <span>{{ params.i18n }}：</span>
            </div>
            <div class="dialog-item-value">
                <div v-if="params.formType === 'slider'">
                    <el-slider v-model="params.value" 
                        :min="params.min" 
                        :max="params.max" 
                        :step="params.step"
                        @change="updateMapLayerChange(params)"></el-slider>
                </div>

                <div class="dialog-item-start" v-if="params.formType === 'colorPicker'">
                    <el-color-picker v-model="params.value" show-alpha  @change="updateMapLayerChange(params)"/>
                </div>

                <div class="dialog-item-start" v-if="params.formType === 'input'">
                    <el-input v-model="params.value"  :type="params.inputType"  @change="updateMapLayerChange(params)"/>
                </div>

                <div class="dialog-item-start" v-if="params.formType === 'inputNumber'">
                    <el-input-number v-model="params.value" :min="params.min" :max="params.max"  @change="updateMapLayerChange(params)"/>
                </div>

                <div class="dialog-item-start" v-if="params.formType === 'select'">
                    <el-select v-model="params.value" @change="updateMapLayerChange(params)">
                        <el-option v-for="item in params.list" :key="item.value" :label="item.name" :value="item"></el-option>
                    </el-select>
                </div>
            </div>
        </div>
    </div>
   
</template>
<script>
import { cloneDeep, isObject } from 'lodash';
import { identifyFormType } from './form';
import { toCamelCase } from '../../core/mapbox/utils';
export default {
    name: 'Dialog',
    props: {
        file: {
            type: Object,
            default: () => {}
        }
    },
    setup (props) {

        if (!props.file.paramsList) {
            props.file.paramsList = identifyFormType(cloneDeep(props.file.layer.paramsTable));
        }
        
        const showLayerClickHandle = (fileItem) => {
            const layer = fileItem.layer;
            fileItem.status.showLayer = !fileItem.status.showLayer;
            const show = fileItem.status.showLayer;
            if (layer) {
                layer.showLayer(show);
            }
        }

        const closeClickHandle = () => {
            if (props.file) {
                props.file.status.openEditor = false;
            }
        }

        const updateMapLayerChange = (params) => {
            const name = params.name;
            let value = params.value;
            if (isObject(value)) {
                value = value.value;
            }


            if (props.file) {
                const layer = props.file.layer;
                layer[toCamelCase('set-'+name)].bind(layer)(value);
            }

        }

        return {
            // paramsList,
            showLayerClickHandle,
            closeClickHandle,
            updateMapLayerChange
        }
    }
}
</script>
<style scoped lang="scss">
    .dialog {
        position: fixed;
        top: calc(50% - 150px);
        left: calc(50% - 200px);
        width: 400px;
        background: #fff;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;

        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;

        box-shadow: 2px 3px 4px 2px rgba(33, 17, 17, 0.4);
        padding-bottom: 10px;

        .dialog-head{
            display: flex;
            justify-content: space-between;
            align-items: center;
            // background: rgb(94, 144, 209);
            background: var(--head-bg-color);
            // background:radial-gradient( rgb(133, 193, 204), rgb(80, 115, 161) 40%, rgb(40, 108, 197) 100%); 
            color: beige;
            padding:5px 10px;
            font-size: 16px;
            cursor: move;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            margin-bottom: 10px;
        }

        .dialog-item {
            display: flex;
            align-items: center;
            padding: 0px 20px 0px 20px;
            height: 32px;
            column-gap: 5px;
            font-size: 14px;

            user-select: none;

            margin-bottom: 5px;

            .dialog-item-name {
                flex: 1;
                display: flex;
                align-items: center;
                height: 100%;
                column-gap: 5px;
            }
            .pointer {
                cursor: pointer;
            }

            .dialog-item-value {
                flex: 3;
                align-items: center;
                justify-content: flex-start;
                height: 100%;
                width: 100%;
            }

            .dialog-item-start {
                display: flex;
            }
        }

        .pointer {
            cursor: pointer;
        }

        .pointer:hover {
            background: orangered;
        }

    }

    ::v-deep(.el-color-picker__trigger) {
        width: 100px;
    }
</style>