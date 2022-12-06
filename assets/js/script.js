let cachedList = localStorage["list"];
let defaultList = "# VIP list \n\n- Andrew \n- Robert\n- Steve\n";
let vipCount = 0;
let totalSeatCount = 4*8;
let totalRowCount = 4;



$(document).ready(function() {
    //Attempt to fetch the previous VIP list
    fetchCachedList();
});



/*
* Function that handles local storage when the page opens
* Check if the browser has stored a previous VIP list layout
* If not, then show default values
*/
function fetchCachedList() {
    // Check if there is a previously cached list
    if(cachedList) {
        console.log(cachedList);
        prepareList(cachedList);
    } else {
        prepareList(defaultList);
    }
}



/*
* Function that takes an unprepared VIP list string as a param
* Splits it into an array and removes the first two lines of the list
* Example of what gets removed: # VIP list & the empty line under it
*/
function prepareList(list) {
    // Split the list string into an array
    list = list.split("\n");

    // Removes the 2 rows at the start that are unnecessary
    list.shift();
    list.shift();

    // Check if there is an empty row in the end of the list and remove it
    if(list[list.length-1] == "") {
        list.pop();
    }

    loadList(list);
}



function loadSampleData() {
    prepareList(defaultList);
}



/*
* Function that takes a prepared list array as a param
* Loops through the array
* If the index contains "- (anything)" then append the value without "-"
* Else append an empty seat
*/
function loadList(preparedList) {

    // Clears the grid
    $(".single-seat").remove();

    // Variables that help enable to determine current location
    let currentRow = 1;
    let currentRowSeat = 1;
    vipCount = 0;

    for(i = 1; i <= totalSeatCount; i++) {
        let seat = preparedList[i-1]; // -1 Because the loop starts with 1 not 0

        /*
        * Check if the prepared list is finished (all VIPs appended to their seats)
        * If the list is finished, then append remaining empty seats until currentSeat reaches totalSeatCount
        */
        if(seat) {
            seat = seat.trim();
            if(seat.length == 1){
                // Seat is empty
                appendSeat(currentRow, i);
            } else if(seat.length > 1) {
                // Seat contains a VIP
                vipCount++;
                let name = seat.replace("-", "");
                appendSeat(currentRow, i, name);
            }
        } else {
            // Default callback - append remaining empty seats
            appendSeat(currentRow, i);
        }
        
        currentRowSeat++;
        if(currentRowSeat > 8) {
            currentRowSeat = 1;
            currentRow++;
        }
    }

    function appendSeat(row, seat, name="") {
        $(".row-" + row).append("" +
            '<div id="seat-' + seat + '" class="single-seat" ondrop="drop(event)" ondragover="allowDrop(event)">' +
                '<span id="vip-' + seat + '" draggable="true" ondragstart="drag(event)">' +
                    name.trim() +
                '</span>' +
            '</div>'
        );
    }

    updateList();
}



/*
* Function listens for changes on the grid
* If a change occurs it reads the DOM of the grid and replaces the cached list with new grid
*/
function updateList() {
    let vipConfirmedCount = 0;

    let rawData = "";
    rawData = rawData.concat("# VIP list\n\n");

    $(".single-seat").each(function () {
        if(vipConfirmedCount < vipCount) {
            let name = $(this).children().html();
            if(name == "") {
                rawData = rawData.concat("- \n");
            } else {
                rawData = rawData.concat("- " + name + "\n")
                vipConfirmedCount++;
            }
        }
    });

    localStorage.removeItem("list");
    localStorage["list"] = rawData;
    updateRawList(rawData);
}  



/*
* Function refreshes the raw-list by removing the contents
* and then appending new raw data
* Function also scales height with raw data size
*/
function updateRawList(rawData) {
    $(".raw-data").empty();
    $(".raw-data").append(rawData);
    $(".raw-data").css("height", 0);
    $(".raw-data").css("height", $(".raw-data").prop('scrollHeight'));
}



function downloadTxt(s){
    function dataUrl(data) {return "data:application/octet-stream," + encodeURIComponent(data);}
    window.open(dataUrl(s));
}



function readUploadedFile(event) {
    const file = event.target.files[0];
    const name = event.target.files[0].name;
    $(".selected-file").html("Selected file:<b> " + name + "</b>");

    const fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent){
        const textFromFileLoaded = fileLoadedEvent.target.result;
        prepareList(textFromFileLoaded);
    };
    fileReader.readAsText(file, "UTF-8");
}



let parentEl;
let vipEl;
function allowDrop(ev) {
    ev.preventDefault();
}   

function drag(ev) {
    ev.dataTransfer.setData("vip", ev.target.id);
    parentEl = ev.target.parentElement.id;
}    

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("vip");
    ev.target.parentElement.appendChild(document.getElementById(data));
    vipEl = ev.target.id;
    document.getElementById(parentEl).appendChild(document.getElementById(vipEl));
    updateList();
}



function openFullscreen() {
    // Selects the grid element
    let fullscreenContainer = document.querySelector(".sorting-container");
    if (document.fullscreenElement) {
        // If there is an active fullscreen element, remove fullscreen
        document.exitFullscreen();
        $(".sample-button").show();
        $(".fullscreen-button").html("Full-screen");
    } else {
        // If there is no active fullscreen element, make one
        fullscreenContainer.requestFullscreen();
        $(".sample-button").hide();
        $(".fullscreen-button").html("Exit full-screen");
    }
}