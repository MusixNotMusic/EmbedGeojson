export function wrapGeojsonData(fd, data) {
    return {
        fd: fd,
        type: 'geojson',
        data: data
    }
}

export function wrapZipData(fd, data, suffix) {
    console.log('wrapZipData ==>', fd, data, suffix);
    let type = 'zip';
    const isRtdpz = fd.name.includes('rtdpz');

    if (isRtdpz) {
        type = 'rtdpz';
    } else {
        type = suffix || type;
    }

    return {
        fd: fd,
        type: type,
        data: data
    }
}
