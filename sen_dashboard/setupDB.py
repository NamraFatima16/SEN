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





"""