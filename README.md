# Bupin QR Code Genertor

This project was created with the main purpose of being a QR image generator from Bupin 4.0 content codes. Although it can be used for any url (not just content codes), we do not recommend it.

## Installation
### Using Bun
To run this program with `Bun`, you must have `Bun` installed on your machine.

1. Clone this repository to your local machine
    ```bash
    git clone https://github.com/TegarAditya/bupin-qr-gen.git
    ```
2. Move to the project directory
    ```bash
    cd bupin-qr-gen
    ```
3. Install the dependencies
    ```bash
    bun install
    bun db:generate
    ```
4. Create `.env` file
    ```bash
    cp .env.example .env
    ```
5. Adjust `.env` file
    ```text
    PORT=3000

    DATABASE_URL="your_mysql_connection_string"
    ```
6. Running development server
    ```bash
    bun run dev
    ```
### Using Docker
In order to run this program with `Docker`, you must have Docker installed on your machine.

1. Clone this repository to your local machine
    ```bash
    git clone https://github.com/TegarAditya/bupin-qr-gen.git
    ```
2. Move to the project directory
    ```bash
    cd bupin-qr-gen
    ```
3. Create `.env` file
    ```bash
    cp .env.example .env
    ```
4. Adjust `.env` file
    ```text
    PORT=3000

    DATABASE_URL="your_mysql_connection_string"
    ```
5. Run and build the docker container
    ```bash
    # if you want to run this in foreground
    docker compose up

    # if you want to run this in background
    docker compose up -d
    ```

