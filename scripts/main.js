"use strict";

/****
 * Author: Ky Kartchner
 */
window.onload = initialize;

var globVars = {
    cellAssignClass: ""
}

function initialize() {
    loadAisleSelectorOptions();

    document.getElementById("loadFileBtn").addEventListener("change",
        loadFilledItems);

    document.getElementById("saveBtn").onclick = function () {
        shared.saveCurrentPO(onPOSaved);
    }
    document.getElementById("deleteBtn").onclick = function () {
        shared.deleteCurrentPO(onDeletePO);
    }
    shared.loadSavedPONumbers(onPOLoaded, onNewPOCreated, onPOChanged);

    $("#slotItemBtn").on("click", slotItemWindow);
}

function onPOChanged(e) {
    shared.onPONumberChange(e, onNewPOCreated, onPOLoaded, onPOSaved);
}

function onNewPOCreated() {
}

function onPOLoaded() {
    let curPO = shared.getSelectedPONumber();
    // load item numbers
    try {
        let distinctItemList = [];
        let fullItemArray = JSON.parse(localStorage.getItem(curPO + "descriptions"));
        fullItemArray.forEach(item => {
            if (!distinctItemList.includes(item)) {
                distinctItemList.push(item);
            }
        });

        let selector = document.getElementById("itemSelector");
        //selector.addEventListener("change", onPOChange);

        let optionAddNew = document.getElementById("addNewItem");
        for (const item of distinctItemList) {
            let option = document.createElement("option");
            option.innerHTML = item;
            option.id = item;
            selector.insertBefore(option, selector.lastElementChild);
        }

        selector.selectedIndex = 0;
    } catch (err) {

    }
    // if none exist
    //          open create item menu 
}


/***************************************************************************************
 * Save the data of the currently selected PO to local storage.
 ***************************************************************************************/
function onPOSaved() {
}

/***************************************************************************************
 * Delete the data of the currently selected PO from local storage.
 ***************************************************************************************/
function onDeletePO() {
    // let curPONumber = shared.getSelectedPONumber();
    // for (const c of vars.inputClasses) {
    //     localStorage.removeItem(curPONumber + c + "s");
    // }
}

function loadAisleSelectorOptions() {
    let aisleSelector = document.getElementById("aisleSelector");
    for (let i = 1; i < vars.aisleCount + 1; ++i) {
        let newOption = document.createElement("option");
        newOption.value = i;
        newOption.innerHTML = "Aisle " + i;
        aisleSelector.appendChild(newOption);
    }
    aisleSelector.addEventListener("change", function () {
        resetVisual();
        onSelectedOptions(aisleSelector, generateAisleVisual)
    });
}
function loadFilledItems(e) {
    let reader = new FileReader();
    reader.onload = function () {
        let allLines = reader.result.split(/\r\n|\n|\r/);
        let filledLocations = [];
        try {
            filledLocations = JSON.parse(localStorage.vwh_filledLocations);
        } catch (err){
        }
        allLines.forEach(line => { 
            if (!filledLocations.includes(line)) {
                filledLocations.push(line)
            }
        });
        localStorage.vwh_filledLocations = JSON.stringify(filledLocations);
        displayItemLocationInfo();

    };
    reader.readAsBinaryString(e.target.files[0]);
}

/**************************************************************************************** 
 *                                Event Listener Functions                              */
function displayItemLocationInfo() {
    let binTDs = document.querySelectorAll("table.visual td:not([class='sepAisle']");
    for (let bin of binTDs) {
        bin.className = "empty";
    }

    // for each item in filled location
    let filledLocations = JSON.parse(localStorage.getItem("vwh_filledLocations"));
    if (filledLocations !== null) {
        for (const binLoc of filledLocations) {
            let binTD = document.getElementById(binLoc); // find cell with location as id
            if (binTD !== null) { // set cell class to filled
                binTD.className = "filled";
                // TODO: set cell innerHTML to link that opens item info pop up
            }
        }
    }
    document.addEventListener("mouseup", endSelection);
}

function onSelectedOptions(selector, callBack) {
    for (let i = 0; i < selector.options.length; ++i) {
        if (selector.options[i].selected) {
            callBack(selector.options[i].value);
        }
    }
}
function printAisleHeader(aisleNum) {
    let aisleLabel = document.createElement("h1");
    let visualDisplay = document.getElementById("visualDisplay");
    aisleLabel.innerHTML = "Aisle " + aisleNum;
    visualDisplay.appendChild(aisleLabel);
}

function generateAisleVisual(aisleNum) {
    printAisleHeader(aisleNum);
    let visualTable_west = generateAisleSide(aisleNum, 'West');
    let visualTable_east = generateAisleSide(aisleNum, 'East');

    let visualDisplay = document.getElementById("visualDisplay");
    if (visualTable_west !== null) {
        visualDisplay.appendChild(visualTable_west);
    }
    if (visualTable_east !== null) {
        visualDisplay.appendChild(visualTable_east);
    }

    displayItemLocationInfo();

    let binTDs = document.querySelectorAll("table.visual td.empty")
    for (let bin of binTDs) {
        bin.addEventListener("mousedown", toggleSelect);
    }
}

function extendSelection(e) {
    if (e.target.className === "selected" ||
        e.target.className === "empty") {
        e.target.className = globVars.cellAssignClass;
    }
}

