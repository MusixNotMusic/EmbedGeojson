export const table = {
    opacity:         { i18n: '透明度',     formType: 'slider',  min: 0, max: 1, step: 0.02, value: 1 },
    color:           { i18n: '颜色',       formType: 'colorPicker' },
    'outline-color': { i18n: '轮廓线颜色', formType:  'colorPicker' },
    width:           { i18n: '条宽度',     formType: 'slider',  min: 0, max: 20, step: 1 },
}

export function identifyFormType(paramsList) {
    const list = [];
    paramsList.forEach(param => {
        const formType = table[param.name];
        if (formType) {
            Object.assign(formType, param);
            list.push(formType)
        }
    })
    return list;
}