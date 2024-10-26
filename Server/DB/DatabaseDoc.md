# Database documentation

> The [database file](./db.db)  
Each file `<name>.txt` in this folder, contains all the query for restoring the database.

To restore all the database (in a quick way) we suggest to:

1. to install the extention `SQLite3 Editor`
2. to connect each file you have to restore, to the database, by clicking the little button `Connect` before the frst top row of the document.
3. to follow the shortcut `Shift + Enter` to execute all the statements needed

## Table

### Document

- `Id`: integer primary key autoincrement not null,
- `Title`: text unique not null,
- `Stackeholder`: text not null,
- `Scale`: text not null,
- `Date`: text not null,
- `Type`: text not null,
- `Language`: text not null,
- `Page`: integer not null,
- `Coordinate`: text not null,
- `Area`: text not null,
- `Description`: text not null

### Attachment

- `Id`: integer primary key autoincrement not null,
- `Path`: text unique not null,
- `DocumentId`: integer not null references Document(Id) on delete cascade

### Original Resource

> This table's name is shorten to `Resource`

- `Id`: integer primary key autoincrement not null,
- `Path`: text unique not null,
- `DocumentId`: integer not null references Document(Id) on delete cascade

### Connection

- `Id`: integer primary key autoincrement not null,
- `SourceDocId`: integer not null references Document(Id) on delete cascade,
- `TargetDocId`: integer not null references Document(Id) on delete cascade,
- `unique`: (SourceDocId, TargetDocId)

### User

- `Id`: integer primary key autoincrement not null,
- `Username`: text unique not null,
- `Password`: text not null,
- `Salt`: text not null,
- `Role`: text not null
