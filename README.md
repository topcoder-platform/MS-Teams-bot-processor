# Topbot-MS : communicate between slack and MS-teams

## Overview

Topbot-ms can be invoked by its name `@topbot`. It supports the following commands on Ms Teams, 

| Command&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description|
|---------|------------|
| `@topbot request <project_description>` | Posts a small project description message to the configured slack channel. The response to the slack message is posted back to Ms Teams. |

Adding a new command is easy, just provide a command in `common/default.js` -> `COMMANDS` and a handler in `src/handler.js`
```
msTeamsController.hears(COMMANDS.NEW_COMMAND, 'message,direct_message', handleNewCommand)
```

## Prerequisites

1. Node.js > v10.14.2

2. ngrok

## Deployment guide

Follow instructions in [Deployment Guide](docs/Deployment.md)

## Verification guide

Follow instructions in [Verification Guide](docs/Verification.md)
