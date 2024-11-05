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
- `Language`: TEXT NOT NULL  
  Specifies the language in which the document is written.
- `Page`: INTEGER NOT NULL  
  Specifies the number of pages in the document.
- `Coordinate`: TEXT  
  Specifies the geographic coordinate of the document, if applicable (e.g., latitude and longitude).
- `Area`: TEXT  
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
- `UNIQUE (SourceDocId, TargetDocId)`  
  Ensures that each connection between two documents is unique.

### Area
The `Area` table represents a geographic area that is associated with one or more documents.

- `Id`: INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL  
  Specifies the unique identifier for each area.
- `Name`: TEXT UNIQUE NOT NULL  
  Specifies the name of the area.
- `Vertex`: TEXT NOT NULL  
  Specifies the list of vertices that define the area, stored in JSON format (e.g., `{ [20.5, 35.4], [54.4, 67.5], [37.2, 18.5], [12.4, 20.9] }`).

### AreaDocLink
The `AreaDocLink` table represents the connection between a document and an area, allowing for geographic relationships to be established.

- `AreaId`: INTEGER NOT NULL REFERENCES Area(Id)  
  Specifies the area that includes the document.
- `DocumentId`: INTEGER NOT NULL REFERENCES Document(Id)  
  Specifies the document linked to the area.
- `PRIMARY KEY (AreaId, DocumentId)`  
  Ensures that the link between a document and an area is unique.

### User
The `User` table represents different types of users who can interact with the system. There are four user roles:

1. **Resident**: A resident of the municipality of Kiruna.
2. **Urban Developer**: Involved in the construction process of the new city.
3. **Urban Planner**: An employee of the municipality, often a professional architect or planner.
4. **Visitor**: A general term for tourists, onlookers, researchers, and anyone studying the relocation.

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
  - On success, returns the logged-in user.
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

## Document Endpoints

### POST /api/documents
- **Description**: Adds a new document to the database.
- **Request Body**:
  - `title` (string): Title of the document.
  - `stakeholder` (string): Stakeholder associated with the document.
  - `scale` (string): Scale of the document.
  - `date` (string): Date of the document.
  - `type` (string): Type of document.
  - `language` (string): Language of the document.
  - `page` (number): Number of pages in the document.
  - `coordinate` (array of numbers): Geographic coordinates related to the document.
  - `description` (string): Brief description of the document.
- **Response**:
  - Returns `201 Created` on success.
  - Returns `503 Service Unavailable` if an error occurs.

### PUT /api/documents/area
- **Description**: Associates an existing area with a document.
- **Request Body**:
  - `title` (string): Title of the document.
  - `area` (string): Name of the area to be associated.
- **Response**:
  - Returns `200 OK` on success.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/documents
- **Description**: Retrieves all documents in the database.
- **Response**:
  - Returns an array of documents.

## Area Endpoints

### POST /api/areas
- **Description**: Adds a new area to the database.
- **Authentication**: Requires the user to be logged in.
- **Request Body**:
  - `name` (string): Name of the area.
  - `vertex` (array of arrays of numbers): List of vertices defining the area.
- **Response**:
  - Returns `201 Created` on success with a message indicating the area was added.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/areas
- **Description**: Retrieves all areas from the database.
- **Response**:
  - Returns an array of areas.

### GET /api/area/docs/:name
- **Description**: Retrieves all documents associated with a specific area.
- **Path Parameter**:
  - `name` (string): Name of the area.
- **Response**:
  - Returns an array of document titles linked to the specified area.

## Connection Endpoints

### POST /api/connections
- **Description**: Creates a new connection between two documents.
- **Request Body**:
  - `SourceDocument` (string): Title of the source document.
  - `TargetDocument` (string): Title of the target document.
  - `ConnectionType` (string): Type of connection (e.g., "Direct Consequence").
- **Response**:
  - Returns `200 OK` on success.
  - Returns `503 Service Unavailable` if an error occurs.

### GET /api/connections/:SourceDoc
- **Description**: Retrieves all connections starting from a given source document.
- **Path Parameter**:
  - `SourceDoc` (string): Title of the source document.
- **Response**:
  - Returns an array of connections linked to the specified source document.

## User Information Endpoints

### GET /api/sessions/current
- **Description**: Retrieves information about the logged-in user.
- **Response**:
  - Returns user information if the user is authenticated.
  - Returns `401 Unauthorized` if the user is not authenticated.




