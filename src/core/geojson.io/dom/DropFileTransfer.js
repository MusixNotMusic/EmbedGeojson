import EventEmitter from "events";
import { readGeoJsonData } from '../file/readGeoJsonData';

export class DropFileTransfer extends EventEmitter  {
    constructor() {
        super();
        this.dom = document.body;

        this.dropBind= this.drop.bind(this);
        this.dragOverBind= this.over.bind(this);
        this.dragEneterBind= this.enter.bind(this);
        this.dragLeaveBind= this.leave.bind(this);

        window.DropFileTransfer = this;

        this.initBodyDom();
        this.addEventListener();
    }

    initBodyDom() {
        this.dom.setAttribute('dropzone', 'copy');
    }

    drop(event) {
        console.log('drop ===>', event)
        event.stopPropagation(); 
        event.preventDefault();
        this.dropOver(event);
    }

    dropOver(event) {
        event.stopPropagation();
        event.preventDefault();

        if ( event.dataTransfer &&
            event.dataTransfer &&
            event.dataTransfer.files &&
            event.dataTransfer.files.length) {
            [...event.dataTransfer.files].forEach(fd => {
                readGeoJsonData(fd).then((geojson) => {
                    this.emit('geojson-data', geojson);
                }).catch(e => {
                    this.emit('error', e);
                })
            })
        }
    }

    over(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    enter(event) {
        console.log('enter ==>', event); 
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    leave(event) {
        console.log('leave ==>', event); 
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    addEventListener() {
        this.dom.addEventListener('drop', this.dropBind);
        this.dom.addEventListener('dragenter', this.drapEneterBind);
        this.dom.addEventListener('dragleave', this.dragLeaveBind);
        this.dom.addEventListener('dragover', this.dragOverBind);
    }

    removeEventListener() {
        this.dom.removeEventListener('drop', this.dropBind);
        this.dom.removeEventListener('dragenter', this.dragEneterBind);
        this.dom.removeEventListener('dragleave', this.dragLeaveBind);
        this.dom.removeEventListener('dragover', this.dragOverBind);
    }

    dispose() {
        this.removeAllListeners();
        this.dropBind = null;
        this.drapOverBind = null;
        this.dropExitBind = null;

        this.removeAllListeners('error');
        this.removeAllListeners('geojson-data');
    }

    destroy() {
        this.dispose();
    }
}