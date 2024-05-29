import * as THREE from "three";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import Stats from 'three/examples/jsm/libs/stats.module'
import { isEmpty, defaultsDeep, cloneDeep } from 'lodash'
import mapboxgl from 'mapbox-gl'
import vertexShader from './glsl/vertex.vert';
import fragmentShader  from './glsl/semitransparent.frag';

import { colors, getColorSystem, getResourceCache } from '../constants'
/**
 * VoxelRender
 */

 export default class VoxelRender {
    constructor(id, map) {
        this.id = id;
        this.map = map;

        this.isThree = true;

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        this.volume = null;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();

        this.material = null;
        this.geometry = null;
        this.mesh = null;

        this.parameters = {
            colorMap: 'Z',
            threshold0: 0.0,
            threshold:  1.0,
            depthSampleCount: 128,
            brightness: 1.0,
            exaggeration: 1
        };

        this.colorMapTexture = getColorSystem().colorMapTexture;

        this.uniforms = {
            cameraPosition:   { value: new THREE.Vector3() },
            tex:              { value: null },
            colorMap:         { value: null },
            depthSampleCount: { value: 256 },
            threshold0:       { value: 0 },
            threshold:        { value: 1 },
            brightness:       { value: 1 },
            rangeColor1:      { value: 0 },
            rangeColor2:      { value: 1 },
            maxLat:           { value: 50 },
            minLat:           { value: 20 },
            minAlt:           { value: 0.5 },
            maxAlt:           { value: 0.7 },
        };

        this.colorNames = colors.map(color => { return color.name })

        this.initGui();

        window.VolumeRender = this;
    }

    initGui () {
        const gui = new GUI();

        this.gui = gui;
        this.gui.show(false);
        const updateUniforms = this.updateUniforms.bind(this);

        gui.add( this.parameters, 'colorMap', this.colorNames ).onChange( updateUniforms );
        gui.add( this.parameters, 'threshold0', 0, 1, 0.01 ).onChange( updateUniforms );
        gui.add( this.parameters, 'threshold', 0, 1, 0.01 ).onChange( updateUniforms );
        gui.add( this.parameters, 'depthSampleCount', 0, 512, 1 ).onChange( updateUniforms );
        gui.add( this.parameters, 'brightness', 0, 7, 0.1 ).onChange( updateUniforms );

        this.stats = new Stats();
        this.stats.dom.style.position = '';
        this.stats.showPanel( 0 );
        gui.domElement.append(this.stats.dom );
    }
    

    updateUniforms() {

        this.scene.children.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.colorMap.value = this.colorMapTexture[ this.parameters.colorMap ];
                mesh.material.uniforms.threshold.value = this.parameters.threshold;
                mesh.material.uniforms.threshold0.value = this.parameters.threshold0;
                mesh.material.uniforms.depthSampleCount.value = this.parameters.depthSampleCount;
                mesh.material.uniforms.brightness.value = this.parameters.brightness;
            }
        })
    }


    setData(volume) {
        this.clearScene();
        this.render(volume)
    }

    addData(volume) {
        this.render(volume)
    }

    removeData(id) {
       const object = this.scene.getObjectByName(id);
       const object1 = this.scene.getObjectByName(id+'-edges');
       if (object) {
            this.scene.remove(object);
            object.clear();
       }

       if (object1) {
            this.scene.remove(object1);
            object1.clear();
       }

       if (this.scene.children.length === 0) {
            this.dispose();
       }
    }
    
    render (volume) {
        if (Array.isArray(volume)) {
            volume.forEach(v => {
                this.initVolume(v);
            })
        } else {
            this.initVolume(volume);
        }

        this.setColorMap(this.parameters.colorMap);

        this.drawLayer()
    }

    reset(volume) {
        this.clearScene();
        
        this.render(volume)
    }


    initCanvas(map, gl) {
        const { renderer } = this;

        if (map && renderer.domElement) {
            const mapCanvas = map.getCanvas();
            const width = mapCanvas.width;
            const height = mapCanvas.height;

            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( width, height );

            renderer.domElement.style.width = mapCanvas.style.width;
            renderer.domElement.style.height = mapCanvas.style.height;
            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.pointerEvents = "none";
            renderer.setDrawingBufferSize(width, height, 1);

            map.getCanvasContainer().appendChild(renderer.domElement);
        }
    }


    initVolume(volume) {
        const faceSize = volume.width * volume.height;
        const texture = new THREE.Data3DTexture( volume.data, volume.width, volume.height, volume.depth );
        texture.format = THREE.RedFormat;
        texture.type = THREE.UnsignedByteType;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        this.volume = volume;

        // Material
        const uniforms = cloneDeep(this.uniforms);

        uniforms.tex.value =  texture
        uniforms.colorMap.value =  this.colorMapTexture[this.parameters.colorMap]
        uniforms.maxLat.value = volume.maxLatitude
        uniforms.minLat.value = volume.minLatitude

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );


        const material = new THREE.RawShaderMaterial( {
            glslVersion: THREE.GLSL3,
            uniforms: uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        // THREE.Mesh
        const mesh = new THREE.Mesh( geometry, material );

        mesh.name = volume.id;
        // this.geometry = geometry;
        // this.material = material;
        // this.mesh     = mesh;

        this.scene.add(mesh)

        // box
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const materialHL = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.9, transparent: true });
        const meshHL = new THREE.LineSegments( edgesGeometry, materialHL);

        meshHL.name = volume.id + '-edges';
        this.scene.add(meshHL)

        const bounds = {
            minX: volume.minLongitude,
            minY: volume.minLatitude,
            maxX: volume.maxLongitude,
            maxY: volume.maxLatitude,
        };

        this.altitude = volume.cutHeight * volume.depth;

        this.setScenePosition(mesh, bounds);
        this.setScenePosition(meshHL, bounds);

        this.renderer.render( this.scene, this.camera );
    }

    setScenePosition (scene, bounds) {
        const min = mapboxgl.MercatorCoordinate.fromLngLat([bounds.minX, bounds.maxY], 0);
        const max = mapboxgl.MercatorCoordinate.fromLngLat([bounds.maxX, bounds.minY], this.altitude || 80000);

        const boundScaleBox = [  min.x, min.y, min.z, max.x, max.y, max.z ];

        scene.position.x = (boundScaleBox[0] + boundScaleBox[3]) / 2;
        scene.position.y = (boundScaleBox[1] + boundScaleBox[4]) / 2;
        scene.position.z = (boundScaleBox[2] + boundScaleBox[5]) / 2;

        scene.scale.x = (boundScaleBox[3] - boundScaleBox[0]);
        scene.scale.y = (boundScaleBox[4] - boundScaleBox[1]);
        scene.scale.z = (boundScaleBox[5] - boundScaleBox[2]);
    }


    /**
     * 设置垂直高度倍数
     * @param value
     */
    setExaggeration (value) {
        // this.mesh.scale.z = this.mesh.scale.z * value;

        this.scene.children.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.scale.z = mesh.scale.z * value;
            }
        })
    }

    /***
     * 设置色卡
     * @param value
     */
    setColorMap (value) {
        this.parameters.colorMap = value
        const texture = this.colorMapTexture[this.parameters.colorMap]
        if (texture) {
            this.scene.children.forEach(mesh => {
                if (mesh.material.uniforms) {
                    mesh.material.uniforms.colorMap.value = texture;
                }
            })
        } else {
            console.warn('this texture not exist')
        }
    }

    /***
     * 设置亮度
     * @param value
     */
    setBrightness (value) {
        this.scene.children.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.brightness.value = value;
            }
        })
    }

    /***
     * 设置阈值
     * @param value
     */
    setDepthSampleCount (value) {
        this.scene.children.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.depthSampleCount.value = value;
            }
        })
    }

    /***
     * 设置亮度
     * @param value
     */
    setThreshold (value) {
        this.scene.children.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.threshold0.value = value;
            }
        })
    }

    setThreshold1 (value) {
        this.scene.children.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.threshold.value = value;
            }
        })
    }

    /***
     * 设置亮度
     * @param value
     */
    setColorRange (value) {
        this.scene.children.forEach(mesh => {
            if (mesh.material.uniforms) {
                mesh.material.uniforms.rangeColor1.value = value[0];
                mesh.material.uniforms.rangeColor2.value = value[1];
            }
        })
    }

    showLayer (show) {
        if(this.renderer) {
            this.renderer.domElement.style.display = show ? 'block' : 'none';
        }
    }

    showMesh (show, name) {
        if(this.renderer) {
            const meshs = this.scene.getObjectsByProperty('name', name);
            const meshEdges = this.scene.getObjectsByProperty('name', name + '-edges');
            meshs.forEach(mesh => {
                mesh.visible = show;
            })

            meshEdges.forEach(mesh => {
                mesh.visible = show;
            })
        }
    }

    showGUI(show) {
        this.gui.show(show);
    }

    drawLayer () {
        const customLayer = {
            id: this.id,
            type: 'custom',
            renderingMode: '3d',
            onAdd: (map, gl) => {
                window.mapIns = this.map = map;
                this.initCanvas(map, gl);
            },

            render: (gl, matrix) => {
                const { renderer, scene, camera } = this;


                camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix)

                this.scene.children.forEach(mesh => {

                    if (mesh && mesh.material.uniforms && mesh.material.uniforms.cameraPosition) {
                        const camera = this.map.getFreeCameraOptions();

                        const cameraPosition = camera._position

                        mesh.material.uniforms.cameraPosition.value.copy( { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z } );
                    }

                })

                 if (renderer) {
                    renderer.resetState();
                    renderer.render(scene, camera);
                }

                if(this.stats) {
                    this.stats.update();
                }

                if (this.map) {
                    this.map.triggerRepaint();
                }
            },


            onRemove: () => {
                this.clearScene();
            }
        };

        if (!this.map.getLayer(this.id)) {
            this.map.addLayer(customLayer);
        }
    }

    clearScene() {
        if (this.scene && this.scene.children.length > 0) {
            this.scene.children.forEach(mesh => {
                if (mesh) {
                    if (mesh.material && mesh.material.uniforms) {
                        if (mesh.material.uniforms.tex.value) {
                            mesh.material.uniforms.tex.value.dispose();
                            mesh.material.uniforms.tex.value.source.data = null;
                            mesh.material.uniforms.tex.value.source = null;
                        }
                        mesh.material.uniforms.tex.value = null;
                    }

                    if (mesh.material) {
                        mesh.material.dispose();
                    }

                    if (mesh.geometry) {
                        mesh.geometry.dispose();
                    }
                    mesh = null;
                }
            })
            this.scene.children = [];
        }

        if (this.volume) {
            delete this.volume.data;
            this.volume = null;
        }
    }

    // ==========================
    removeLayer () {
        if (this.map && this.map.getLayer(this.id)) {
            this.map.removeLayer(this.id)
        }
    }

    /**
     * 清除
     */

    destroy () {
        this.isDispose = true;

        this.removeLayer()

        if (this.renderer) {
            this.renderer.domElement.remove();
            this.renderer.dispose();
        }

        if (this.gui) {
            this.gui.destroy();
        }

        this.id = null;
        this.map = null;

        this.renderer = null;

        this.camera = null;
        this.scene = null;
    }

    dispose () {
        this.destroy()
    }

}
