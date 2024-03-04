import { checkFileType } from './fileType';
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
export function readGeoJsonData (f) {
    
}