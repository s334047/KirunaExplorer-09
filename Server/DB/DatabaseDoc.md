# Database documentation

> The [database file](./db.db)  
> Each file `<name>.txt` in this folder, contains all the query for restoring the database.

To restore all the database (in a quick way) we suggest to:

1. to install the extention `SQLite3 Editor`
2. to connect each file you have to restore, to the database, by clicking the little button `Connect` before the frst top row of the document.
3. to follow the shortcut `Shift + Enter` to execute all the statements needed

## Database table

Here below we have, foreach database table, the list of its parameters and foreach prameter the corresponding description.

## Document

This table represents a document: that is a single node of the diagram

- `Id`: integer primary key autoincrement not null
- `Title`: text unique not null  
  specifies the document's title
- `Stakeholder`: text not null  
  specifies the document's stakeholders
- `Scale`: text not null  
  specifies the document's scale
- `Date`: text not null  
  specifies the document's date without any determined format
- `Type`: text not null  
  specifies the document's type
- `Language`: text not null  
  specifies the document's language
- `Page`: integer not null  
  specifies the document's number of pages
- `Coordinate`: text  
  specifies the document's geolocation coordinates as a single point
- `Area`: text  
  specifies the document's geolocation area
- `Description`: text not null  
  specifies the document's description

## Attachment

This table represents an attachment: that is any additional documentation provided to better understand the original resources

- `Id`: integer primary key autoincrement not null
- `Path`: text unique not null  
  specifies the attachment's local path
- `DocumentId`: integer not null references Document(Id) on delete cascade  
  specifies the attachment's reference to a single document

## Original Resource

This table represents an original resource: that is made of document resources or items, even in multiple files (items or document resources)

> This table's name is shorten to `Resource`

- `Id`: integer primary key autoincrement not null
- `Path`: text unique not null  
  specifies the original resource's local path
- `DocumentId`: integer not null references Document(Id) on delete cascade  
  specifies the original resource's reference to a single document

## Connection

This table represents a connection between two documents

- `Id`: integer primary key autoincrement not null
- `SourceDocId`: integer not null references Document(Id) on delete cascade  
  specifies the origin of the connection: that is the source document
- `TargetDocId`: integer not null references Document(Id) on delete cascade  
  specifies the end of the connection: that is the target document
- `unique`: (SourceDocId, TargetDocId)

## User

This table represents a single user.  
There are four types of users (aka Role):

1. Resident: that is a resident in the municipality of Kiruna
2. Urban developer: that is a figure involved in the construction process of the new city of Kiruna.
3. Urban planner: that is an employee pf the municipality of Kiruna
4. Visitor: that is an umbrella term that includes everyone (from tourists and curious onlookers, to researchers and teachers studying the relocation process of Kiruna)

- `Id`: integer primary key autoincrement not null
- `Username`: text unique not null  
  specifies the user's username for the login
- `Password`: text not null  
  specifies the user's password. It needs to be hashed
- `Salt`: text not null  
  specifies the user's salt used for the password. It needs to be different for every user
- `Role`: text not null  
  specifies the user's role from the list above
