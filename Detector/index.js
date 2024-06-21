const ModelWorker = require('./workers/ModelWorker')
const {withinWorkspace} = require('../utils/2D')
const {detect} = require("./models/yolonas")
const ort = require("onnxruntime-node");
const path = require("path");

const modelInfo = {
    name: "yolo_nas_s2.onnx",
    nameConfig: 'nms-yolo-nas.onnx',
    path: '/models/yolo-nas',
};

class Detector {

    
    detections
    options
    arrBufNMS
    session
    WORKSPACE_RECT = [0, 0, 1600, 900]
    IMAGE_RES = [1920 , 1080]

    async init() {

        const options = []

        options.intraOpNumThreads = 3 // 8

        options.enableCpuMemArena = false

        this.arrBufNMS = await ort.InferenceSession.create(path.join(__dirname, modelInfo.path, modelInfo.nameConfig), options); // load model config

        this.session = await ort.InferenceSession.create(path.join(__dirname, modelInfo.path, modelInfo.name), options); // load model 
    }


    async detect(buffer) {

        await this.init()

        this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session)
/*         this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session)
        this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session)
        this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session)
        this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session)
        this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session)
        this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session)
        this.detections = await detect(buffer , this.IMAGE_RES , this.arrBufNMS , this.session) */
        
        
        return this.detections
    }
    
}

module.exports = Detector