import sqlite3
import sys

def setup(db_name):
    # Creates all the required tables for the database 
    setup_sql_script = """

BEGIN;

-- Locations Table: Stores physical locations from where sensor devices are located 
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Locations (
    RoomID INTEGER PRIMARY KEY AUTOINCREMENT,
    RoomName TEXT NOT NULL,
    Building TEXT NOT NULL
); 
-- Devices Table: Stores information about sensor devices. A single device can have
-- multiple sensor(s) housed in them
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Devices (
        DeviceID INTEGER PRIMARY KEY AUTOINCREMENT,
        Manufacturer TEXT,
        Model TEXT,
        FirmwareVersion TEXT,
        CurrentLocation INTEGER,
        FOREIGN KEY (CurrentLocation) REFERENCES Locations(RoomID)
);

-- Sensors Table: Each sensor is from a single device. SensorType and Status are
-- attributes that should be enums which are implemented here with a check,
-- restricting them to a set of allowed values. 

-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Sensors (
    SensorID INTEGER PRIMARY KEY AUTOINCREMENT,
    DeviceID INTEGER NOT NULL,
    SensorType TEXT NOT NULL CHECK(SensorType IN ('CO2', 'Temperature', 'Current')),
    Status TEXT NOT NULL CHECK(Status IN ('Active', 'Inactive', 'Fault')),
    LastInspected DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (DeviceID) REFERENCES Devices(DeviceID) ON DELETE CASCADE
);

-- DeviceLocationHistory Table: This tracks each time a device is installed in a 
-- room. This allows us to analyze data specific to each room. 
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS DeviceLocationHistory (
    DeviceID INTEGER NOT NULL,
    RoomID INTEGER NOT NULL,
    FirstInstalledDate DATETIME NOT NULL,
    EndDate DATETIME,
    PRIMARY KEY (DeviceID, FirstInstalledDate),
    FOREIGN KEY (DeviceID) REFERENCES Devices(DeviceID),
    FOREIGN KEY (RoomID) REFERENCES Locations(RoomID)
);

-- SensorData Table: The central table that stores sensor readings
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS SensorData (
    SensorID INTEGER NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    Value REAL NOT NULL,
    PRIMARY KEY (SensorID, Timestamp),
    FOREIGN KEY (SensorID) REFERENCES Sensors(SensorID)
);

-- AlertTypes Table: Defines types of alerts for each sensor 
CREATE TABLE IF NOT EXISTS AlertType (
    AlertTypeID INTEGER PRIMARY KEY AUTOINCREMENT,
    AlertSeverity INTEGER NOT NULL CHECK(AlertSeverity BETWEEN 0 AND 2),
    AlertMessageTemplate TEXT NOT NULL,
    SensorID INTEGER NOT NULL,
    HighThreshold REAL,
    LowThreshold REAL,
    FOREIGN KEY (SensorID) REFERENCES Sensors(SensorID) ON DELETE CASCADE
    );

-- AlertEvents Table: Log of when alerts where raised. This table can probably 
-- be created from the other tables? So not sure if its needed. TriggerValue
-- is the value that caused alert to happen. This should match whats in SensorData
-- --------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS AlertEvents (
    AlertEventID INTEGER PRIMARY KEY AUTOINCREMENT,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    SensorID INTEGER NOT NULL,
    AlertTypeID INTEGER NOT NULL,
    ResolutionStatus TEXT CHECK(ResolutionStatus IN ('Unresolved', 'Resolved', 'Acknowledged')),
    TriggerValue REAL,
    FOREIGN KEY (SensorID) REFERENCES Sensors(SensorID),
    FOREIGN KEY (AlertTypeID) REFERENCES AlertType(AlertTypeID)
    );

-- NotifiedPersons Table: Tracks all the people who are to be notified
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS NotifiedPersons (
    PersonID INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT UNIQUE CHECK(Email LIKE '%@%'),
    PhoneNum TEXT,
    Name TEXT,
    NotificationPreference INTEGER NOT NULL CHECK(NotificationPreference BETWEEN 0 AND 3)
);

-- NotificationGroups Table: A group of people who are notified for a specific alert
-- A person can be in multiple notification groups.
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS NotificationGroups (
    NotificationGroupID INTEGER PRIMARY KEY AUTOINCREMENT,
    AlertTypeID INTEGER NOT NULL,
    FOREIGN KEY (AlertTypeID) REFERENCES AlertType(AlertTypeID)
);

-- NotifiedPersonsNotificationGroups Bridge Table: To represent the many-to-many 
-- relationship between people and groups
-- -------------------------------------------------------------------------------- 
CREATE TABLE IF NOT EXISTS NotifiedPersonsNotificationGroups (
    PersonID INTEGER NOT NULL,
    NotificationGroupID INTEGER NOT NULL,
    PRIMARY KEY (PersonID, NotificationGroupID),
    FOREIGN KEY (PersonID) REFERENCES NotifiedPersons(PersonID),
    FOREIGN KEY (NotificationGroupID) REFERENCES NotificationGroups(NotificationGroupID)
);

    COMMIT;

"""

    connection = sqlite3.connect(db_name)
    cursor = connection.executescript(setup_sql_script)

    connection.commit()
    connection.close()

if __name__ == "__main__":
    db_name = sys.argv[1]
    setup(db_name)