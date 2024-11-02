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
async function addGeoreference(id, coordinate, area){
    console.log(id, coordinate, area);
    return await fetch(`${SERVER_URL}/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify({coordinate, area})
    }).then(response => response.json())
};


const API = {addDocument, addGeoreference, SetDocumentsConnection, GetDocumentConnections}
       
if (!response.ok) {
    throw new Error('Invalid username or password');
}

return await response.json();

export default API;
