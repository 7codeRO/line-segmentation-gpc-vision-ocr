const deepCopy = require("deepcopy");
const coordinatesHelper = require('./coordinatesHelper');

/**
 * GCP Vision groups several nearby words to appropriate lines
 * This function combines inline words and create a combined bounding polygon
 * array wordsToRemove : define an array of words/sentences from document you need to get rid of
 */
function init(data, wordsToRemove = null) {

    // The first index refers to the auto identified words which belongs to a sings line
    let lines = data.textAnnotations[0].description.split('\n');
    // gcp vision full text
    let rawText = deepCopy(data.textAnnotations);

    // reverse to use lifo, because array.shift() will consume 0(n)
    lines = lines.reverse();
    rawText = rawText.reverse();
    // to remove the zeroth element which gives the total summary of the text
    rawText.pop();

    let mergedArray = getMergedLines(lines, rawText);
    //remove each word/sentence existent in content
    if(wordsToRemove) {
        mergedArray = coordinatesHelper.removeStringsFromData(mergedArray, wordsToRemove);
    }

    coordinatesHelper.getBoundingPolygon(mergedArray);
    coordinatesHelper.combineBoundingPolygon(mergedArray);

    // This does the line segmentation based on the bounding boxes
    return constructLineWithBoundingPolygon(mergedArray);
}

function constructLineWithBoundingPolygon(mergedArray) {
    let finalArray = [];

    Object.keys(mergedArray).forEach( index => {
        if(!mergedArray[index]['matched']){
            if(!mergedArray[index]['match'].length){
                finalArray.push(mergedArray[index].description)
            } else{
                finalArray.push(arrangeWordsInOrder(mergedArray, index));
            }
        }
    });
    return finalArray;
}

function getMergedLines(lines,rawText) {
    let mergedArray = [];
    while(lines.length !== 1) {
        let l = lines.pop();
        let l1 = deepCopy(l);
        let status = true;

        let data = "";
        let mergedElement;

        while (true) {
            let wElement = rawText.pop();
            if(wElement === undefined) {
                break;
            }
            let w = wElement.description;

            let index = l.indexOf(w);
            let temp;
            // check if the word is inside
            l = l.substring(index + w.length);
            if(status) {
                status = false;
                // set starting coordinates
                mergedElement = wElement;
            }
            if(l === ""){
                // set ending coordinates
                mergedElement.description = l1;
                mergedElement.boundingPoly.vertices[1] = wElement.boundingPoly.vertices[1];
                mergedElement.boundingPoly.vertices[2] = wElement.boundingPoly.vertices[2];
                mergedArray.push(mergedElement);
                break;
            }
        }
    }
    return mergedArray;
}

function arrangeWordsInOrder(mergedArray, k) {
    let mergedLine = '';
    let line = mergedArray[k]['match'];
    let lines = [];

    for (const [key, value] of Object.entries(line)) {
        lines.push(mergedArray[value['matchLineNum']]);
    }

    lines.push(mergedArray[k]);

    //sorts text by it's bounding poly position in order
    lines.sort((a, b) => {
        const _1BoudingPoly = a.boundingPoly;
        const _2BoudingPoly = b.boundingPoly;

        const isFirstGreater = _1BoudingPoly.vertices[0].x > _2BoudingPoly.vertices[0].x;

        return isFirstGreater ? 1 : -1
    });
    //merges inline text
    lines.forEach(item => { mergedLine = mergedLine ? `${mergedLine} ${item.description}` : item.description; });

    return mergedLine;
}

var exports = module.exports = {};

exports.init = function (data, wordsToRemove = null) {
    return init(data, wordsToRemove);
};