export const _ext = (filename, _) => {
    return filename.indexOf(_) !== -1;
}

/**
 *  判断 ext type extFunction 返回
 */
export const fileCheckRuleList = [
    { name: 'google-earth', ext: '.kml',      returnType: 'kml',       type: 'application/vnd.google-earth.kml+xml', description: 'google earth file type' },
    { name: 'google-earth', ext: '.kml',      returnType: 'kml',       type: '', description: 'google earth file type' },
    { name: 'gpx',          ext: '.gpx',      returnType: 'gpx',       type: '',  description: 'Convert a GPX document to GeoJSON,  the GPS Exchange Format, https://www.topografix.com/gpx.asp' },
    { name: 'geojson',      ext: '.geojson',  returnType: 'geojson',   type: '',  description: 'geojson' },
    { name: 'json',         ext: '.json',     returnType: 'geojson',   type: '',  description: 'geojson' },
    { name: 'topojson',     ext: '.topojson', returnType: 'geojson',   type: '',  description: 'geojson' },
    { name: 'csv',          ext: '.csv',      returnType: 'dsv',       type: 'text/csv',  description: 'csv' },
    { name: 'tsv',          ext: '.tsv',      returnType: 'dsv',       type: '',  description: 'tsv' },
    { name: 'dsv',          ext: '.dsv',      returnType: 'dsv',       type: '',  description: 'dsv' },
    { name: 'xml',          ext: '.xml',      returnType: 'xml',       type: '',  description: 'xml' },
    { name: 'osm',          ext: '.osm',      returnType: 'xml',       type: '',  description: 'osm' },
    { name: 'poly',         ext: '.poly',     returnType: 'poly',      type: '',  description: 'poly' },
    { name: 'shp',          ext: '.shp',      returnType: 'shp',       type: '',  description: 'shapfile' },
    { name: 'text1',        extTextFunction: (text) => _ext(text, 'shape_id,shape_pt_lat,shape_pt_lon'),                                    returnType: 'gtfs-shapes',      type: '',  description: 'gtfs-shapes' },
    { name: 'text2',        extTextFunction: (text) => _ext(text, '"shape_id","shape_pt_lat","shape_pt_lon"'),                              returnType: 'gtfs-shapes',      type: '',  description: 'gtfs-shapes' },
    { name: 'text1',        extTextFunction: (text) => _ext(text, 'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon'),               returnType: 'gtfs-stops',       type: '',  description: 'gtfs-stops' },
    { name: 'text2',        extTextFunction: (text) => _ext(text, '"stop_id","stop_code","stop_name","stop_desc","stop_lat","stop_lon"'),   returnType: 'gtfs-stops',       type: '',  description: 'gtfs-stops' },
]

/**
 * 返回文件类型
 * @param {*} file 
 * @param {*} text 
 * @returns 
 */
export const checkFileType = (file, text) => {
    
    const len = fileCheckRuleList.length;

    for(let i = 0; i < len; i++) {
        const rule = fileCheckRuleList[i];

        if (rule.ext && _ext(file.name, rule.ext)) {
            return rule.returnType;
        }

        if (rule.type && rule.type === file.type) {
            return rule.returnType;
        }

        if (rule.extTextFunction && rule.extTextFunction(text)) {
            return rule.returnType;
        }
    }
    return '';
}