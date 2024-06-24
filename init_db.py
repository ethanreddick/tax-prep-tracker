import mysql.connector
from mysql.connector import Error
import sys
import json
import argparse
import os
import tempfile

def log_message(message):
    log_file_path = os.path.join(tempfile.gettempdir(), 'init_db_log.txt')
    with open(log_file_path, 'a') as log_file:
        log_file.write(message + '\n')
    print(message)

def create_server_connection(host_name, user_name, user_password, db_name=None):
    """Create a connection to the MySQL server"""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            password=user_password,
            database=db_name  # This will be None unless specified
        )
        log_message("MySQL Database connection successful")
    except Error as e:
        log_message(f"Error: '{e}'")
        sys.exit(1)  # Exit the script if we cannot connect to MySQL
    return connection

def drop_database(connection, db_name):
    """Drop the database if it exists"""
    cursor = connection.cursor()
    try:
        cursor.execute(f"DROP DATABASE IF EXISTS {db_name};")
        connection.commit()
        log_message(f"Database '{db_name}' dropped successfully.")
    except Error as e:
        log_message(f"Error: '{e}'")
        cursor.close()
        sys.exit(1)  # Exit the script if we cannot drop the database
    finally:
        cursor.close()

def create_database(connection, db_name):
    """Create a new database"""
    cursor = connection.cursor()
    try:
        cursor.execute(f"CREATE DATABASE {db_name};")
        connection.commit()
        log_message(f"Database '{db_name}' created successfully.")
    except Error as e:
        log_message(f"Error: '{e}'")
        cursor.close()
        sys.exit(1)  # Exit the script if we cannot create the database
    finally:
        cursor.close()

def create_tables(connection):
    """Create tables in the specified database"""
    cursor = connection.cursor()
    try:
        # Clients table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            client_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            ssn VARCHAR(255) NOT NULL UNIQUE,
            address VARCHAR(255) NOT NULL,
            bank VARCHAR(255) NOT NULL
        );
        """)
        # Accounts table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            account_id INT AUTO_INCREMENT PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            account_class VARCHAR(255) NOT NULL,
            statement_type VARCHAR(255) NOT NULL,
            account_balance DECIMAL(10, 2) NOT NULL
        );
        """)
        # Transactions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT,
            transaction_date DATE NOT NULL,
            description TEXT,
            FOREIGN KEY (client_id) REFERENCES clients(client_id)
        );
        """)
        # Transaction lines table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS transaction_lines (
            transaction_line_id INT AUTO_INCREMENT PRIMARY KEY,
            transaction_id INT,
            account_id INT,
            amount DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
            FOREIGN KEY (account_id) REFERENCES accounts(account_id)
        );
        """)
        connection.commit()
        log_message("Tables created successfully.")
    except Error as e:
        log_message(f"Error: '{e}'")
        sys.exit(1)  # Exit the script if we cannot create tables
    finally:
        cursor.close()

def main():
    log_message(f"Raw arguments: {sys.argv}")

    parser = argparse.ArgumentParser(description='Initialize MySQL Database')
    parser.add_argument('--creds', required=True, help='Path to the JSON file containing MySQL credentials')
    args = parser.parse_args()

    # Logging to ensure the correct arguments are received
    log_message(f"Received argument: --creds {args.creds}")

    with open(args.creds, 'r') as f:
        creds = json.load(f)

    host = "localhost"
    db_name = "tax_prep_db"
    mysql_username = creds['username']
    mysql_password = creds['password']

    # Connect to MySQL Server
    server_connection = create_server_connection(host, mysql_username, mysql_password)

    # Drop existing database if it exists
    drop_database(server_connection, db_name)

    # Create new database
    create_database(server_connection, db_name)

    # Connect to the newly created database
    db_connection = create_server_connection(host, mysql_username, mysql_password, db_name)

    # Create tables
    create_tables(db_connection)

    # Close the connection
    db_connection.close()

if __name__ == "__main__":
    main()
