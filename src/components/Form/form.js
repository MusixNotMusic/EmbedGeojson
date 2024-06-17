import { cloneDeep } from 'lodash';

const dasharray = [
    { name: '-------', value:[1, 0] },
    { name: '- - - -', value:[1, 1] },
    { name: '-\u00a0\u00a0-\u00a0\u00a0-', value:[1, 2] },
    { name: '-\u00a0\u00a0\u00a0-\u00a0\u00a0\u00a0-', value:[1, 3] },
    { name: '-- -- --', value:[2, 1] },
]

export const table = {
    'color':            { i18n: '颜色',        formType: 'colorPicker' },
    'outline-color':    { i18n: '轮廓颜色',    formType: 'colorPicker' },
    'stroke-color':     { i18n: '边界颜色',    formType: 'colorPicker' },
    'opacity':          { i18n: '透明度',      formType: 'slider',  min: 0, max: 1, step: 0.02, value: 1 },
    'stroke-opacity':   { i18n: '边界透明度',  formType: 'slider',  min: 0, max: 1, step: 0.02, value: 1 },
    'width':            { i18n: '线条宽度',    formType: 'slider',  min: 0, max: 20, step: 1  },
    'stroke-width':     { i18n: '边界宽度',    formType: 'slider',  min: 0, max: 20, step: 1  },
    'dasharray':        { i18n: '线条样式',    formType: 'select',  list: dasharray, value: dasharray[0] },
    'gap-width':        { i18n: '边框宽度',    formType:  'inputNumber', min: 0, max: 20, value: 0  },
    'offset':           { i18n: '线条偏移',    formType:  'inputNumber', min: 0, max: 20, value: 0  },     
    'blur':             { i18n: '模糊度',      formType:  'slider', min: 0, max: 1, step: 0.02, value: 0  },     
    'radius':           { i18n: '圆半径',      formType:  'slider', min: 1, max: 30, step: 1, value: 1  },     
}

export function identifyFormType(paramsList) {
    const list = [];
    if (Array.isArray(paramsList)) {
        paramsList.forEach(param => {
            const formType = cloneDeep(table[param.name]);
            if (formType) {
                Object.assign(formType, param);
                list.push(formType)
            }
        })
    }
    return list;
}