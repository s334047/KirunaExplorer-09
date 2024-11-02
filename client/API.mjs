const SERVER_URL = "http://localhost:3001/api";

/** API story 1 */
async function addDocument(title, stakeholder, scale, date, type, language, page, coordinate, area, description) {
    return await fetch(`${SERVER_URL}/documents`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include',
        body: JSON.stringify({ title, stakeholder, scale, date, type, language, page, coordinate, area, description })
    }).then(response => response.json())
};

/** API story 2 */
async function SetDocumentsConnection(SourceDocument, TargetDocument, ConnectionType) { // all parameters are strings
    return await fetch(`${SERVER_URL}/connections`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include',
        body: JSON.stringify({ SourceDocument, TargetDocument, ConnectionType })
    }).then(response => response.json())
};

async function GetDocumentConnections(SourceDocument) { // SourceDocument is a string
    return await fetch(`${SERVER_URL}/connections/${SourceDocument}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include'
    }).then(response => response.json())
}

/** API story 3 */
async function addGeoreference(id, coord, area){   //add an area/coordinate to a document
    return await fetch(`${SERVER_URL}/documents/${id}/area`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include'
        body: JSON.stringify({coord, area})
    }).then(response => response.json())
};

async function getAllAreas() {                  //get all the areas in the db
    return await fetch(`${SERVER_URL}/areas`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include'
    }).then(response => response.json())
}

async function addArea(name, vertex){           //add a new area in the db
    return await fetch(`${SERVER_URL}/areas`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include'
        body: JSON.stringify({name, vertex})
    }).then(response => response.json())
};


const API = {addDocument, SetDocumentsConnection, GetDocumentConnections, addGeoreference, getAllAreas, addArea};

export default API;
