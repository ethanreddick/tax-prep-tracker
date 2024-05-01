import mysql.connector
from mysql.connector import Error
import sys

def create_database_connection(host_name, user_name, user_password, db_name=None):
    """Create a database connection"""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            password=user_password,
            database=db_name
        )
        print("MySQL Database connection successful")
    except Error as e:
        print(f"Error: '{e}'")
        return None  # Ensure the function returns None explicitly on failure

    return connection

def create_database(connection, query):
    """Create a database"""
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        print("Database created successfully")
    except Error as e:
        print(f"Error: '{e}'")

def execute_query(connection, query):
    """Execute SQL query"""
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        connection.commit()
        print("Query successful")
    except Error as e:
        print(f"Error: '{e}'")

def main():
    mysql_username = sys.argv[1]
    mysql_password = sys.argv[2]

    connection = create_database_connection("localhost", mysql_username, mysql_password, "tax_prep_db")
    if connection is None:
        print("Failed to connect to the database. Exiting...")
        return  # Exit if the connection was not successful

    create_database_query = "CREATE DATABASE IF NOT EXISTS tax_prep_db"
    create_database(connection, create_database_query)

    create_clients_table = """
    CREATE TABLE IF NOT EXISTS clients (
        client_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ssn VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        bank VARCHAR(255) NOT NULL
    );
    """

    create_accounts_table = """
    CREATE TABLE IF NOT EXISTS accounts (
        account_id INT AUTO_INCREMENT PRIMARY KEY,
        description TEXT NOT NULL,
        account_balance DECIMAL(10, 2) NOT NULL
    );
    """

    create_transactions_table = """
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT,
        debit_account_id INT,
        credit_account_id INT,
        debit_amount DECIMAL(10, 2),
        credit_amount DECIMAL(10, 2),
        transaction_date DATE NOT NULL,
        description TEXT,
        FOREIGN KEY (client_id) REFERENCES clients(client_id),
        FOREIGN KEY (debit_account_id) REFERENCES accounts(account_id),
        FOREIGN KEY (credit_account_id) REFERENCES accounts(account_id)
    );
    """

    execute_query(connection, create_clients_table)
    execute_query(connection, create_accounts_table)
    execute_query(connection, create_transactions_table)

if __name__ == "__main__":
    main()
