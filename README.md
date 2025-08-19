# AI Workbench

The AI Workbench is a full-stack, enterprise-grade platform designed to transform the existing Allora Model Development Kit (MDK) into a comprehensive, web-based integrated development environment (IDE).

## Getting Started

This guide will walk you through setting up the project for local development.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20.x or higher)
- [pnpm](https://pnpm.io/installation) (v8.x or higher)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### 1. Installation

Clone the repository and install the dependencies using `pnpm`.

```bash
git clone https://github.com/allora-network/ai-workbench.git
cd ai-workbench
pnpm install
```

### 2. Local Development Environment

This project uses Docker Compose to manage local development services. Currently, this includes the [Temporal](https://temporal.io/) server and UI.

To start the services, run the following command from the root of the project:

```bash
docker-compose up -d
```

- The Temporal server will be running on port `7233`.
- You can access the **Temporal Web UI** by navigating to [http://localhost:8233](http://localhost:8233) in your browser.

To stop the services, run:

```bash
docker-compose down
```

### 3. Running the Application

Once the dependencies are installed and the Docker services are running, you can start the development server for the Next.js web application.

Run the following command from the root of the project:

```bash
pnpm dev
```

This will start the Next.js application, which you can access at [http://localhost:3000](http://localhost:3000).
