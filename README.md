# Introduction
Google Vision OCR(optical character recognition) can detect and extract text from images. There are ***two*** annotation features that support optical character recognition:
- `TEXT_DETECTION` detects and **extracts text from any image**.
- `DOCUMENT_TEXT_DETECTION` also extracts text from an image, but the response is **optimized for dense text and documents**.
Both options are suitable for data extraction from articles and dense text, but **second option**: `DOCUMENT_TEXT_DETECTION` has an intelligent segmentation method to merge words which are nearby and form lines and paragraphs.

This feature is meant to intelligible merge the content into paragraphs and blocks of text. Although, the algorithm behind the OCR isn't doing a great job in cases you need to extract text from a document(image) where you got gaps(whitespaces between product's title and value for example).

The image below shows the sample output for a document which should be sectioned: 

![enter image description here](https://lh3.google.com/u/0/d/16mxuiZJUjagYfVB0v2q4tfNKLoUD1pJn=w2880-h936-iv1)

This behaviour creates a real problem in the process of information extraction. This particular case was my problem, I was supposed to find a solution to provide an adequate output.

# Explanation
This algorithm provides a different approach of processing the raw data from the GCP Vision response, differently understanding the positioning in the page.
Phases of the algorithm:
 

 - **Merge words/characters which are very close**: the first stage concatenate nearby characters to form words and sentences with characters which have bounding polygons almost merged. This phase helps to reduce the computation needed for the next steps.
 - **Creating bounding polygon**: stage two creates an imaginary system of coordinates with each word/sentence in a polygon(*as in the image below*).
 ![enter image description here](https://lh3.google.com/u/0/d/1zryKdJIbW5fOPvPEAPj6o2w_Hu_k0H5f=w2880-h1578-iv1)

 - **Combine bounding polygon**: the third stage parses through the data and inline the elements. The algorithm tries to fit words into single lines, creating a bigger polygon for each line. (*image below*)
![enter image description here](https://lh3.google.com/u/0/d/1boPtpd6zrVCXcfgNIYdpJXEhnWaG0XPj=w2880-h936-iv1)
 - **Construct lines**: in the final stage algorithm merges words/sentences into single lines and returns the result as an array containing each line.

### Extra feature
Besides the data parsed from GCP, **you can parse a second parameter** to algorithm, an array of words/sentences which you want to get rid of. These strings will be excluded from content and wouldn't be processed furthermore.

Optical character recognition isn't perfect, so if you include a big sentence, it'll most likely be properly deleted. We implemented **js-levenshtein** (admits some mistakes when searching for you string) to match desired string even if the GCP Vision OCR did some mistakes in reading your text from the image.
# Usage Guide
### Installation
Use the following command to install the package.
```npm i line-segmentation-gcp-vision-ocr```

### Usage
All you need to do is to provide the data from the GCP Vision OCR to the init function from the package. The function returns the content processed and segmented by lines. Data should be provided as JSON or directly from GCP response.
There is a simple example of usage:
```
const segmentation = require("line-segmentation-algorithm-to-gcp-vision");

// call GCP Vision and retrieve results
let gcpResponse = {};
let segmentedResult = segmentation.init(gcpResponse[0]['responses'][0]);
```
## Issues
Currently, the algorithm works on scanned documents, horizontally oriented.
## Future Work
 - Implementing in package realizing the text orientation. So it can segment in any orientation any text found in the image.
 - Expanded calculation of boundings, calculating all the angles. In this way, it could work on any images, not only on straight photos/scans of documents.
