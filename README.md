# Theater Ticket Automation Bot

A Node.js and Playwright-based automation tool designed to automatically search for and secure highly contested movie theater seats on ingresso.com. It features a lightweight local web interface for easy configuration and monitoring.

## Why Use It?
Securing tickets for blockbuster movie premieres often requires refreshing the ticketing page for hours. This bot eliminates that manual effort by continuously polling the ticketing platform in the background. Once your desired seat becomes available, the bot selects it and holds the browser open, giving you 4 minutes to manually complete the payment process. 

## How It Works
The project uses a local client-server architecture:
* **Frontend (`public/`):** A simple HTML/JS interface to input movie details, date, time, theater location, and the specific seat you want.
* **Backend (`src/server.ts` & `src/botManager.ts`):** An Express server that receives your configuration and manages the execution loop, respecting anti-blocking delays.
* **Automation (`src/scraper.ts`):** Playwright handles the browser automation, navigating the UI, verifying seat availability via DOM attributes, and executing the click.

## Configuration & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* Git

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Luizrattacaso/theater-reservation.git
   cd theater-reservation
   ```
2. Install the Node.js dependencies:
    ```bash
    npm install
    ```
3. Install the Playwright browser binaries:
    ```bash
    npx playwright install
    ```
### Usage

1. Start the local server:
   ```bash
    npm start
   ```
2. Open your web browser and navigate to http://localhost:3000.
3. Fill out the configuration form:

  - Movie Name: The exact or partial name as it appears on the platform.
  - Date & Time: The desired session.
  - Location: Select the specific theater.
  - Row & Seat: The exact physical seat you want to secure.
  - Max search time: How long the bot should keep trying before giving up.

4. Click Start Search.

  The bot will launch a visible browser window, attempt to secure the seat, and if it is currently occupied, it will close the browser and wait 4 minutes before trying again. The interface will display real-time terminal logs and status updates. When successful, the browser will remain open for 4 minutes for you to finalize the checkout. You can stop the execution at any time by clicking Stop Search.

  ### Example
