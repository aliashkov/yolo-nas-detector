const Detector = require('./Detector')
const { Worker } = require("worker_threads");
const os = require("os")
const workerpool = require('workerpool');

const imageResolution = {
    width: 1920,
    height: 1080,
}

// a deliberately inefficient implementation of the fibonacci sequence
async function getDetectionsFromImage(url) {
    try {

        console.time("runtime time")

        const response = await fetch(url);
        let detections;

        if (response.ok) {

            let checkBuffer = await Buffer.from(await response.arrayBuffer())

            detector = new Detector()

            if (checkBuffer) {
                detections = await detector.detect(checkBuffer, imageResolution)
                
            }

        } else {
            console.log("HTTP ERROR :" + response.status);
        }

        console.timeEnd("runtime time")

        return detections;
    } catch (err) {
        console.log(err);
    }
}

// create a worker and register public functions
workerpool.worker({
    getDetectionsFromImage: getDetectionsFromImage,
});