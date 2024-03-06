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
            case 'kml':     return readAsText(fd).then(readKml); break;
            case 'xml':     return readAsText(fd).then(readXml); break;
            case 'gpx':     return readAsText(fd).then(readGpx); break;
            case 'geojson': return readAsText(fd).then(readGeoJson); break;
            case 'dsv':     return readAsText(fd).then(readCsv); break;
            case 'poly':    return readAsText(fd).then(readPloy); break;
            case 'shp':     return readAsArrayBuffer(fd).then(readShape); break;
        }
    } else if (fileType) {
        switch(fileType) {
            case 'kml':     return readAsText(fd).then(readKml); break;
        }
    } else if (!fileName && !fileType) {
        return readAsText(fd).then((text) => {
            const fileContentType = checkFileContent(text);
            switch(fileContentType) {
                case 'gtfs-shapes': return readGtfsShapes(text); break;
                case 'gtfs-stops':  return readGtfsStops(text); break;
                default: throw('File Content not Parse')
            }
        })
    } 

    throw('File not Parse')
}