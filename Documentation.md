# Database Documentation

> The [database file](./db.db)  
> Each file `<name>.txt` in this folder contains all the SQL queries required for restoring the database.

To restore the entire database quickly, follow these steps:

1. Install the extension `SQLite3 Editor`.
2. Connect each file to the database by clicking the `Connect` button at the top row of the document.
3. Execute all the SQL statements needed by using the shortcut `Shift + Enter`.

## Database Tables

Below is a description of each table in the database, including the parameters and descriptions of each field.

### Document

The `Document` table represents a document that serves as a node of the diagram, detailing various types of official documents.

- `Id`: INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL  
  Specifies the unique identifier for each document.
- `Title`: TEXT UNIQUE NOT NULL  
  Specifies the document's title.
- `Stakeholder`: TEXT NOT NULL  
  Specifies the stakeholder associated with the document.
- `Scale`: TEXT NOT NULL  
  Specifies the scale of the document, often used in architectural or urban planning.
- `Date`: TEXT NOT NULL  
  Specifies the date of the document.
- `Type`: TEXT NOT NULL  
  Specifies the type/category of the document.
- `Language`: TEXT  
  Specifies the language in which the document is written.
- `Page`: INTEGER
  Specifies the number of pages in the document.
- `Coordinate`: TEXT  
  Specifies the geographic coordinate of the document, if applicable (e.g., latitude and longitude).
- `Area`: TEXT REFERENCES Area(Id)
  Specifies the geolocation area the document covers.
- `Description`: TEXT NOT NULL  
  Specifies a brief description of the document.

### Attachment

The `Attachment` table represents any additional files (such as photos, videos, or diagrams) provided to enhance the understanding of the document.

- `Id`: INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL  
  Specifies the unique identifier for each attachment.
- `Path`: TEXT UNIQUE NOT NULL  
  Specifies the local path where the attachment is stored.
- `DocumentId`: INTEGER NOT NULL REFERENCES Document(Id) ON DELETE CASCADE  
  Specifies the reference to the document that the attachment is associated with. If the document is deleted, the related attachment is also deleted.

### Original Resource

The `Resource` table represents original resources related to documents. It may consist of multiple files (e.g., maps, text documents).

- `Id`: INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL  
  Specifies the unique identifier for each original resource.
- `Path`: TEXT UNIQUE NOT NULL  
  Specifies the local path where the original resource is stored.
- `DocumentId`: INTEGER NOT NULL REFERENCES Document(Id) ON DELETE CASCADE  
  Specifies the reference to the document that the original resource is associated with. If the document is deleted, the related original resource is also deleted.

### Connection

The `Connection` table represents the connections between two documents, which is an essential feature for understanding the relationships within the diagram.

- `Id`: INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL  
  Specifies the unique identifier for each connection.
- `SourceDocId`: INTEGER NOT NULL REFERENCES Document(Id) ON DELETE CASCADE  
  Specifies the source document in the connection.
- `TargetDocId`: INTEGER NOT NULL REFERENCES Document(Id) ON DELETE CASCADE  
  Specifies the target document in the connection.
- `Type`: TEXT NOT NULL  
  Specifies the type of connection (e.g., "Direct Consequence," "Collateral Consequence").
- `UNIQUE (SourceDocId, TargetDocId, Type)`  
  Ensures that each connection between two documents is unique.

### Area

The `Area` table represents a geographic area that is associated with one or more documents.

- `Id`: INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL  
  Specifies the unique identifier for each area.
- `Name`: TEXT UNIQUE NOT NULL  
  Specifies the name of the area.
