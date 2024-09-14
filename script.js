var modal = document.getElementById("modal");
var span = document.getElementsByClassName("close")[0];
var editableCells = document.querySelectorAll(".editable");
var currentCell;
var currentRow;
var modalList = document.querySelector(".modal-list");

var allNames = ["Аня Б", "Аня М", "Артём", "Дима", "Женя", "Инна", "Коля", "Лёша", "Марина", "Надя", "Полина П", "Федя"];
var nameColors = {
    "Аня Б": "#F96F02",
    "Аня М": "#F9CA9E",
    "Артём": "#92C57A",
    "Дима": "#9C9895",
    "Женя": "#6A9FED",
    "Инна": "#F8BD0B",
    "Коля": "#FFF2CB",
    "Лёша": "#72A7AF",
    "Марина": "#E06665",
    "Надя": "#ECD0DC",
    "Полина П": "#C27A9F",
    "Федя": "#D9D9D9"
};

function getColumnValues(columnIndex) {
    var values = [];
    var rows = document.querySelectorAll("tbody tr");
    rows.forEach(function (row) {
        var cells = row.querySelectorAll("td");
        if (cells[columnIndex] && cells[columnIndex].textContent.trim() !== "") {
            values.push(cells[columnIndex].textContent.replace('×', '').trim());
        }
    });
    return values;
}

function getCompositeColumnValues(columnIndex) {
    var values = [];
    var rows = document.querySelectorAll("tbody tr");
    rows.forEach(function (row) {
        var compositeCells = row.querySelectorAll(".composite-cell");
        if (compositeCells[columnIndex]) {
            var subCells = compositeCells[columnIndex].querySelectorAll("div");
            subCells.forEach(function (subCell) {
                if (!subCell.classList.contains("header") && subCell.textContent.trim() !== "") {
                    values.push(subCell.textContent.replace('×', '').trim());
                }
            });
        }
    });
    return values;
}

function updateStats() {
    var stats = {};
    allNames.forEach(function (name) {
        stats[name] = [];
    });

    var columns = document.querySelectorAll("thead th");

    columns.forEach(function (column, colIndex) {
        if (colIndex === 0) return; // Skip the "Roles" header

        var columnName = column.textContent.trim();
        var rows = document.querySelectorAll("tbody tr");

        rows.forEach(function (row) {
            var role = row.querySelector(".fixed-column").textContent.trim();
            var cell = row.querySelectorAll("td")[colIndex];

            if (cell && !cell.classList.contains("composite-cell") && cell.textContent.trim() !== "") {
                stats[cell.textContent.replace('×', '').trim()].push(columnName + " - " + role);
            } else if (cell && cell.classList.contains("composite-cell")) {
                var subCells = cell.querySelectorAll("div");
                subCells.forEach(function (subCell, subIndex) {
                    if (subCell.classList.contains("editable") && subCell.textContent.trim() !== "") {
                        var header = subCell.previousElementSibling.textContent.trim();
                        stats[subCell.textContent.replace('×', '').trim()].push(columnName + " - " + header);
                    }
                });
            }
        });
    });

    var statsContainer = document.getElementById("stats");
    statsContainer.innerHTML = "";
    var counter = 1;

    var sortedNames = Object.keys(stats).sort();
    sortedNames.forEach(function (name) {
        var entry = document.createElement("div");
        entry.textContent = counter + ". " + name + ": " + stats[name].join("; ");
        statsContainer.appendChild(entry);
        counter++;
    });
}

function clearActor(el) {
    el.textContent = "";
    el.style.backgroundColor = "";
    el.classList.add("editable");
    var deleteButton = el.querySelector(".delete-button");
    if (deleteButton) {
        deleteButton.remove();
    }
}

function addDeleteButton(cell) {
    var deleteButton = document.createElement("span");
    deleteButton.innerHTML = "&times;";
    deleteButton.className = "delete-button";
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "2px";
    deleteButton.style.right = "2px";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.color = "red";
    cell.style.position = "relative";
    cell.appendChild(deleteButton);

    deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        var role = cell.parentElement.children[0].textContent.trim();
        if (role === "Саша" || role === "Полицейский") {
            var rowCells = cell.parentElement.querySelectorAll("td");
            rowCells.forEach(function (rowCell, index) {
                if (index > 0) {
                    clearActor(rowCell);
                }
            });
        } else {
            clearActor(cell);
        }
        updateStats();
    });
}

function setActor(el, name) {
    el.textContent = name;
    el.style.backgroundColor = nameColors[name];
    el.classList.remove("editable");
    addDeleteButton(el);
}

