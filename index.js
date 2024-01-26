const express = require('express');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const readline = require('readline');

const app = express();
const PORT = 8080;

// Create a LRU cache mechanism for in-memory caching
class LRUCache {
    constructor(maxCapacity) {
        this.cache = {};
        this.order = [];
        this.maxCapacity = maxCapacity;
    }

    get(key) {
        if (this.cache[key]) {
            this.order = this.order.filter(k => k !== key);
            this.order.unshift(key);
            return this.cache[key];
        }
        return undefined;
    }

    set(key, value) {
        if (Object.keys(this.cache).length >= this.maxCapacity) {
            const lruKey = this.order.pop();
            delete this.cache[lruKey];
        }

        this.cache[key] = value;
        this.order.unshift(key);
    }
}

// The maximum capacity of the cache is set to 320,000 lines. The rough estimation is based on the calculation provided in the README
const cache = new LRUCache(320000); 

app.get('/data', async (req, res) => {
    const { n, m } = req.query;

    if (!n) {
        return res.status(400).send('Parameter n is required');
    }

    const filePath = path.join('tmp/data', `${n}.txt`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    try {
        if (m) {
            const startTime = performance.now();
            const line = await getLineFromFileWithCache(filePath, parseInt(m, 10));
            const endTime = performance.now();
            console.log(`Time taken to send file: ${endTime - startTime} milliseconds`);
            return res.send(line);
        } else {

            //Using a buffered stream to send the .txt file to the client

            const startTime = performance.now();
            const buffer = 64 * 1024;
            const fileStream = fs.createReadStream(filePath, { highWaterMark: buffer });
            fileStream.pipe(res);
            const endTime = performance.now();
            console.log(`Time taken to send file: ${endTime - startTime} milliseconds`);
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});

/**
 * This function reads the file line by line and returns the line at the specified line number
 * since it is not efficient to read the file every time
 * so we use a cache mechanism to store the lines that are read from the file
 */
async function getLineFromFile(filePath, lineNumber) {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentLine = 0;

    for await (const line of rl) {
        currentLine++;
        if (currentLine === lineNumber) {
            rl.close();
            return line;
        }
    }

    throw new Error(`Line ${lineNumber} not found in file`);
}

/**
 * Checking the cache for the particular (fileNo,lineNo) pair before reading the file
 */
async function getLineFromFileWithCache(filePath, lineNumber) {
    const cacheKey = `${filePath}:${lineNumber}`;

    const cachedLine = cache.get(cacheKey);
    if (cachedLine) {
        return cachedLine;
    }

    const line = await getLineFromFile(filePath, lineNumber);

    cache.set(cacheKey, line);

    return line;
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
