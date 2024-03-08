import { cloneDeep } from 'lodash';

const dasharray = [
    { name: '-------', value:[1, 0] },
    { name: '- - - -', value:[1, 1] },
    { name: '-\u00a0\u00a0-\u00a0\u00a0-', value:[1, 2] },
    { name: '-\u00a0\u00a0\u00a0-\u00a0\u00a0\u00a0-', value:[1, 3] },
    { name: '-- -- --', value:[2, 1] },
]

export const table = {
    'opacity':       { i18n: '透明度',      formType: 'slider',  min: 0, max: 1, step: 0.02, value: 1 },
    'color':         { i18n: '颜色',        formType: 'colorPicker' },
    'outline-color': { i18n: '轮廓颜色',  formType:  'colorPicker' },
    'width':         { i18n: '线条宽度',    formType: 'slider',  min: 0, max: 20, step: 1  },
    'dasharray':     { i18n: '线条样式',    formType: 'select', list: dasharray, value: dasharray[0] },
    'gap-width':     { i18n: '边框宽度',    formType:  'inputNumber', min: 0, max: 20, value: 0  },
    'offset':        { i18n: '线条偏移',    formType:  'inputNumber', min: 0, max: 20, value: 0  },
}

export function identifyFormType(paramsList) {
    const list = [];
    paramsList.forEach(param => {
        const formType = cloneDeep(table[param.name]);
        if (formType) {
            Object.assign(formType, param);
            list.push(formType)
        }
    })
    return list;
}