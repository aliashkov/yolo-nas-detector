const workerpool = require('workerpool')
const loadYoloV8 = require('../models/yolonas')

loadYoloV8(`./corner-cleaning/wa/model.json`)
.then(model => workerpool.worker({detect: model.detect}))