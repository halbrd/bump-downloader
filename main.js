const fetch = require('node-fetch');
const fs = require('fs').promises;

const BUMPS_URL = 'http://raw.githubusercontent.com/treesnetwork/bumps/master/index.js';
const QUALITY_PREFERENCES = ['720p', '480p', '360p'].reverse();

async function download(bump) {
    // log
    let logMessage = 'downloading ' + bump.id;
    if ('username' in bump) {
        logMessage += ' by ' + bump.username;
    }
    console.log(logMessage);

    // get source url
    let bumpSource = null;
    for (quality of QUALITY_PREFERENCES) {
        thisQualitySource = bump.source.sources.find(source => source.quality === quality);
        if (thisQualitySource != null) {
            bumpSource = thisQualitySource;
        }
    }

    if (bumpSource === null) {
        throw new ValueError('no matching sources: ' + bump.id);
    }

    // download
    const response = await fetch(bumpSource.url);
    const contents = await response.arrayBuffer();
    const buffer = Buffer.from(contents);

    await fs.writeFile(bump.id + '.mp4', buffer);

    // log
    console.log(logMessage.replace(/^downloading/, 'finished   '))
}

// retrieve bumps.js
(async () => {
    const response = await fetch(BUMPS_URL);
    const payload = await response.text();
    await fs.writeFile('bumps.js', payload);
})()

// import bumps
const bumps = require('./bumps.js');

// download bumps
(async () => Promise.all(bumps.map(bump => download(bump))))()