function endSelection() {
    let binTDs = document.querySelectorAll("td.selected, td.empty");
    for (let bin of binTDs) {
        bin.removeEventListener("mouseenter", extendSelection);
    }
}

function resetVisual() {
    let visualDisplay = document.getElementById("visualDisplay");
    visualDisplay.innerHTML = "";
}

function generateAisleSide(aisleNum, side) {
    let visualTable = document.createElement("table");
    visualTable.className = "visual";

    let cur_aisle = vars.aisleList[aisleNum - 1];
    let levelCount = (side == "West") ? cur_aisle.west_lvl_cnt : cur_aisle.east_lvl_cnt;

    for (let levelNum = levelCount; levelNum >= 0; --levelNum) {
        let newRow = document.createElement("tr");
        let binIndex = 0;
        let binNumbers = [];

        let levelLabel = document.createElement("th");
        if (levelNum > 0) {
            levelLabel.innerHTML = levelNum;
        }
        newRow.appendChild(levelLabel);

        let flippedAisle = vars.flip_aisles.includes(parseInt(aisleNum));

        for (const groupLetter of vars.aisleLetters) { // For each grouping letter
            let binCount = (vars.twelvers[aisleNum - 1].includes(groupLetter)) ? 12 : 10;
            let half = Math.floor((binCount) / 2) + 1;

            let start = (side === "West") ? half : 1;
            let end = (side === "West") ? binCount + 1 : half;

            for (let binNum = start; binNum < end; ++binNum) {
                let type = (levelNum > 0 ? "td" : "th");
                let newBin = document.createElement(type);
                newBin.innerHTML = " ";
                newRow.appendChild(newBin);

                binNumbers.push((aisleNum > 9 ? '' : '0') + aisleNum + "-" + groupLetter + (binNum > 9 ? '' : '0') + binNum + "-" + levelNum);

                /* Add aisle seperators as needed*/
                ++binIndex;
                let addIndex_west = 20;
                let addIndex_east = 22;
                let addSeparator = ((side === "West" && binIndex === addIndex_west) ||
                    (side === "East" && binIndex === addIndex_east));
                if (addSeparator) {
                    let sepAisle = document.createElement("td");
                    sepAisle.className = "sepAisle";
                    newRow.appendChild(sepAisle);
                }
            }
        }

        if (side === "East" && !flippedAisle ||
            side === "West" && flippedAisle) {
            binNumbers.reverse();
        }

        for (let bin = newRow.firstChild.nextSibling, i = 0; bin !== null; bin = bin.nextSibling) {
            if (bin.className !== 'sepAisle') {
                bin.id = binNumbers[i];
                if (levelNum > 0) {
                    bin.id = binNumbers[i];
                    bin.title = bin.id;
                } else {
                    let curGroup = bin.id.substr(3, 1);
                    let curBinNum = parseInt(bin.id.substr(4, 2));
                    bin.innerHTML = curGroup + curBinNum;
                }
                ++i;
            }
        }

        visualTable.appendChild(newRow);
    }
    return (levelCount > 0 ? visualTable : null);
}

function toggleSelect(e) {
    e.preventDefault();
    if (e.shiftKey) {
        globVars.cellAssignClass = "filled";
    } else {
        if (e.target.className === "selected") {
            globVars.cellAssignClass = "empty";
        } else if (e.target.className === "empty") {
            globVars.cellAssignClass = "selected";
        }
    }

    e.target.className = globVars.cellAssignClass;

    let binTDs = document.querySelectorAll("table.visual td:not([class='filled']");
    for (let bin of binTDs) {
        bin.addEventListener("mouseenter", extendSelection);
    }
}

function copyLocationsToClipboard() {
    let selectedTDs = document.querySelectorAll("table.visual td.selected");
    let selectedLocations = "";

    if (selectedTDs.length == 0) { // If none are selected, copy all of them
        selectedTDs = document.querySelectorAll("table.visual td:not([class='sepAisle'])");
    }
    selectedTDs.forEach(binTD => {
        selectedLocations += (binTD.id + "\n");
    });

    // Copy locations to clipboard:
    let dummyTextArea = document.createElement("textarea");
    dummyTextArea.value = selectedLocations;
    document.body.appendChild(dummyTextArea);
    dummyTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(dummyTextArea);

    window.alert("The following locations were copied!\n" + selectedLocations);
    //

    let filledTDs = document.querySelectorAll("table.visual td.filled");
    let filledLocations = [];
    filledTDs.forEach(binTD => {
        filledLocations.push(binTD.id);
    });
    localStorage.setItem("vwh_filledLocations", JSON.stringify(filledLocations));
}

function slotItemWindow() {
    let selectedTDs = document.querySelectorAll("table.visual td.selected");
    let selectedLocations = [];

    selectedTDs.forEach(binTD => {
        selectedLocations.push(binTD.id);
    });

    shared.saveCurrentPO();

    localStorage.vwh_selectedLocations = JSON.stringify(selectedLocations);
    PopupCenter("slotItem.html?" + shared.getSelectedPONumber(), "Slot Item", 500, 500);

}

//Based on code from http://www.xtf.dk/2011/08/center-new-popup-window-even-on.html:
// set cell innerHTML to link that opens item info pop up
function PopupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox  
    let dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    let dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    let width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    let height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    let left = ((width / 2) - (w / 2)) + dualScreenLeft;
    let top = ((height / 2) - (h / 2)) + dualScreenTop;
    let newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow  
    if (window.focus) {
        newWindow.focus();
    }
}  