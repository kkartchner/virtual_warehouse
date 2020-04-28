let shared = {
    changesHaveBeenMade: false,
    getSelectedPONumber: function () {
        let s = document.getElementById("poNumberSelector");
        return s.options[s.selectedIndex].innerHTML;
    },
    /***************************************************************************************
     * Create an option tag in the poNumberSelector for each saved PO number; prompt user
     * to enter a new PO if none are found.
     ***************************************************************************************/
    loadSavedPONumbers: function (onLoadSuccess = null, onNewPOSuccess = null, onPOChange) {
        let selector = document.getElementById("poNumberSelector");
        selector.addEventListener("change", onPOChange);

        let optionCreateNew = document.getElementById("createNewPO");
        try { /* Load saved numbers if they exist and create an option for each one */
            const savedNumbers = JSON.parse(localStorage["shrd_savedPONumbers"]);
            for (const num of savedNumbers) {
                let option = document.createElement("option");
                option.innerHTML = num;
                option.id = num;
                selector.insertBefore(option, selector.lastElementChild);
            }
            selector.selectedIndex = localStorage["shrd_prevSelectedPOIndex"];
            if (onLoadSuccess !== null) {
                onLoadSuccess();
            }
        } catch (err) { /* Otherwise, open prompt to create new PO number */
            shared.newPONumber(onNewPOSuccess);
        }
        shared.changesHaveBeenMade = false;
    },
    /****************************************************************************************
     * Display prompt for entering a new PO number. If one is entered, create an option for
     * it in the selector box and return it.
     * 
     * @returns {Option} newNumber - An option tag containing new PO information.
     ****************************************************************************************/
    newPONumber: function (onSuccess = null) {
        let newNumber = document.createElement("option");
        let savedNumbers = JSON.parse(localStorage.getItem("shrd_savedPONumbers"));

        let valid = false;
        let number = -1;
        while (!valid) {
            valid = true;
            number = window.prompt("Enter PO number");

            if (number != null) {
                if (number === "") {
                    window.alert("Please enter a PO Number");
                    valid = false;
                } else if (savedNumbers !== null && savedNumbers.includes(number)) {
                    window.alert("PO# '" + number + "' already exists.");
                    valid = false;
                }
            } else {
                return null;
            }
        }
        if (newNumber !== null) {
            newNumber.innerHTML = number;
            newNumber.id = number;
            let selector = document.getElementById("poNumberSelector");
            selector.insertBefore(newNumber, selector.lastElementChild);
            selector.selectedIndex = selector.length - 2;
            localStorage["shrd_prevSelectedPOIndex"] = selector.selectedIndex;

            shared.changesHaveBeenMade = true;

            if (onSuccess !== null) {
                onSuccess();
            }
        }
    },
    /****************************************************************************************
    * Function to execute whenever the PO selector value is change. 
    * @param {Event} e - The generated event object
    *****************************************************************************************/
    onPONumberChange: function (e, onNewPOSuccess = null, onChangePOSuccess = null, onSavePOSuccess = null) {
        let selector = e.target;
        if (selector.options[selector.selectedIndex].id === "createNewPO") {
            shared.newPONumber(onNewPOSuccess);
        } else {
            if (shared.changesHaveBeenMade) {
                if (window.confirm("You have unsaved changes - Would you like to save them?")) {
                    shared.saveCurrentPO(onSavePOSuccess);
                }
            }
            localStorage["shrd_prevSelectedPOIndex"] = selector.selectedIndex;

            if (onChangePOSuccess !== null) {
                onChangePOSuccess();
            }
        }
    },
    /**************************************************************************************** 
     *                                Current PO Actions                                    */
    /***************************************************************************************
     * Save the data of the currently selected PO to local storage.
     ***************************************************************************************/
    saveCurrentPO: function (saveData = null) {
        const selector = document.getElementById("poNumberSelector");

        /* Save poNumber if needed */
        if (localStorage.getItem("shrd_prevSelectedPOIndex") === null) {
            localStorage.shrd_prevSelectedPOIndex = selector.selectedIndex;
        }
        const poNumber = selector.options[localStorage.shrd_prevSelectedPOIndex].innerHTML;

        let savedNumbers = (localStorage.getItem("shrd_savedPONumbers") === null) ? [] : JSON.parse(localStorage["shrd_savedPONumbers"]);
        if (!savedNumbers.includes(poNumber)) {
            savedNumbers.push(poNumber);
            localStorage["shrd_savedPONumbers"] = JSON.stringify(savedNumbers);
        }
        /******************************/

        if (saveData !== null) {
            saveData();
        }

        window.alert("Data saved successfully!");
        shared.changesHaveBeenMade = false;
    },
    /***************************************************************************************
     * Deletes all stored data associated with the current PO.
     ***************************************************************************************/
    deleteCurrentPO: function (deletePOData = null) {
        if (confirm("Delete current PO?")) {
            let curPONumber = shared.getSelectedPONumber();
            let savedNumbers = JSON.parse(localStorage.shrd_savedPONumbers);
            savedNumbers.splice(savedNumbers.indexOf(curPONumber), 1);

            if (savedNumbers.length > 0) {
                localStorage.shrd_savedPONumbers = JSON.stringify(savedNumbers);
            } else {
                localStorage.removeItem("shrd_savedPONumbers");
            }

            if (deletePOData !== null) { // Delete data if provided
                deletePOData();
            }

            // Remove current PO as option in drop down list
            let poOption = document.getElementById(curPONumber);
            poOption.parentElement.removeChild(poOption);

            //TODO: Refresh page
        }
    }
}