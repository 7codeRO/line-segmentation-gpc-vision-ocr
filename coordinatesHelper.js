const deepcopy = require("deepcopy");
const levenshtein = require("js-levenshtein");

const leftTopCornerIndex = 0;
const rightTopCornerIndex = 1;
const rightBottomCornerIndex = 2;
const leftBottomCornerIndex = 3;

const __x = 0;
const __y = 1;

function removeStringsFromData(mergedArray, wordsToRemove) {
    wordsToRemove.forEach(function (element) {
        let len = mergedArray.length;
        let minDistance = Math.round(element.length / 6);
        let indexToRemove = -1;
        for(let i = 0; i < len; i++) {
            let description = mergedArray[i].description;
            let currentDistance = levenshtein(element, description);
            if(currentDistance < minDistance) {
                indexToRemove = i;
                minDistance = currentDistance;
            }
        }
        if(indexToRemove !== -1) {
            mergedArray.splice(indexToRemove, 1);
        }
    });
    return mergedArray;
}

/**
 *
 * @param mergedArray
 */
function getBoundingPolygon(mergedArray) {

    Object.keys(mergedArray).forEach( index => {
        let arr = [];

        // calculate line height
        let h1 = mergedArray[index].boundingPoly.vertices[0].y - mergedArray[index].boundingPoly.vertices[3].y;
        let h2 = mergedArray[index].boundingPoly.vertices[1].y - mergedArray[index].boundingPoly.vertices[2].y;
        let avgHeight = (h1 + h2) / 2;

        arr.push(mergedArray[index].boundingPoly.vertices[1]);
        arr.push(mergedArray[index].boundingPoly.vertices[0]);
        let line1 = getRectangle(deepcopy(arr), avgHeight);

        arr = [];
        arr.push(mergedArray[index].boundingPoly.vertices[2]);
        arr.push(mergedArray[index].boundingPoly.vertices[3]);
        let line2 = getRectangle(deepcopy(arr), avgHeight);

        mergedArray[index]['bigbb'] = createRectCoordinates(line1, line2);
        mergedArray[index]['lineNum'] = index;
        mergedArray[index]['match'] = [];
        mergedArray[index]['matched'] = false;
    })
}


