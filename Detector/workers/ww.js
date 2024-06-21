const workerpool = require('workerpool')
const loadYoloV8 = require('../models/yolov8')

loadYoloV8(`./corner-cleaning/ww/nms-yolo-nas.onnx`)
.then(model => workerpool.worker({detect: model.detect}))