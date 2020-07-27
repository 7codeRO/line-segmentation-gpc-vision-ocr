# Introduction
Google Vision OCR(optical character recognition) can detect and extract text from images. There are ***two*** annotation features that support optical character recognition:
- `TEXT_DETECTION` detects and **extracts text from any image**.
- `DOCUMENT_TEXT_DETECTION` also extracts text from an image, but the response is **optimized for dense text and documents**.
Both options are suitable for data extraction from articles and dense text, but **second option**: `DOCUMENT_TEXT_DETECTION` has an intelligent segmentation method to merge words which are nearby and form lines and paragraphs.

This feature is meant to intelligible merge the content into paragraphs and blocks of text. Although, the algorithm behind the OCR isn't doing a great job in cases you need to extract text from a document(image) where you got gaps(whitespaces between product's title and value for example).

The image below shows the sample output for a document which should be sectioned: 

![enter image description here](https://lh3.googleusercontent.com/4ewldK8wDS07ZXdgI9mhg8IhMAX0B21XU8e5RpDoQemZuW1mdicq9nAdZRtdVhGb6oboVmYsUr94a5vSoap8gvT3rpZYk1WAL7PXYqvsRwcPevRYfkNLMrA_nWI0M5Y8TqCfFCnEftn8DUJ5GD0evLdR2WtXPQIlTay_8hr9cmFo35vxx8BhOgIsALn80koI1xs-uTtuayoG_82Ebo20r8BxlRL_SDqDeikSHNOtDscBkjKJ2hVnUkPCsj21ZNn_c0Jw4sNv8oXKigPNjA2kiCdkE5pmSxwVSa2o3kMlx_t9IOSVkad44tBZNKg2DO2hbNdXaqXVxnRKOG3xSf5w5D4ju6CrO_VpNATfklRzOmYp9q2udfwRRw5RD5cdIDw6F6SStcFpa2zkC76wztoIgOaJhK3EjaJfzZQ3ctdWrD8qgOZWbtk-fo6mb2R3ZLETXpBJ1U3baJoeFif9uHxOn7E1jZKKQVXvN2QHcqaDByZZ1Sc8AAt_OW5zOQxvgaGSFThQ2DV9QdmhXkyOk4yXSgVkjMvzpMBx9698jEqTajsxRGMDf-IhgOIWqClsgc10PP3skkrLP_7bDwn6SW-fsugDBKbaf_J2sS_HFxuH0Jap8oB7yCYmUTvFJjnhjKpYb3XGP_GCAByANUHigAD4a6cShIniTJGHHbn1rHBcEPwKmW9En8IEs5rwaQ06-5mpGrUJZw=w1920-h969-ft)

This behaviour creates a real problem in the process of information extraction. This particular case was my problem, I was supposed to find a solution to provide an adequate output.

# Explanation
This algorithm provides a different approach of processing the raw data from the GCP Vision response, differently understanding the positioning in the page.
Phases of the algorithm:
 

 - **Merge words/characters which are very close**: the first stage concatenate nearby characters to form words and sentences with characters which have bounding polygons almost merged. This phase helps to reduce the computation needed for the next steps.
 - **Creating bounding polygon**: stage two creates an imaginary system of coordinates with each word/sentence in a polygon(*as in the image below*).
 ![enter image description here](https://lh3.googleusercontent.com/roOwIi8AAaa7pHo4mXCotdywYCce64yTDqL2h69Hg0exz_OTALj7uopVW_VmBxXZL9aWWJvsUHcUsILJkJl6NqHMzqUFQhmJwrtVIKJ1ZH0Tb-_D-yCBL9Q9ikZGke-DPXJ8uPVL7BBcVI2qyB5CNPy8EXOTidtpsR-CRFB4TPPFv0wtWG-xkVN7H9Rw49iEgDktcP3kepH-9pNgMIX_E6XlloiXUPagrPUlVr2yTmwhOcbn20xTsLvVsIT6Mod42tKxSfB45zZixovCJxV4B1SyAmywPE20Z0tEx7LqNR6i6ZkOg8F6w--j1KneAAs8Bj0Epcq6NC067R8NzkHgUMYc1VSguzVjPteNZU46WU9rkxv_vysKPBodckoFKir08TbvK6fX1XGRjUD9rNKSDt4VSUmmegSL3yZF0ca4FA409z8vy2DsVLwo7cOITBaW5wK7ZkcrV2plJT69ScaXt1r7hkYHxnXq9tdbnD7S4GmnHWR0VHrp63XTsF6ezNaeTRtWFhiCjxFzASEc7iqKrJmsm1Oex-a3DkOzvB27PoXmVJbvylNoVmkrgrpIh36GExVh7i2O7k3JeuPQeVL4w9ZSEuVNBBW7mJB-2JW3zjXvPbqWAw8cTyG1UplnX12kF42aGccAdcQdtC-OBW8PZhZu1YvVbwMTwL9qtn78kV9-_1YwDXjKvvjL_ylTzHMLqutmtw=w1920-h969-ft)

 - **Combine bounding polygon**: the third stage parses through the data and inline the elements. The algorithm tries to fit words into single lines, creating a bigger polygon for each line. (*image below*)
![enter image description here](https://lh3.googleusercontent.com/D8f8-JJDBB7LcURSBkPd0-HttoQcCaGhJozKj16BUagg4paKiTuhFfWxKbWTrTyxN5Cz1F9s1GS9JgwxRhg-rcRzny5NJEcgqNbTrZrJrjivh7DiVw9pXVa6lbkkQ2Q5HQu4Z5F0lcEPaw05n2Pr1EAfC7wVIzUbTpDzbix_8w0zZOO1zmvPwnWqtLP-lWr0WdeBQL1RJhFBLvFoThNdriB_y3og-HFW8RkDyt_t7pPmpkNcxMhxpRvdnu0Z2sva8zcATFoo6We2T8RXx4qLai6kQL1TocVm2atEQjSTDN9jgG4k9jp1TsoWg9hGVJks97MiBvlsa5XJbp4WNv052TjHsPgFq4tamyfxxZYxomSfySdaOVmzpAAjvFAKKM5_eV1HSi5fgm5LMUwfaU6aZ6S706AwuSIq8nVcMZqnmZ1B1hXKlsytiD805dcj5_2sO2zX0-GNa0AlpwqVNvOV4ea6sFO3XMpGlwjKwBCnIqKMhJ8UtQ_yQgbVXcw1gtRKiMC6lThoYkcy_-6_hY8FVIAoCkFhSOVZCtj0KPIgxNb5f8X4DGA1gzLCcT5_loX3BmyLRUl1dzr9HTSxg82QrgaTo8ecIyGgrj-ifbbCgu0s5c2_RElXFG5Q7jLIb8L_TRQHoU4LBN1THW7sXr2RPEZCSFjqg1zgTlo8ikxq3ID31UrkS_qp9EnqrPpvqhkEs--ADQ=w1920-h648-ft)
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
