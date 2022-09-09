const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');

const resultFiles = process.argv.slice(2);

if (resultFiles.length <= 0) {
    console.error("No result files passed.");
    console.error(`Usage node src/index.js <list of result files to be merged>`);
    process.exit(0);
}

if (resultFiles.length === 1) {
    console.log("Only one file passed, nothing to merge");
    process.exit(0);
}

protobuf.load('gauge-proto/messages.proto', (err, root) => {
    if(err)
        throw err;
    
    var psr = root.lookupType('gauge.messages.ProtoSuiteResult');
    var res = resultFiles.map((x) => psr.toObject(psr.decode(fs.readFileSync(x))))
    .reduce((acc, v) => {
        acc.specResults.push(...v.specResults);
        acc.executionTime += v.executionTime;
        return acc;
    });

    fs.writeFileSync('merged_result', psr.encode(psr.fromObject(res)).finish());
    console.log(`Merged result written to ${path.join(process.cwd(), "merged_result")}`);
})