editableCells.forEach(function (cell) {
    cell.addEventListener("click", function () {
        currentCell = cell;
        currentRow = cell.parentElement;

        var columnIndex = Array.from(currentRow.children).indexOf(currentCell);
        var usedNames = getColumnValues(columnIndex);

        var availableNames = allNames.filter(function (name) {
            return !usedNames.includes(name);
        });

        modalList.innerHTML = "";
        availableNames.forEach(function (name) {
            var li = document.createElement("li");
            li.textContent = name;
            li.style.backgroundColor = nameColors[name]; // Set background color in modal
            modalList.appendChild(li);

            li.addEventListener("click", function () {
                if (currentRow.children[0].textContent === "Саша" || currentRow.children[0].textContent === "Полицейский") {
                    for (var i = 1; i < currentRow.children.length; i++) {
                        if (currentRow.children[i].classList.contains("editable")) {
                            setActor(currentRow.children[i], name);
                        }
                    }
                } else {
                    setActor(currentCell, name);
                }
                modal.style.display = "none";
                updateStats();
            });
        });

        modal.style.display = "block";
    });
});

var compositeEditableCells = document.querySelectorAll(".composite-cell .editable");

compositeEditableCells.forEach(function (cell) {
    cell.addEventListener("click", function () {
        currentCell = cell;
        currentRow = cell.parentElement.parentElement;

        var compositeParent = cell.parentElement;
        var columnIndex = Array.from(currentRow.children).indexOf(compositeParent);

        var usedNames = getCompositeColumnValues(columnIndex - 1);

        var availableNames = allNames.filter(function (name) {
            return !usedNames.includes(name);
        });

        modalList.innerHTML = "";
        availableNames.forEach(function (name) {
            var li = document.createElement("li");
            li.textContent = name;
            li.style.backgroundColor = nameColors[name]; // Set background color in modal
            modalList.appendChild(li);

            li.addEventListener("click", function () {
                currentCell.textContent = name;
                currentCell.style.backgroundColor = nameColors[name]; // Set background color
                currentCell.classList.remove("editable");
                addDeleteButton(currentCell);
                modal.style.display = "none";
                updateStats();
            });
        });

        modal.style.display = "block";
    });
});

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateStats();
});

function setCast1() {
    //Саша
    setActor(document.getElementById('td11'), "Федя");
    setActor(document.getElementById('td12'), "Федя");
    setActor(document.getElementById('td13'), "Федя");
    setActor(document.getElementById('td14'), "Федя");
    //Полицейский
    setActor(document.getElementById('td21'), "Лёша");
    setActor(document.getElementById('td22'), "Лёша");
    setActor(document.getElementById('td23'), "Лёша");
    setActor(document.getElementById('td24'), "Лёша");
    //Директор
    setActor(document.getElementById('td31'), "Инна");
    setActor(document.getElementById('td32'), "Аня Б");
    setActor(document.getElementById('td33'), "Женя");
    setActor(document.getElementById('td34'), "Полина П");
    //Дорогуша
    setActor(document.getElementById('td41'), "Полина П");
    setActor(document.getElementById('td42'), "Марина");
    setActor(document.getElementById('td43'), "Аня Б");
    setActor(document.getElementById('td44'), "Надя");
    //Серёжа
    setActor(document.getElementById('td51'), "Артём");
    setActor(document.getElementById('td52'), "Коля");
    setActor(document.getElementById('td53'), "Дима");
    setActor(document.getElementById('td54'), "Женя");
    //Влад
    setActor(document.getElementById('td61'), "Женя");
    setActor(document.getElementById('td62'), "Дима");
    setActor(document.getElementById('td63'), "Артём");
    setActor(document.getElementById('td64'), "Коля");
    //Игорь
    setActor(document.getElementById('td71'), "Коля");
    setActor(document.getElementById('td72'), "Женя");
    setActor(document.getElementById('td73'), "Полина П");
    setActor(document.getElementById('td74'), "Дима");
    //Катя
    setActor(document.getElementById('td81'), "Марина");
    setActor(document.getElementById('td82'), "Надя");
    setActor(document.getElementById('td83'), "Инна");
    setActor(document.getElementById('td84'), "Аня Б");
    //Наташа
    setActor(document.getElementById('td91'), "Надя");
    setActor(document.getElementById('td92'), "Полина П");
    setActor(document.getElementById('td93'), "Марина");
    setActor(document.getElementById('td94'), "Инна");
    //Ярослава
    setActor(document.getElementById('tdx1'), "Аня Б");
    setActor(document.getElementById('tdx2'), "Инна");
    setActor(document.getElementById('tdx3'), "Надя");
    setActor(document.getElementById('tdx4'), "Марина");
    //Взрослые
    setActor(document.getElementById('tdy1'), "Дима");
    setActor(document.getElementById('tdy2'), "Полина П");
    setActor(document.getElementById('tdz1'), "Аня Б");
    setActor(document.getElementById('tdz2'), "Артём");
    setActor(document.getElementById('tdz3'), "Лёша");
    setActor(document.getElementById('tdz4'), "Коля");

    updateStats();
}

