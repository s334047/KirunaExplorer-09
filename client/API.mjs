const SERVER_URL = "http://localhost:3001/api";
  
/** API Documents */
async function addDocument(title, stakeholder, scale, date, type, language, page, coordinate,area, description) {
    return await fetch(`${SERVER_URL}/documents`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ title, stakeholder, scale, date, type, language, page, coordinate,area, description })
    }).then(response => response.json())
};

async function getAllDocs() {                  //get all the docs in the db
  return await fetch(`${SERVER_URL}/documents`, {
      method: 'GET',
      headers: {
          'Content-type': 'application/json'
      },
  }).then(response => response.json())
}

async function getAreasDoc(name) {                  //get docs of an area
  return await fetch(`${SERVER_URL}/documents/areas/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
          'Content-type': 'application/json'
      },
  }).then(response => response.json())
}

/** API Connections */
async function SetDocumentsConnection(SourceDocument, TargetDocument, ConnectionType) { // all parameters are strings
  return await fetch(`${SERVER_URL}/connections`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ SourceDocument, TargetDocument, ConnectionType })
  }).then(response => response.json())
};

async function GetDocumentConnections(SourceDocument) { // SourceDocument is a string
    return await fetch(`${SERVER_URL}/connections/${encodeURIComponent(SourceDocument)}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    }).then(response => response.json())
}

/** API Areas */
async function addAreaToDoc(title, area){   //add an area to a document
    return await fetch(`${SERVER_URL}/documents/area`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({title, area})
    }).then(response => response.json())
};

async function getAllAreas() {                  //get all the areas in the db
    return await fetch(`${SERVER_URL}/areas`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    }).then(response => response.json())
}

async function addArea(name, vertex) {           //add a new area in the db
  return await fetch(`${SERVER_URL}/areas`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ name, vertex })
  }).then(response => response.json())
};

async function modifyGeoreference(name,coord,oldCoord,area,oldArea) {  //modify the georeference of a document
  return await fetch(`${SERVER_URL}/modifyGeoreference`, {
      method: 'PUT',
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name, coord, oldCoord, area, oldArea })
  }).then(response => response.json())
}

/** API Original Resources  */
async function addOriginalResource(file, docId) {
  const formData = new FormData(); 
  formData.append('file', file);  // Aggiungi il file
  formData.append('docId', docId); 
  return await fetch(`${SERVER_URL}/originalResources`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  }).then(response => response.json())
};

async function getOriginalResources(docId){
  return await fetch(`${SERVER_URL}/originalResources/${docId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
  }).then(response => response.json())
  .then((data) => setFiles(data))
}

async function downloadResource(id){ //scaricare una SINGOLA resource associata a un documento 
  return await fetch(`${SERVER_URL}/originalResources/download/${id}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/octet-stream'
    },
    credentials: 'include,'
  }).then(response => response.json())
}

/** API Authentication */
const logIn = async (credentials) => {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const res = await fetch(`${SERVER_URL}/sessions/current`, {
    credentials: 'include',
  });
  const user = await res.json();
  if (res.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logOut = async () => {
  const res = await fetch(`${SERVER_URL}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (res.ok)
    return null;
}


const API = {addDocument, SetDocumentsConnection, GetDocumentConnections, addAreaToDoc, getAllAreas, addArea,getAllDocs,getAreasDoc,modifyGeoreference, addOriginalResource, getOriginalResources, downloadResource, logIn, getUserInfo, logOut};

export default API;
