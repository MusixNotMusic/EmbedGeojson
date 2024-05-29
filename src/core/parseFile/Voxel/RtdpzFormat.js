import { readBufferByTable } from "../Common/readBufferByConfigTable";;

export class RtdpzFormat {

    static headTable = [
        { label: 'minLongitude',      type: 'int',    byteSize: 4,  size: 1,  content: '最小经度' },
        { label: 'minLatitude',       type: 'int',    byteSize: 4,  size: 1,  content: '最大纬度' },
        { label: 'maxLongitude',      type: 'int',    byteSize: 4,  size: 1,  content: '最大经度'},
        { label: 'maxLatitude',       type: 'int',    byteSize: 4,  size: 1,  content: '最小纬度' },
        { label: 'width',             type: 'int',    byteSize: 4,  size: 1,  content: '海拔高度' },
        { label: 'height',            type: 'int',    byteSize: 4,  size: 1,  content: '采样分辨率' },
        { label: 'depth',             type: 'int',    byteSize: 4,  size: 1,  content: '水平数量' },
        { label: 'cutHeight',         type: 'float',  byteSize: 4,  size: 1,  content: '垂直数量' },
    ];

    constructor() {
        this.header = {};

        this.data = null;
    }

    readHead (bytes) {
        this.header = readBufferByTable(bytes.buffer, RtdpzFormat.headTable);
    }

    readVoxelData (bytes) {
        this.data = new Uint8Array(bytes.buffer);
    }

    dispose () {
        RtdpzFormat.headTable = null;
        this.data = null;
    }

    /**
     *
     * @param bytes
     */
    static parser(bytes) {
        const instance = new RtdpzFormat();

        let offset = 0;

        let byteLength = 0;

        //  head
        byteLength = RtdpzFormat.headTable.reduce((cur, next) => cur + next.size * next.byteSize, 0);

        instance.readHead(bytes.slice(offset, offset + byteLength));

        // voxel data
        offset += byteLength;

        instance.readVoxelData(bytes.slice(offset));
    
        return instance;
    }
}