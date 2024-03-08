import { checkFileContent, checkFileName, checkFileType } from './fileType';
import { readAsDom, readAsText, readAsArrayBuffer } from './readRawFile';
import {
    readKml,
    readXml,
    readCsv,
    readGeoJson,
    readGpx,
    readPloy,
    readGtfsShapes,
    readGtfsStops,
    readShape
} from './readAsGeoJson';

/**
 * 
 * @param {*} f 文件描述符
 */
export function readGeoJsonData (fd) {
    let fileName = checkFileName(fd);
    let fileType = checkFileType(fd);

    // 读取文件扩展名
    if (fileName) {
        switch(fileName) {
            case 'kml':     return readAsText(fd).then(readKml).then(data => { data.fd = fd; return data; }); break;
            case 'xml':     return readAsText(fd).then(readXml).then(data => { data.fd = fd; return data; }); break;
            case 'gpx':     return readAsText(fd).then(readGpx).then(data => { data.fd = fd; return data; }); break;
            case 'geojson': return readAsText(fd).then(readGeoJson).then(data => { data.fd = fd; return data; }); break;
            case 'dsv':     return readAsText(fd).then(readCsv).then(data => { data.fd = fd; return data; }); break;
            case 'poly':    return readAsText(fd).then(readPloy).then(data => { data.fd = fd; return data; }); break;
            case 'shp':     return readAsArrayBuffer(fd).then(readShape).then(data => { data.fd = fd; return data; }); break;
        }
    } else if (fileType) {
        switch(fileType) {
            case 'kml':     return readAsText(fd).then(readKml).then(data => { data.fd = fd; return data; }); break;
        }
    } else if (!fileName && !fileType) {
        return readAsText(fd).then((text) => {
            const fileContentType = checkFileContent(text);
            switch(fileContentType) {
                case 'gtfs-shapes': return readGtfsShapes(text).then(data => { data.fd = fd; return data; }); break;
                case 'gtfs-stops':  return readGtfsStops(text).then(data => { data.fd = fd; return data; }); break;
                default: throw('File Content not Parse')
            }
        })
    } 

    throw('File not Parse')
}