function combineBoundingPolygon(mergedArray) {
    // select one word from the array
    for(let i=0; i< mergedArray.length; i++) {

        let bigBB = mergedArray[i]['bigbb'];
        // iterate through all the array to find the match
        for(let k=0; k< mergedArray.length; k++) {

            // Do not compare with the own bounding box and which was not matched with a line
            if(k !== i && !mergedArray[k]['matched'] && !mergedArray[k]['match'].length && !mergedArray[i]['matched']) {
                let insideCount = 0;

                if(isInside(bigBB, mergedArray[k]['bigbb'])) {
                    insideCount = 4;
                    if(mergedArray[i].description === '81' || mergedArray[k].description === '81') {
                        console.log('mergedArray[i]: ', mergedArray[i], 'mergedArray[i].boundingPoly.vertices: ', mergedArray[i].boundingPoly.vertices);
                        console.log('mergedArray[k]: ', mergedArray[k], 'mergedArray[i].boundingPoly.vertices: ', mergedArray[k].boundingPoly.vertices);
                        console.log('isInside: ', isInside(bigBB, mergedArray[k]['bigbb']));
                    }
                }

                // all four point were inside the big bb
                if(insideCount === 4) {
                    let match = {matchCount: insideCount, matchLineNum: k};
                    mergedArray[i]['match'].push(match);
                    mergedArray[k]['matched'] = true;
                }
            }
        }
    }
}
//TODO: de facut doua call-uri    <-->
function isInside(refferenceItemCoordonates, itemCoordonates) {
    // Down reference y point
    const down_refferece_y_point = refferenceItemCoordonates[leftBottomCornerIndex][__y] > refferenceItemCoordonates[rightBottomCornerIndex][__y] ?
        refferenceItemCoordonates[leftBottomCornerIndex][__y] :
        refferenceItemCoordonates[rightBottomCornerIndex][__y];
    // Up reference y point
    const up_refferece_y_point = refferenceItemCoordonates[leftTopCornerIndex][__y] > refferenceItemCoordonates[rightTopCornerIndex][__y] ?
        refferenceItemCoordonates[leftTopCornerIndex][__y] :
        refferenceItemCoordonates[rightTopCornerIndex][__y];

    // Down item y point
    const down_item_y_point = itemCoordonates[leftBottomCornerIndex][__y] > itemCoordonates[rightBottomCornerIndex][__y] ?
        itemCoordonates[leftBottomCornerIndex][__y] :
        itemCoordonates[rightBottomCornerIndex][__y];
    // Up item y point
    const up_item_y_point = itemCoordonates[leftTopCornerIndex][__y] > itemCoordonates[rightTopCornerIndex][__y] ?
        itemCoordonates[leftTopCornerIndex][__y] :
        itemCoordonates[rightTopCornerIndex][__y];

    //check item position to the refference
    const isItemUpper = down_refferece_y_point >= down_item_y_point && up_refferece_y_point >= up_item_y_point;

    const isVerticeInBetween = (down_refferece_y_point >= down_item_y_point &&
        up_refferece_y_point <= down_item_y_point) ||
        (down_refferece_y_point >= up_item_y_point &&
            up_refferece_y_point <= up_item_y_point);

    const isItemLower = down_refferece_y_point <= down_item_y_point &&
        up_refferece_y_point <= up_item_y_point;

    const isItemInBetween = (down_refferece_y_point >= down_item_y_point &&
        up_refferece_y_point <= down_item_y_point &&
        down_refferece_y_point >= up_item_y_point &&
        up_refferece_y_point <= up_item_y_point);

    const isRefferenceInBetween = (down_refferece_y_point <= down_item_y_point &&
        up_refferece_y_point <= down_item_y_point &&
        down_refferece_y_point >= up_item_y_point &&
        up_refferece_y_point >= up_item_y_point);

    return ((isItemLower && isVerticeInBetween) || (isItemUpper && isVerticeInBetween) || isItemInBetween || isRefferenceInBetween);
}

function getRectangle(v, avgHeight) {
    let xMin, yMin, xMax, yMax;
    yMin = (v[leftTopCornerIndex].y < v[rightTopCornerIndex].y ? v[leftTopCornerIndex].y : v[rightTopCornerIndex].y);
    yMax = (v[leftTopCornerIndex].y > v[rightTopCornerIndex].y ? v[leftTopCornerIndex].y : v[rightTopCornerIndex].y);
    xMin = v[leftTopCornerIndex].x < v[rightTopCornerIndex].x ? v[leftTopCornerIndex].x : v[rightTopCornerIndex].x;
    xMax = v[leftTopCornerIndex].x > v[rightTopCornerIndex].x ? v[leftTopCornerIndex].x : v[rightTopCornerIndex].x;
    return {xMin : xMin, xMax : xMax, yMin: yMin, yMax: yMax};
}

function createRectCoordinates(line1, line2) {
    return [[line1.xMin, line1.yMin], [line1.xMax, line1.yMin], [line2.xMax, line2.yMax],[line2.xMin, line2.yMax]];
}

var exports = module.exports = {};

exports.getBoundingPolygon = function (mergedArray) {
    return getBoundingPolygon(mergedArray);
};

exports.combineBoundingPolygon = function (mergedArray) {
    return combineBoundingPolygon(mergedArray);
};

exports.fillMissingValues = function (data) {
    return fillMissingValues(data);
};

exports.removeStringsFromData = function (mergedArray, wordsToRemove) {
    return removeStringsFromData(mergedArray, wordsToRemove);
};