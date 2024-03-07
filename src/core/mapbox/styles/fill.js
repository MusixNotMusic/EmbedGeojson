import { StyleClass } from './style';
import { randomRgb } from '../../color/color';

/**
 * https://docs.mapbox.com/style-spec/reference/layers/#fill
 */
export class FillStyleClass extends StyleClass{
    constructor(id, map, geojson) {
        super();
        this.id = id;
        this.map = map;
        this.geojson = geojson;

        this.type = 'fill';
        this.paint = {
            'fill-color': randomRgb()
        }
        this.layout = {}

        this.paramsTable = [
            { name: 'opacity', type: 'paint' },
            { name: 'color',   type: 'paint' },
            { name: 'outline-color', type: 'paint' },
        ]

        this.generateParamsFunction();
    }
}