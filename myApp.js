
const workerpool = require('workerpool');

const imageUrl =
    ['https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg',
        'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg',
        'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg',
        'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg',
        'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg',
        'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg', 'https://i.imgur.com/rc1Op1f.jpg'] // [1920 , 1080]


// create a worker pool using an external worker script
const pool = workerpool.pool(__dirname + '/myWorker.js');

const maxWorkers = 8 // Number of Cpu Threads [1]

console.log(pool.stats())


// or run registered functions on the worker via a proxy:
pool
    .proxy()

    .then(function (worker) {

        let res = []

        Promise.all(
            Array.from(Array(maxWorkers))
                .map(async (_, i) => {
                    let result = await worker.getDetectionsFromImage(imageUrl[i])
                    res.push(result)
                    //console.log(res)
                }

                )).then(function () {
                    console.log(res); // outputs 55
                })
            .catch(function (err) {
                console.error(err);
            })
            .then(function () {
                pool.terminate(); // terminate all workers when done
            });
    })