function setCast2() {
    //Саша
    setActor(document.getElementById('td11'), "Федя");
    setActor(document.getElementById('td12'), "Федя");
    setActor(document.getElementById('td13'), "Федя");
    setActor(document.getElementById('td14'), "Федя");
    //Полицейский
    setActor(document.getElementById('td21'), "Дима");
    setActor(document.getElementById('td22'), "Дима");
    setActor(document.getElementById('td23'), "Дима");
    setActor(document.getElementById('td24'), "Дима");
    //Директор
    setActor(document.getElementById('td31'), "Надя");
    setActor(document.getElementById('td32'), "Аня М");
    setActor(document.getElementById('td33'), "Женя");
    setActor(document.getElementById('td34'), "Марина");
    //Дорогуша
    setActor(document.getElementById('td41'), "Марина");
    setActor(document.getElementById('td42'), "Полина П");
    setActor(document.getElementById('td43'), "Инна");
    setActor(document.getElementById('td44'), "Надя");
    //Серёжа
    setActor(document.getElementById('td51'), "Коля");
    setActor(document.getElementById('td52'), "Артём");
    setActor(document.getElementById('td53'), "Лёша");
    setActor(document.getElementById('td54'), "Женя");
    //Влад
    setActor(document.getElementById('td61'), "Артём");
    setActor(document.getElementById('td62'), "Женя");
    setActor(document.getElementById('td63'), "Коля");
    setActor(document.getElementById('td64'), "Лёша");
    //Игорь
    setActor(document.getElementById('td71'), "Лёша");
    setActor(document.getElementById('td72'), "Коля");
    setActor(document.getElementById('td73'), "Марина");
    setActor(document.getElementById('td74'), "Артём");
    //Катя
    setActor(document.getElementById('td81'), "Полина П");
    setActor(document.getElementById('td82'), "Инна");
    setActor(document.getElementById('td83'), "Надя");
    setActor(document.getElementById('td84'), "Аня М");
    //Наташа
    setActor(document.getElementById('td91'), "Инна");
    setActor(document.getElementById('td92'), "Марина");
    setActor(document.getElementById('td93'), "Аня М");
    setActor(document.getElementById('td94'), "Полина П");
    //Ярослава
    setActor(document.getElementById('tdx1'), "Аня М");
    setActor(document.getElementById('tdx2'), "Надя");
    setActor(document.getElementById('tdx3'), "Полина П");
    setActor(document.getElementById('tdx4'), "Инна");
    //Взрослые
    setActor(document.getElementById('tdy1'), "Женя");
    setActor(document.getElementById('tdy2'), "Марина");
    setActor(document.getElementById('tdz1'), "Аня М");
    setActor(document.getElementById('tdz2'), "Лёша");
    setActor(document.getElementById('tdz3'), "Дима");
    setActor(document.getElementById('tdz4'), "Артём");

    updateStats();
}

function clearCast() {
    //Саша
    clearActor(document.getElementById('td11'));
    clearActor(document.getElementById('td12'));
    clearActor(document.getElementById('td13'));
    clearActor(document.getElementById('td14'));
    //Полицейский
    clearActor(document.getElementById('td21'));
    clearActor(document.getElementById('td22'));
    clearActor(document.getElementById('td23'));
    clearActor(document.getElementById('td24'));
    //Директор
    clearActor(document.getElementById('td31'));
    clearActor(document.getElementById('td32'));
    clearActor(document.getElementById('td33'));
    clearActor(document.getElementById('td34'));
    //Дорогуша
    clearActor(document.getElementById('td41'));
    clearActor(document.getElementById('td42'));
    clearActor(document.getElementById('td43'));
    clearActor(document.getElementById('td44'));
    //Серёжа
    clearActor(document.getElementById('td51'));
    clearActor(document.getElementById('td52'));
    clearActor(document.getElementById('td53'));
    clearActor(document.getElementById('td54'));
    //Влад
    clearActor(document.getElementById('td61'));
    clearActor(document.getElementById('td62'));
    clearActor(document.getElementById('td63'));
    clearActor(document.getElementById('td64'));
    //Игорь
    clearActor(document.getElementById('td71'));
    clearActor(document.getElementById('td72'));
    clearActor(document.getElementById('td73'));
    clearActor(document.getElementById('td74'));
    //Катя
    clearActor(document.getElementById('td81'));
    clearActor(document.getElementById('td82'));
    clearActor(document.getElementById('td83'));
    clearActor(document.getElementById('td84'));
    //Наташа
    clearActor(document.getElementById('td91'));
    clearActor(document.getElementById('td92'));
    clearActor(document.getElementById('td93'));
    clearActor(document.getElementById('td94'));
    //Ярослава
    clearActor(document.getElementById('tdx1'));
    clearActor(document.getElementById('tdx2'));
    clearActor(document.getElementById('tdx3'));
    clearActor(document.getElementById('tdx4'));
    //Взрослые
    clearActor(document.getElementById('tdy1'));
    clearActor(document.getElementById('tdy2'));
    clearActor(document.getElementById('tdz1'));
    clearActor(document.getElementById('tdz2'));
    clearActor(document.getElementById('tdz3'));
    clearActor(document.getElementById('tdz4'));

    updateStats();
}

function downloadImage() {
    html2canvas(document.getElementById('table')).then(function(canvas) {
                var link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'table.png';
                link.click();
            });
}