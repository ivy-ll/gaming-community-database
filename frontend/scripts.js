/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */
class missingOperatorErr extends Error {

}

class missingFieldErr extends Error {

}

class invalidNumberErr extends Error {

}

class invalidInputErr extends Error {

}

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
        });
}

// Fetches data from the Game table and displays it in the table.
async function fetchAndDisplayGames() {
    const tableElement = document.getElementById('gameTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/gametable', { method: 'GET' });
    const responseData = await response.json();
    const gameTableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    gameTableContent.forEach(game => {
        const row = tableBody.insertRow();
        game.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetches data from the Game table and displays it in the table.
async function fetchAndDisplayPlatforms() {
    const tableElement = document.getElementById('platformTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/platformtable', { method: 'GET'});
    const responseData = await response.json();
    const gameTableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    gameTableContent.forEach(game => {
        const row = tableBody.insertRow();
        game.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Fetches data from the Studio table and displays it in the table
async function fetchAndDisplayStudios(event) {
    event.preventDefault();

    const response = await fetch('/studio-table', {method: 'GET'});
    const responseData = await response.json();
    const studioTableContent = responseData.data;

    await clearTable("selection-attributes", "selection-body");

    if (studioTableContent.length > 0) {
        const columns = ['Studio ID', 'Studio Name', 'Studio Type', 'Country', 'Year Founded'];
        displayTable(studioTableContent, "selection-attributes", "selection-body", columns);
        document.getElementById('displayAllResultMsg').textContent = "Successfully displaying all studios!";
        document.getElementById('selectionFilterResultMsg').textContent = '';

        document.getElementById('dynamicSelectionForm').innerHTML = '';

    } else {
        document.getElementById('displayAllResultMsg').textContent = "Error displaying all studios!";

    }
}

// Fetches data from the Creates table and displays it in the table
// async function fetchAndDisplayCreates() {
//     const tableElement = document.getElementById('createsTable');
//     const tableBody = tableElement.querySelector('tbody');
//
//     const response = await fetch('/creates-table', { method: 'GET' });
//     const responseData = await response.json();
//     const createsTableContent = responseData.data;
//
//     // Clear old data before inserting new data
//     if (tableBody) {
//         tableBody.innerHTML = '';
//     }
//
//     createsTableContent.forEach(creates => {
//         const row = tableBody.insertRow();
//         creates.forEach((field, index) => {
//             const cell = row.insertCell(index);
//             cell.textContent = field !== null ? field : 'N/A'; // Handle null values gracefully
//         });
//     });
// }

// Initialize or reset the Game table.
async function initiateGameTable() {
    const response = await fetch("/initiate-gametable", { method: 'POST' });
    const responseData = await response.json();

    const messageElement = document.getElementById('resetResultMsg');
    if (responseData.success) {
        messageElement.textContent = "Game table initialized successfully!";
        fetchAndDisplayGames();
    } else {
        messageElement.textContent = "Error initializing Game table!";
    }
}

// Insert a new record into the Game table along with Studio and Creates relations.
async function insertGame(event) {
    event.preventDefault();
    const messageElement = document.getElementById('insertResultMsg');

    // Get game-related inputs
    const gameID = document.getElementById('gameID').value;
    const gameTitle = document.getElementById('gameTitle').value;
    const crossplay = document.getElementById('crossplay').value;
    // Get studio-related inputs
    const studioID = document.getElementById('studioID').value;
    const studioName = document.getElementById('studioName').value;
    const country = document.getElementById('country').value;
    const studioType = document.getElementById('studioType').value;
    const yearFound = document.getElementById('yearFound').value;


    // checking for special characters
    const validationArr = [gameTitle, studioName, country, studioType];

    try {
        validationArr.forEach((attribute) => {
            if (!validateInput(attribute)) {
                throw new invalidInputErr();
            }
        });
    } catch (err) {
        messageElement.textContent = "Error: Special characters detected!";
        return;
    }

    // checking for negative year
    if (parseInt(yearFound) <= 1000) {
        messageElement.textContent = "Error: Please enter a valid year!";
        return;
    }

    // Send a POST request to insert the game and studio
    try {
        const response = await fetch('/insert-game-with-studio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game: { gameID, gameTitle, crossplay },
                studio: { studioID, studioName, country, studioType, yearFound }
            })
        });

        const responseData = await response.json();
        if (response.ok) {
            messageElement.textContent = "Success: Game and Studio inserted successfully!";
            fetchAndDisplayGames(); // Update the displayed list of games
        } else {
            messageElement.textContent = `Error: ${responseData.message}`;
        }
    } catch (err) {
        messageElement.textContent = `Unexpected error: ${err.message}`;
    }
}

// Update a game's details in the Game table.
async function updateGame(event) {
    event.preventDefault();

    const messageElement = document.getElementById('updateResultMsg');

    const gameID = document.getElementById('updateGameID').value;
    const gameTitle = document.getElementById('newGameTitle').value;
    const crossplay = document.getElementById('newCrossplay').value;

    // Validate input
    if (!gameID) {
        messageElement.textContent = "Game ID is required.";
        return;
    }
    if (gameTitle && !validateInput(gameTitle)) {
        messageElement.textContent = "Special characters detected in Game Title!";
        return;
    }

    // Prepare updated details dynamically
    const updatedDetails = {};
    if (gameTitle) updatedDetails.gameTitle = gameTitle;
    if (crossplay) updatedDetails.crossplay = crossplay;

    const response = await fetch('/update-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameID, updatedDetails })
    });

    const responseData = await response.json();

    if (responseData.success) {
        messageElement.textContent = "Game updated successfully!";
        fetchAndDisplayGames();
    } else {
        messageElement.textContent = "No updates were made. Please ensure unique game title and ID.";
    }
}

// Delete an entry in the Game Table
async function deleteGame(event) {
    event.preventDefault();

    const gameID = document.getElementById('deleteGameID').value;

    const response = await fetch('/delete-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameID })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Game deleted successfully!";
        fetchAndDisplayGames();
    } else {
        messageElement.textContent = "Error deleting game!";
    }
}

// update frontend to display selection form
async function displaySelectionForm(event) {
    event.preventDefault();

    clearTable("selection-attributes", "selection-body");

    document.getElementById('selectionFilterResultMsg').innerText='';
    document.getElementById('displayAllResultMsg').innerText='';

    const selectedAttributes = Array.from(document.querySelectorAll('input[name="studioAttributes"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedAttributes.length === 0) {
        document.getElementById('selectionFilterResultMsg').textContent = "No attributes selected!";
        return;
    }

    const valueMap = {
        yearFound: "Year Found",
        studioID: "Studio ID",
        studioName: "Studio Name",
        studioType: "Studio Type",
        country: "Country"
    };

    const selectFormContainer = document.querySelector('#selection-container');

    const existingForm = document.getElementById('dynamicSelectionForm');
    if (existingForm) existingForm.remove();

    const dynamicForm = document.createElement('div');
    dynamicForm.id = 'dynamicSelectionForm';
    selectFormContainer.appendChild(dynamicForm);

    selectedAttributes.forEach((attribute, index) => {
        const attributeFilterDiv = document.createElement('div');
        attributeFilterDiv.classList.add('selectFilter');

        const inputRowDiv = document.createElement('div');
        inputRowDiv.classList.add('attributeInputRow');

        const inputLabel = document.createElement('label');
        inputLabel.innerText = `${valueMap[attribute]}: `;
        inputLabel.classList.add('attributeInputLabel');

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.name = `filter-${attribute}`;
        inputField.placeholder = 'Enter ' + `${valueMap[attribute]}`;
        inputField.required = true;
        inputField.classList.add('attributeInputField');

        const logicalOperatorDiv = document.createElement('div');
        logicalOperatorDiv.classList.add('logicRow');

        // generating logic operators inbetween attribute inputs
        if (index < selectedAttributes.length - 1) {
            const andDiv = document.createElement('div');
            andDiv.classList.add('andSection');
            const andOption = document.createElement('input');
            andOption.type = 'radio';
            andOption.name = `logical-${index}`;
            andOption.value = 'AND';
            andOption.required = true;
            const andLabel = document.createElement('label');
            andLabel.innerText = 'AND';

            andLabel.classList.add('andText');

            andDiv.appendChild(andLabel);
            andDiv.appendChild(andOption);

            const orDiv = document.createElement('div');
            orDiv.classList.add('orSection');
            const orOption = document.createElement('input');
            orOption.type = 'radio';
            orOption.name = `logical-${index}`;
            orOption.value = 'OR';
            orOption.required = true;
            const orLabel = document.createElement('label');
            orLabel.innerText = 'OR';

            orLabel.classList.add('orText');

            orDiv.appendChild(orLabel);
            orDiv.appendChild(orOption);

            logicalOperatorDiv.appendChild(andDiv);
            logicalOperatorDiv.appendChild(orDiv);

        }

        inputRowDiv.appendChild(inputLabel);

        // generating dropdown for numeric attributes
        if (['yearFound', 'studioID'].includes(attribute)) {
            inputField.type = 'number';

            const compareDropdown = document.createElement('select');
            compareDropdown.name = `compare-${attribute}`;
            compareDropdown.innerHTML = `
                <option value="=">=</option>
                <option value=">">></option>
                <option value="<"><</option>
            `;
            compareDropdown.classList.add('attributeInputDropdown');

            inputRowDiv.appendChild(compareDropdown);

        } else {
            const spaceHolder = document.createElement('span');
            spaceHolder.classList.add('attributeInputSpaceHolder');
            inputRowDiv.appendChild(spaceHolder);
        }

        inputRowDiv.appendChild(inputField);
        attributeFilterDiv.appendChild(inputRowDiv);

        // adding logic row selector if in between attributes
        if (index < selectedAttributes.length - 1) {
            attributeFilterDiv.appendChild(logicalOperatorDiv);
        }

        dynamicForm.appendChild(attributeFilterDiv);
    });

    // generating form submission button
    const submitButton = document.createElement('button');
    submitButton.id = 'select-studio';
    submitButton.innerText = 'Search for Studio';

    dynamicForm.appendChild(submitButton);

    submitButton.addEventListener('click', filterStudio);
}

// clears selection form
async function clearSelectionForm() {
    clearTable("selection-attributes", "selection-body");

    document.getElementById('selectAttributesStudioForm').reset();

    document.getElementById('selectionFilterResultMsg').innerText = 'Search results cleared!';
    document.getElementById('displayAllResultMsg').innerText = '';

    document.getElementById('dynamicSelectionForm').innerHTML = '';
}

// apply selection query filter to studio
async function filterStudio(event) {
    event.preventDefault();

    const selectedAttributes = Array.from(document.querySelectorAll('input[name="studioAttributes"]:checked'))
        .map(checkbox => checkbox.value);

    const filters = [];

    let numberInput;

    try {
        selectedAttributes.forEach((attribute, index) => {
            const inputField = document.querySelector(`input[name="filter-${attribute}"]`);

            const inputValue = inputField.value;

            // retrieving comparator operator
            let comparisonOperator = '=';
            if (['yearFound', 'studioID'].includes(attribute)) {
                const compareDropdown = document.querySelector(`select[name="compare-${attribute}"]`);
                comparisonOperator = compareDropdown.value;

                // checking for integer value
                numberInput = parseInt(inputValue);
                if (isNaN(numberInput)) {
                    throw new invalidNumberErr();
                }
            }

            // checking for empty field
            if (inputValue === '') {
                throw new missingFieldErr();
            }

            // checking for special chars
            if (!validateInput(inputValue)) {
                throw new invalidInputErr();
            }

            // retrieving logical operator
            let logicalOperator;

            if (index < selectedAttributes.length - 1) {
                // checking for unselected logic operator
                try {
                    logicalOperator = document.querySelector(`input[name="logical-${index}"]:checked`).value;
                } catch (err) {
                    throw new missingOperatorErr();
                }
            } else {
                logicalOperator = '';
            }

            if (inputValue) {
                filters.push({
                    attribute,
                    value: inputValue,
                    comparisonOperator,
                    logicalOperator
                });
            }
        });

    } catch (err) {
        if (err instanceof missingOperatorErr) {
            document.getElementById('selectionFilterResultMsg').textContent = "Please select a logical operator!";

        } else if (err instanceof missingFieldErr) {
            document.getElementById('selectionFilterResultMsg').textContent = "Please fill out all fields!";

        } else if (err instanceof invalidNumberErr) {
            if (selectedAttributes.includes('studioID') && selectedAttributes.includes('yearFound')) {
                document.getElementById('selectionFilterResultMsg').textContent = "Please enter a number for Studio ID and Year Found!";

            } else if (selectedAttributes.includes('studioID')) {
                document.getElementById('selectionFilterResultMsg').textContent = "Please enter a number for Studio ID!";
            } else {
                document.getElementById('selectionFilterResultMsg').textContent = "Please enter a number for Year Found!";
            }

        } else if (err instanceof invalidInputErr) {
            document.getElementById('selectionFilterResultMsg').textContent = "Invalid character detected!";

        } else {
            document.getElementById('selectionFilterResultMsg').textContent = "Error searching for studios!";

        }

        return;
    }

    const response = await fetch('/select-filter-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            { filters })
    });

    const responseData = await response.json();

    await clearTable("selection-attributes", "selection-body");

    if (responseData.success && responseData.data.length > 0) {
        const columns = ['Studio ID', 'Studio Name', 'Studio Type', 'Country', 'Year Founded'];
        displayTable(responseData.data, "selection-attributes", "selection-body", columns);

        const selectForm = document.getElementById('dynamicSelectionForm');
        selectForm.innerHTML = '';

        document.getElementById('selectionFilterResultMsg').textContent = "Successfully searched for studios!";
    } else {
        document.getElementById('selectionFilterResultMsg').textContent = "No studios found!";
    }
}

// Apply projection query filter to Game Awards
async function projectGameAwards(event) {
    event.preventDefault();

    clearTable("game-awards-attributes", "game-awards-body");

    const selectedColumns = Array.from(document.querySelectorAll('input[name="gameAwardsAttributes"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedColumns.length === 0) {
        document.getElementById('projFilterResultMsg').textContent = "No attributes selected!";
        return;
    }

    const response = await fetch('/proj-filter-game-awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedColumns })
    });

    const responseData = await response.json();

    if (responseData.success) {
        updateGameAwardsTable(responseData.data, selectedColumns);
        document.getElementById('projFilterResultMsg').textContent = "Successfully displayed awards!";
    } else {
        document.getElementById('projFilterResultMsg').textContent = "Error displaying awards!";
    }
}

// display gameAwards table with results
async function updateGameAwardsTable(data, columns) {
    const tableHeader = document.getElementById("game-awards-attributes");
    const tableBody = document.getElementById("game-awards-body");
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    const headerNames = {
        'gameID': 'Game ID',
        'gameTitle': 'Game Title',
        'awdTitle': 'Award Title',
        'awdYear': 'Award Year',
        'awdDescription': 'Award Description',
    };

    if (columns.length === 0) {
        return;
    }

    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = headerNames[column];
        tableHeader.appendChild(th);
    });

    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach((column,index) => {
            const td = document.createElement('td');
            td.textContent = row[index] !== null ? row[index] : 'N/A';
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Joins Game, GameOnPlatform, Platform
async function joinGamePlatform(event) {
    event.preventDefault();

    const selectedPlatform = document.getElementById('selectedPlatform');
    const platformType = selectedPlatform.value;

    const response = await fetch('/join-game-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformType })
    });

    const responseData = await response.json();

    await clearTable("game-platform-attributes", "game-platform-body");

    if (responseData.length > 0) {
        const columns = ['Game ID', 'Game Title', 'Platform Name', 'Platform Type', 'Release Date', 'Price (CAD)'];
        displayTable(responseData, "game-platform-attributes", "game-platform-body", columns);
        document.getElementById('joinResultMsg').textContent = "Successfully displayed games on platform!";
    } else {
        document.getElementById('joinResultMsg').textContent = "Error displaying games on platform!";
    }
}

// Fetches and displays the results of the GROUP BY query
async function fetchAndDisplayGroupBy() {
    const response = await fetch('/group-by-games-per-studio', { method: 'GET' });
    const responseData = await response.json();
    const groupByData = responseData.data;

    if (groupByData.length > 0) {
        const columns = ["Studio Name", "Number of Games"];
        displayTable(groupByData, "studio-groupby-attributes", "studio-groupby-body", columns);
        document.getElementById('groupByResultMsg').textContent = "Displayed studios and games successfully!";
    } else {
        document.getElementById('groupByResultMsg').textContent = "Error displaying and games studios!";
    }
}

// fetches + displays number of awards per game (HAVING query)
async function showGameAwards() {
    const response = await fetch('/having-more-than-one-award', { method: 'GET' });
    const responseData = await response.json();
    const groupByData = responseData.data;

    if (groupByData.length > 0) {
        const columns = ["Game Title", "Number of Awards"];
        displayTable(groupByData, "awards-having-attributes", "awards-having-body", columns);
        document.getElementById('havingResultMsg').textContent = "Successfully displayed games and number of awards!";
    } else {
        document.getElementById('havingResultMsg').textContent = "Error displaying games and number of awards!";
    }
}

// showing studios with top average ratings (nested aggregation)
async function showTopStudios(event) {
    event.preventDefault();

    const response = await fetch('/get-studio-ratings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const responseData = await response.json();
    const studioData = responseData.data;

    if (studioData.length > 0) {
        const columns = ['Studio Title', 'Studio Type', 'Country', 'Year Founded', 'Average Game Rating'];
        displayTable(studioData, "studio-rating-attributes", "studio-rating-body", columns);
        document.getElementById('studioRatingResultMsg').textContent = "Displayed top studios successfully!";
    } else {
        document.getElementById('studioRatingResultMsg').textContent = "Error displaying top studios!";
    }
}

// show games on all platforms (division)
async function findGamesAllPlatforms(event) {
    event.preventDefault();

    const response = await fetch('/divide-game-platforms', { method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const responseData = await response.json();
    const gameData = responseData.data;

    if (gameData.length > 0) {
        const columns = ['Game Title', 'Platform Names', 'Crossplay'];
        displayTable(gameData, "game-all-platform-body", "game-all-platform-body", columns);
        document.getElementById('divideResultMsg').textContent = "Displaying games successfully!";
    } else {
        document.getElementById('divideResultMsg').textContent = "Error displaying games!";
    }
}

// general function to dynamically display tables
async function displayTable(data, tableHeadID, tableBodyID, columns) {
    if (data.length === 0) {
        return;
    }

    const tableHeader = document.getElementById(tableHeadID);
    const tableBody = document.getElementById(tableBodyID);
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        tableHeader.appendChild(th);
    });

    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// clears table
async function clearTable(tableHeadID, tableBodyID) {
    const tableHeader = document.getElementById(tableHeadID);
    const tableBody = document.getElementById(tableBodyID);
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
}

// Count rows in the Game table.
async function countGames() {
    const response = await fetch("/count-games", { method: 'GET' });
    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of games in the database: ${tupleCount}`;
    } else {
        messageElement.textContent = "Error counting games!";
    }
}

// function to check inputs for special characters (letters, numbers, spaces, commas, exclamation pts, colons allowed
function validateInput(value) {
    const allowedChars = /^[a-zA-Z0-9 ':!]*$/;
    return allowedChars.test(value);
}

// ---------------------------------------------------------------
// Initialize the webpage functionalities.
window.onload = function() {
    checkDbConnection();
    fetchAndDisplayGames();
    //fetchAndDisplayCreates();
    document.getElementById("resetGameTable").addEventListener("click", initiateGameTable);
    document.getElementById("insertGameForm").addEventListener("submit", async (event) => {
        await insertGame(event);
        fetchAndDisplayGames();
        //  fetchAndDisplayCreates();
    });
    document.getElementById("updateGameForm").addEventListener("submit", updateGame);
    document.getElementById("deleteGameForm").addEventListener("submit", deleteGame);
    document.getElementById("filters-for-selection").addEventListener("click", displaySelectionForm);
    if(document.getElementById("select-studio")){
        document.getElementById("select-studio").addEventListener("click", filterStudio);
    }
    document.getElementById("reset-selection").addEventListener("click", clearSelectionForm);
    document.getElementById("show-studios").addEventListener("click", fetchAndDisplayStudios);
    document.getElementById("projectionButton").addEventListener("click", projectGameAwards);
    document.getElementById("joinPlatformGameForm").addEventListener("submit", joinGamePlatform);
    document.getElementById('groupByButton').addEventListener('click', fetchAndDisplayGroupBy);
    document.getElementById('havingButton').addEventListener('click', showGameAwards);
    document.getElementById("show-best-studios").addEventListener("click", showTopStudios);
    document.getElementById("divideButton").addEventListener("click", findGamesAllPlatforms);
    document.getElementById("countGames").addEventListener("click", countGames);
};
