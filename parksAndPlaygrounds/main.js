/* global document, Papa */

(function() {
  "use strict";

  const filesToLoad = ["parks", "features", "parkFeatures"];
  let filesToLoad_index = 0;

  const rawResults = {};
  const featuresObj = {};
  const parkFeaturesObj = {};

  function loadPage() {

    console.log(rawResults);

    let parksHTML = "";

    let parksIndex;
    for (parksIndex = 0; parksIndex < rawResults.parks.length; parksIndex += 1) {

      const parkObj = rawResults.parks[parksIndex];

      let parkHTML = "<div class=\"list-group-item\">" +
        parkObj.parkName + "<br />";

      const featuresList = parkFeaturesObj[parkObj.parkKey];

      if (featuresList) {

        let featureIndex;
        for (featureIndex = 0; featureIndex < featuresList.length; featureIndex += 1) {

          const featureObj = featuresObj[featuresList[featureIndex]];

          if (featureObj) {

            parkHTML += "<span class=\"badge badge-secondary\">" + featureObj.featureName + "</span> ";
          }
        }
      }

      parkHTML += "</div>";

      parksHTML += parkHTML;
    }

    document.getElementById("parks-container").innerHTML = parksHTML;
  }

  function processFiles() {

    let featureIndex;
    for (featureIndex = 0; featureIndex < rawResults.features.length; featureIndex += 1) {
      const featureObj = rawResults.features[featureIndex];
      featuresObj[featureObj.featureKey] = featureObj;
    }
    delete rawResults.features;

    let parkFeatureIndex;
    for (parkFeatureIndex = 0; parkFeatureIndex < rawResults.parkFeatures.length; parkFeatureIndex += 1) {

      const parkFeatureObj = rawResults.parkFeatures[parkFeatureIndex];

      if (!parkFeaturesObj[parkFeatureObj.parkKey]) {
        parkFeaturesObj[parkFeatureObj.parkKey] = [];
      }

      parkFeaturesObj[parkFeatureObj.parkKey].push(parkFeatureObj.featureKey);
    }
    delete rawResults.parkFeatures;

    loadPage();
  }

  function loadNextFile() {

    const fileName = filesToLoad[filesToLoad_index];

    Papa.parse(fileName + ".csv", {
      download: true,
      delimiter: ",",
      header: true,
      skipEmptyLines: true,
      complete: function(json) {
        rawResults[fileName] = json.data;

        filesToLoad_index += 1;

        if (filesToLoad[filesToLoad_index]) {
          loadNextFile();
        } else {
          processFiles();
        }
      }
    });
  }

  loadNextFile();
}());
