const workerpool = require('workerpool')
const loadYoloV8 = require('../models/yolov8')

loadYoloV8(`./corner-cleaning/wo/model.json`, true)
.then(model => workerpool.worker({detect: model.detect}))