- `Vertex`: TEXT NOT NULL  
  Specifies the list of vertices that define the area, stored in GEOJSON format (e.g., `{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[20.212784,67.857555],[20.211067,67.856714],[20.211754,67.854966],[20.213127,67.853866],[20.214329,67.851924],[20.215015,67.849788],[20.215702,67.848687],[20.216217,67.84804],[20.21656,67.846615],[20.216217,67.844737],[20.216045,67.843701],[20.214157,67.842471],[20.217934,67.8415],[20.213127,67.841176],[20.21347,67.838779],[20.223427,67.841059],[20.224457,67.843896],[20.225487,67.844673],[20.228062,67.846421],[20.228233,67.848104],[20.225658,67.849399],[20.223255,67.850176],[20.221195,67.851989],[20.220165,67.853283],[20.22274,67.854384],[20.22171,67.855161],[20.219479,67.855549],[20.212784,67.857555]]]}}`).

### User

The `User` table represents different types of users who can interact with the system. There are four user roles:

1. **Resident**: A resident of the municipality of Kiruna.
2. **Urban Developer**: Involved in the construction process of the new city.
3. **Urban Planner**: An employee of the municipality, often a professional architect or planner.
4. **Visitor**: A general term for tourists, onlookers, researchers, and anyone studying the relocation.

Since a Visitor and a Resident do not need to log-in, these types of users are not present in the User table

- `Id`: INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL  
  Specifies the unique identifier for each user.
- `Username`: TEXT UNIQUE NOT NULL  
  Specifies the username for user login.
- `Password`: TEXT NOT NULL  
  Specifies the hashed password for the user.
- `Salt`: TEXT NOT NULL  
  Specifies the salt used for hashing the password, ensuring that passwords are secure.
- `Role`: TEXT NOT NULL  
  Specifies the user's role from the predefined list (Resident, Urban Developer, Urban Planner, Visitor).

#### Credential

It is possible to log-in as:

- `Urban Planner`: username: 'user0', password: 'password'
- `Urban Developer`: username: 'user2', password: 'password1'

### Summary

This documentation covers all the tables used in the Kiruna Explorer database, including their columns and relationships. Each table plays an important role in storing data related to documents, geographic areas, users, and connections between documents, allowing for comprehensive interaction with the relocation project of Kiruna.

# API Documentation

This documentation outlines the available API endpoints for the Kiruna Explorer project. Each endpoint is described with details about HTTP methods, request parameters, and their respective purpose.

## Authentication Endpoints

### POST /api/sessions

- **Description**: Logs in a user and starts a session.
- **Request Body**:
  - `username` (string): The username of the user.
  - `password` (string): The user's password.
- **Response**:
  - On success, returns the logged-in user and status `200 OK`.
  - On failure, returns an error message.

### GET /api/sessions/current

- **Description**: Retrieves information about the currently logged-in user.
- **Response**:
  - On success, returns the current user's information.
  - On failure, returns an authentication error.

### DELETE /api/sessions/current

- **Description**: Logs out the current user and ends the session.
- **Response**:
  - Returns `200 OK` on successful logout.

---

## Document Endpoints

### POST /api/documents

- **Description**: Adds a new document to the database.
- **Authentication**: Requires the user to be logged in.
- **Request Body**:
  - `title` (string): Title of the document.
  - `stakeholder` (string): Stakeholder associated with the document.
  - `scale` (string): Scale of the document.
  - `date` (string): Issuance date of the document.
  - `type` (string): Type of document.
  - `language` (string): Language of the document (optional).
  - `page` (number): Number of pages in the document (optional).
  - `coordinate` (array of numbers): Geographic coordinates related to the document (optional).
  - `area` (string): Name of the associated area (optional).
  - `description` (string): Brief description of the document.
  - `formLink` (array of objects, optional): Connections to related documents. Each connection must include:
    - `document` (string): Target document title.
    - `type` (string): Type of the connection (e.g., "Reference").
- **Response**:
  - Returns `201 Created` on success.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/documents

- **Description**: Retrieves all documents from the database.
- **Response**:
  - Returns an array of documents.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/documents/areas/:name

- **Description**: Retrieves all documents associated with a specific area.
- **Path Parameter**:
  - `name` (string): Name of the area.
- **Response**:
  - Returns an array of document titles linked to the specified area.
  - Returns `503 Service Unavailable` if an error occurs.

---

## Connection Endpoints

### POST /api/connections

