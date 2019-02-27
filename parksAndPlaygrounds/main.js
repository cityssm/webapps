/* global document, Papa */

(function() {
  "use strict";

  const parkSearchObj = {};
  const featuresObj = {};

  const parkFeaturesObj = {};

  // Filter form

  const filter_searchStr_ele = document.getElementById("filter--searchStr");
  let park_eles;

  function filterParks() {

    if (!park_eles) {
      return;
    }

    const searchTerms = filter_searchStr_ele.value.toLowerCase().split(" ");
    let searchTermIndex;

    let parkIndex;
    for (parkIndex = 0; parkIndex < park_eles.length; parkIndex += 1) {

      const park_ele = park_eles[parkIndex];
      const parkKey = park_ele.getAttribute("data-park-key");

      const parkSearchStr = parkSearchObj[parkKey];

      let showPark = true;

      for (searchTermIndex = 0; searchTermIndex < searchTerms.length; searchTermIndex += 1) {

        const searchTerm = searchTerms[searchTermIndex];

        if (parkSearchStr.indexOf(searchTerm) >= 0) {
          continue;

        } else {

          showPark = false;

          const featuresList = parkFeaturesObj[parkKey];

          if (featuresList) {

            let featureIndex;
            for (featureIndex = 0; featureIndex < featuresList.length; featureIndex += 1) {

              const featureObj = featuresObj[featuresList[featureIndex]];

              if (featureObj && featureObj.searchStr.indexOf(searchTerm) >= 0) {
                showPark = true;
                break;
              }
            }
          }
        }

        if (!showPark) {
          break;
        }
      }

      if (showPark) {
        park_ele.removeAttribute("hidden");
      } else {
        park_ele.setAttribute("hidden", "hidden");
      }
    }
  }

  document.getElementById("form--park-filters").addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();
    filterParks();
  });

  filter_searchStr_ele.addEventListener("keyup", filterParks);

  // Load page

  const filesToLoad = ["parks", "features", "parkFeatures"];
  let filesToLoad_index = 0;

  const rawResults = {};

  function loadPage() {

    let parksHTML = "";

    let parksIndex;
    for (parksIndex = 0; parksIndex < rawResults.parks.length; parksIndex += 1) {

      const parkObj = rawResults.parks[parksIndex];
      parkSearchObj[parkObj.parkKey] =
        parkObj.parkName.toLowerCase() + " " +
        parkObj.parkDescription.toLowerCase() + " " +
        parkObj.locationDescription.toLowerCase();

      let parkHTML = "<div class=\"list-group-item\" data-park-key=\"" + parkObj.parkKey + "\">" +
        "<div class=\"d-md-flex justify-content-between\">" +
        "<div>" +
        "<strong>" + parkObj.parkName + "</strong>";

      // description

      if (parkObj.parkDescription !== "") {
        parkHTML += "<br />" +
          parkObj.parkDescription;
      }

      // location link

      let locationMapLink = parkObj.locationMapLink;

      if (locationMapLink === "" && parkObj.locationLatitude !== "" && parkObj.locationLongitude !== "") {
        locationMapLink = "https://www.google.com/maps/@" + parkObj.locationLatitude + "," + parkObj.locationLongitude + ",346m/data=!3m1!1e3";
      }

      if (locationMapLink !== "") {
        parkHTML += "<br />" +
          "<i class=\"fas fa-fw fa-info-circle\"></i> " +
            "<a href=\"" + locationMapLink + "\" target=\"_blank\">" +
            (parkObj.locationDescription === "" ? "Find on a map" : parkObj.locationDescription) +
            "</a>";
      }

      // website

      if (parkObj.websiteLink !== "") {
        parkHTML += "<br />" +
          "<i class=\"fas fa-fw fa-globe-americas\"></i> " +
            "<a href=\"" + parkObj.websiteLink + "\" target=\"_blank\">" +
            (parkObj.websiteTitle === "" ? "See more" : parkObj.websiteTitle) +
            "</a>";
      }

      parkHTML += "</div>";

      // features list

      const featuresList = parkFeaturesObj[parkObj.parkKey];

      if (featuresList) {

        parkHTML += "<div class=\"flex-grow-1 text-right mr-2\"><ul class=\"list-inline\" aria-label=\"Park Features\">";

        let featureIndex;
        for (featureIndex = 0; featureIndex < featuresList.length; featureIndex += 1) {

          const featureObj = featuresObj[featuresList[featureIndex]];

          if (featureObj) {
            parkHTML += "<li class=\"list-inline-item\"><span class=\"badge badge--logo-blue\">" + featureObj.featureName + "</span></li>";
          }
        }

        parkHTML += "</ul></div>";
      }

      parkHTML += "</div>";

      parkHTML += "</div>";

      parksHTML += parkHTML;
    }

    const container_ele = document.getElementById("container--parks");
    container_ele.innerHTML = parksHTML;
    park_eles = container_ele.getElementsByClassName("list-group-item");

    delete rawResults.parks;

    if (filter_searchStr_ele.value !== "") {
      filterParks();
    }
  }

  function processFiles() {

    let featureIndex;
    for (featureIndex = 0; featureIndex < rawResults.features.length; featureIndex += 1) {
      const featureObj = rawResults.features[featureIndex];
      featureObj.searchStr = featureObj.featureName.toLowerCase() + " " + featureObj.keywordList.toLowerCase();
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
