const SERVER_URL = "http://localhost:3001/api";

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

async function SetDocumentsConnection(SourceDocument, TargetDocument, ConnectionType) { // all parameters are strings
    return await fetch(`${SERVER_URL}/connections`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include',
        body: JSON.stringify({ SourceDocument, TargetDocument, ConnectionType })
    }).then(response => response.json())
}

async function GetDocumentConnections(SourceDocument) { // SourceDocument is a string
    return await fetch(`${SERVER_URL}/connections/${SourceDocument}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include'
    }).then(response => response.json())
}

const API = { addDocument, SetDocumentsConnection };

export default API;