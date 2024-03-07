import { StyleClass } from './style';
import { randomRgb } from '../../color/color';

/**
 * https://docs.mapbox.com/style-spec/reference/layers/#fill
 */
export class LineStyleClass extends StyleClass{
    constructor(id, map, geojson) {
        super();
        this.id = id;
        this.map = map;
        this.geojson = geojson;

        this.type = 'line';
        this.paint = {
            'line-color': randomRgb(),
            'line-width': 4
        }
        this.layout = {
            'line-join': 'round',
            'line-cap': 'round'
        }

        this.paramsTable = [
            { name: 'cap', type: 'paint' },
            { name: 'color',   type: 'paint' },
            { name: 'dasharray', type: 'paint' },
            { name: 'emissive-strength', type: 'paint' },
            { name: 'gap-width', type: 'paint' },
            { name: 'opacity', type: 'paint' },
            { name: 'width', type: 'paint' },
        ]

        this.generateParamsFunction();
    }
}