- **Description**: Creates a new connection between two documents.
- **Authentication**: Requires the user to be logged in.
- **Request Body**:
  - `SourceDocument` (string): Title of the source document.
  - `TargetDocument` (string): Title of the target document.
  - `ConnectionType` (string): Type of connection (e.g., "Direct Consequence").
- **Response**:
  - Returns `200 OK` on success.
  - Returns `409 Conflict` if the connection is duplicate.
  - Returns `404 Not Found` if the source or target document is not found.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/connections/:SourceDoc

- **Description**: Retrieves the number of connections associate to the given source document.
- **Path Parameter**:
  - `SourceDoc` (string): Title of the source document.
- **Response**:
  - Returns the number of connections linked to the specified source document.
  - Returns `404 Not Found` if the source document does not exist.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/connections/info/:SourceDocId

- **Description**: Retrieves detailed information about all connections associate to the given source document.
- **Path Parameter**:
  - `SourceDocId` (number): ID of the source document.
- **Response**:
  - Returns an array of detailed connection information.
    Each connection information must include:
    - `id` (number): Target document id
    - `document` (string): Target document title.
    - `type` (string): Type of the connection (e.g., "Reference").

### GET /api/connections

- **Description**: Retrieves all connections from the database.
- **Response**:
  - Returns an array of connections.
  - Returns `503 Service Unavailable` if an error occurs.

---

## Area Endpoints

### PUT /api/documents/area

- **Description**: Associates an existing area with a document.
- **Authentication**: Requires the user to be logged in.
- **Request Body**:
  - `title` (string): Title of the document.
  - `area` (string): Name of the area to be associated.
- **Response**:
  - Returns `200 OK` on success.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/areas

- **Description**: Retrieves all areas from the database.
- **Response**:
  - Returns an array of areas.
  - Returns `503 Service Unavailable` if an error occurs.

### POST /api/areas

- **Description**: Adds a new area to the database.
- **Authentication**: Requires the user to be logged in.
- **Request Body**:
  - `name` (string): Name of the area.
  - `vertex` (array of arrays of numbers): List of vertices defining the area.
- **Response**:
  - Returns `201 Created` on success with a message indicating the area was added.
  - Returns `503 Service Unavailable` if an error occurs.

### PUT /api/modifyGeoreference

- **Description**: Modifies the georeference (coordinates or area) of a document.
- **Authentication**: Requires the user to be logged in.
- **Request Body**:
  - `name` (string): Name of the document.
  - `coord` (array): New coordinates.
  - `oldCoord` (array): Old coordinates.
  - `area` (string): New area name (optional).
  - `oldArea` (string): Old area name (optional).
- **Response**:
  - Returns `200 OK` on success.
  - Returns `503 Service Unavailable` if an error occurs.

---

## Original Resources Endpoints

### POST /api/originalResources

- **Description**: Uploads a new original resource file.
- **Authentication**: Requires the user to be logged in.
- **Request Body**:
  - `file`: File to be uploaded (binary).
  - `docId` (number): The ID of the document associated with the resource.
- **File Naming**: Uploaded files are saved in a folder named `./OriginalResources` on the server.
  The filename will include a timestamp to prevent overwriting:
- **Response**:
  - Returns `200 OK` on success.
  - Returns `400 Bad Request` if no file is provided.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/originalResources/:docId

- **Description**: Retrieves all original resources associated with a specific document.
- **Authentication**: Requires the user to be logged in.
- **Path Parameter**:
  - `docId` (number): ID of the document whose resources are to be fetched.
- **Response**:
  - Returns an array of resources.
  - Each resource contains:
    - `id` (number): ID of the resource.
    - `name` (string): Name of the resource file.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/originalResources/download/:id

- **Description**: Downloads a specific resource associated with a document.
- **Authentication**: Requires the user to be logged in.
- **Path Parameter**:
  - `id` (number): ID of the resource to be downloaded.
- **Response**:
  - Returns the binary content of the file with appropriate headers.
  - Returns `404 Not Found` if the file is missing.
  - Returns `503 Service Unavailable` if an error occurs.
