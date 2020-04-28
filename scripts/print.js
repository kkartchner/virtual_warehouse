"use strict";
let vars = {
  stickerCount: 0,
  options: ["description", "location", "expiration", "itemCode"],
};

window.onload = function () {
  this.generatePlates();
  window.print();
};

function maxArrayLength(dataMap) {
  let max = -1;
  for (const [k, v] of dataMap) {
    if (v.length > max) {
      max = v.length;
    }
  }
  return max;
}

/* Generate stickers with provided information */
function generatePlates() {
  let dataMap = new Map();

  for (const op of vars.options) {
    // Store arrays to data map
    let key = "print_" + op + "s";
    dataMap.set(key, JSON.parse(localStorage[key]));
  }

  vars.stickerCount = maxArrayLength(dataMap);

  const PLATES_PER_ROW = 2;
  const ROWS_PER_PAGE = 2;

  let pageNum = Math.ceil(vars.stickerCount / (PLATES_PER_ROW * ROWS_PER_PAGE));

  for (var p = 0, stkrIndex = 0; p < pageNum; ++p) {
    let pageTable = document.createElement("table");
    pageTable.className = "page";

    for (var row = 0; row < ROWS_PER_PAGE; ++row) {
      let newRow = document.createElement("tr");
      for (var col = 0; col < PLATES_PER_ROW; ++col) {
        newRow.appendChild(generatePlate(stkrIndex, dataMap));
      }
      pageTable.appendChild(newRow);
    }
    document.getElementById("stickerPages").appendChild(pageTable);
  }
}

/* Generate a single license plate */
function generatePlate(stkrIndex, dataMap) {
  let newTD = document.createElement("td");
  newTD.className = "sticker";
  if (stkrIndex < vars.stickerCount) {
    newTD.innerHTML =
      '<table><tr><td class="description" colspan="3"></td></tr><tr><td class="expDate"></td></tr><tr><td class="binQty"></td><td class="itemCode"></td><td class="qrCode"></td></tr></table>';
    document.body.appendChild(newTD);
    for (const op of vars.options) {
      let opSpan = document.createElement("span");
      opSpan.className = op;
      opSpan.innerHTML = dataMap.get("print_" + op + "s")[stkrIndex];

      newTD.appendChild(opSpan);
    }

    ++stkrIndex;
  }
  return newTD;
}
