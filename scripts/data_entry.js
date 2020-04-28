"use strict";

let vars = {
    inputClasses: ["itemCode", "description", "location", "binQty", "expiration"]
}

window.onload = initialize;

function initialize() {
    document.getElementById("printBtn").onclick = goToPrintPage;
    document.getElementById("saveBtn").onclick = function () {
        shared.saveCurrentPO(onPOSaved);
    }
    document.getElementById("deleteBtn").onclick = function () {
        shared.deleteCurrentPO(onDeletePO);
    }

    shared.loadSavedPONumbers(onPOLoaded, onNewPOCreated, onPOChanged);
}

function onPOChanged(e) {
    shared.onPONumberChange(e, onNewPOCreated, onPOLoaded, onPOSaved);
}

function onNewPOCreated() {
    clearLines();
    addNewLine();
}
function onPOLoaded() {
    clearLines();
    loadInputBoxData();
}

/***************************************************************************************
 * Create an option in the poNumberSelector for each saved PO number
 ***************************************************************************************/
function loadInputBoxData() {
    let dataTableBody = document.querySelector("table#dataTable > tbody");
    let lineCount = 0;

    let dataMap = new Map();
    let selectedPONumber = shared.getSelectedPONumber();

    for (const c of vars.inputClasses) { // Map each stored array to the datamap
        let dataID = localStorage.getItem(selectedPONumber + c + "s");
        if (dataID !== null) {
            dataMap.set(c, JSON.parse(localStorage[selectedPONumber + c + "s"]));
            let len = dataMap.get(c).length;
            if (len > lineCount) {
                lineCount = dataMap.get(c).length
            }
        }
    }
    for (let i = 0; i < lineCount; ++i) {
        addNewLine(dataMap, i);
    }
    addNewLine(); // Add extra blank line

    vars.changesHaveBeenMade = false;
}
/***************************************************************************************
 * Save the data of the currently selected PO to local storage.
 ***************************************************************************************/
function onPOSaved() {
    /* Save input box data */
    let dataMap = new Map();
    for (const c of vars.inputClasses) {
        const elements = document.getElementsByClassName(c);
        /* Add value to value array if one exists, otherwise add blank space */
        let elementValues = [];
        for (var i = 0; i < elements.length; ++i) {
            //let value = (elements[i].value.length > 0) ? elements[i].value : " ";
            if (elements[i].value.length > 0) {
                elementValues.push(elements[i].value);
            }
        }

        /* Store element values to local storage */
        localStorage[shared.getSelectedPONumber() + c + "s"] = JSON.stringify(elementValues);
    }
}

/***************************************************************************************
 * Delete the data of the currently selected PO from local storage.
 ***************************************************************************************/
function onDeletePO() {
    let curPONumber = shared.getSelectedPONumber();
    for (const c of vars.inputClasses) {
        localStorage.removeItem(curPONumber + c + "s");
    }
}
/****************************************************************************************
* Clear all input box lines.
*****************************************************************************************/
function clearLines() {
    let dataTableBody = document.querySelector("table#dataTable > tbody");
    const lines = document.querySelectorAll("tr.line");
    lines.forEach(line => dataTableBody.removeChild(line));
}
/***************************************************************************************
 * Add a line of inputBoxes with data at index i of the datamap (if specified) or 
 * blank values if not specified.
 * 
 * @param {Map} dataMap - The map of stored data arrays
 * @param {Number} i - The index to use in the dataMap arrays
 ***************************************************************************************/
function addNewLine(dataMap = null, i = -1) {
    let newRow = document.createElement("tr");
    newRow.className = "line";
    for (const c of vars.inputClasses) {
        let newTD = document.createElement("td");
        let newInput = document.createElement("input");
        newInput.type = "text";
        newInput.className = c;
        if (dataMap !== null) {
            try {
                newInput.value = dataMap.get(c)[i];
            } catch (err) {
            }
        }
        if (newInput.className === vars.inputClasses[vars.inputClasses.length - 1]) {
            newInput.addEventListener("change", onNewLineInputBoxChange);
        }
        newInput.addEventListener("change", onInputBoxChange);
        newTD.appendChild(newInput);
        newRow.appendChild(newTD);
    }
    document.querySelector("table#dataTable > tbody").appendChild(newRow);
    newRow.firstElementChild.firstElementChild.focus();
}

/***************************************************************************************
 * Add a line of inputBoxes with data at index i of the datamap (if specified) or 
 * blank values if not specified.
 * 
 * @param {Event} e - The event generated
 ***************************************************************************************/
function onInputBoxChange(e) {
    vars.changesHaveBeenMade = true;
}
/***************************************************************************************
 * Add a line of inputBoxes with data at index i of the datamap (if specified) or 
 * blank values if not specified.
 * 
 * @param {Event} e - The event generated
 ***************************************************************************************/
function onNewLineInputBoxChange(e) {
    // addNewLine();
    e.target.removeEventListener("change", onNewLineInputBoxChange);
}


/***************************************************************************************
 * Sends current information to the print page to be printed onto stickers.
 ***************************************************************************************/
function goToPrintPage() {
    /* Save input box data */
    var stickerNumList = document.getElementsByClassName("stickerNum");
    let dataMap = new Map();
    for (const c of vars.inputClasses) {
        if (c !== "stickerNum") {
            const elements = document.getElementsByClassName(c);
            /* Add value to value array if one exists, otherwise add blank space */
            let elementValues = [];
            for (var i = 0; i < elements.length; ++i) {
                if (elements[i].value.length > 0) {
                    elementValues.push(elements[i].value);
                }
            }

            /* Store element values to local storage */
            localStorage["print_" + c + "s"] = JSON.stringify(elementValues);
        }
    }
    window.open("print.html");
}