
const path = require("path");
const ort = require("onnxruntime-node");
const os = require("os")
const fs = require('fs');
const { Image } = require("@napi-rs/canvas");
const process = require('../../utils/process')
const { loadImage, createCanvas  } = require("@napi-rs/canvas");


const modelInfo = {
    name: "yolo_nas_s2.onnx",
    nameConfig: 'nms-yolo-nas.onnx',
    inputShape: [1, 3, 640, 640],
    path: '/yolo-nas',
    scoreThreshold: 0.25,
    iouThreshold: 0.2,
    topk: 100

};

const jsonLabels = {
    path: '/yolo-nas',
    name: 'coco-detection-labels.json'
}


async function getImageData(buffer, modelWidth, modelHeight) {
    const canvas = createCanvas(modelWidth, modelHeight);
    const ctx = canvas.getContext('2d');
    await loadImage(buffer).then((image) => {
        ctx.drawImage(image, modelInfo.inputShape[0], modelInfo.inputShape[1], modelWidth, modelHeight)
    })
    const imageData = ctx.getImageData(modelInfo.inputShape[0], modelInfo.inputShape[1], modelWidth, modelHeight);
    return { imageData, canvas };
};



const detect = async (buffer, size , arrBufNMS , session) => {
    try {

        const { imageData } = await getImageData(buffer, modelInfo.inputShape[2], modelInfo.inputShape[3])

        const preprocessedData = await process(imageData.data, modelInfo.inputShape[2], modelInfo.inputShape[3]);

        tensor = new ort.Tensor("float32", preprocessedData, modelInfo.inputShape); // to ort.Tensor

        const output = await session.run({ images: tensor }); // run session and get output layer

        const outNames = session.outputNames;

        const config = new ort.Tensor(
            "float32",
            new Float32Array([
                modelInfo.topk, // topk per class
                modelInfo.iouThreshold, // iou threshold
                modelInfo.scoreThreshold, // score threshold
            ])
        );

        const { selected } = await arrBufNMS.run({
            bboxes: output[outNames[0]],
            scores: output[outNames[1]],
            config: config,
        }); // perform nms and filter boxes

        const labels = JSON.parse(fs.readFileSync(path.join(__dirname, jsonLabels.path, jsonLabels.name)));

        const detections = []

        for (let idx = 0; idx < selected.dims[1]; idx++) {

            const data = selected.data.slice(idx * selected.dims[2], (idx + 1) * selected.dims[2]); // get rows

            const box = data.slice(0, 4);
            const scores = data.slice(4); // classes probability scores

            for (let i = 0; i < scores.length; ++i) {

                // filter based on class threshold
                const score = Math.max(...scores); // maximum probability scores

                const label = scores.indexOf(score); // class id of maximum probability scores

                let [y1, x1, y2, x2] = box.slice(i * 4, (i + 1) * 4)

                const ratioX = size[1] / imageData.width
                const ratioY = size[0] / imageData.height
                x1 *= ratioX
                x2 *= ratioX
                y1 *= ratioY
                y2 *= ratioY
                const width = y2 - y1
                const height = x2 - x1

                if (score > modelInfo.scoreThreshold) {
                    detections.push({
                        x: y1,
                        y: x1,
                        width: width,
                        height: height,
                        score: score,
                        classId: label,
                        class: labels[label],
                        bbox: [y1, x1, width, height]
                    })
                    break;
                }

            }

        }

        return detections
    } catch (e) {
        console.log(e, 'onnx detect error')
    }
};

module.exports = { detect }