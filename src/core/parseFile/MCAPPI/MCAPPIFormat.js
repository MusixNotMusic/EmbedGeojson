import { readBufferByTable } from "../Common/readBufferByConfigTable";;

export class MCAPPIFormat {

    static headTable = [
        { label: 'ver_and_width',  type: 'unsigned int',   byteSize: 4, size: 1,  content: '版本' },
        { label: 'iHCutNum',       type: 'unsigned int',   byteSize: 4, size: 1,  content: '最小纬度',    description: '雷达型号' },
        { label: 'iHeight',        type: 'int',            byteSize: 4, size: 12, content: '最大纬度',    description: '最大纬度' },
    ];

    constructor() {
        this.header = {}

        this.body
    }

    readHead (bytes) {
        this.header = readBufferByTable(bytes.buffer, MCAPPIFormat.headTable);
    }

    readBody (bytes) {
        this.body = new Int32Array(bytes.buffer);
    }


    dispose () {
        MCAPPIFormat.headTable = null;
        this.body = null;
    }

    /**
     *
     * @param bytes
     */
    static parser(bytes) {
        const instance = new MCAPPIFormat();

        let offset = 1266;

        const headSize = MCAPPIFormat.headTable.reduce((cur, next) => cur + next.size * next.byteSize, 0);

        instance.readHead(bytes.slice(offset, offset + headSize));

        offset = offset + 84;

        instance.readBody(bytes.slice(offset, bytes.size));
        
        return instance;
    }
}