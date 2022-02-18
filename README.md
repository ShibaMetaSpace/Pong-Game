# PongJS

## Run locally (for development)
Make sure you have Git and Node 16 LTS installed.

Install Git on the server: https://www.linode.com/docs/guides/how-to-install-git-on-linux-mac-and-windows/

The easiest way to install Node is through NVM (Node Version Manager).
Follow the instructions here: https://github.com/nvm-sh/nvm

Check your Node version by running:
```sh
node --version
```

Clone the app repository:
```sh
git clone <repository>
```

Run the following commands in the project's folder:

Install app dependencies:
```sh
npm install
```

Start your development server using:
```sh
npm start
```

## Build project for production
Run the following command: 
```sh
npm run build
```
This will generate a `dist` folder that will contain the compiled app (both client and server). For production we will condiser only the server, because the client is also bundled inside the server. So the production build will be located at `dist/apps/server`.

## Deploy
You can deploy to certain environments:

### Deploy to Heroku

Install Heroku Toolbelt: https://devcenter.heroku.com/articles/heroku-cli

Log in using:
```sh
heroku login
```

Create an app:
```sh
heroku apps:create <app-name>
```

Add Heroku as Git remote:
```sh
heroku git:remote -a <app-name>
```

Push your app to Heroku's Git:
```sh
git push heroku main
```

Your application should be available at: https://<app-name>.herokuapp.com


### Deploy to Linux server (VPS)
Make sure you have Git and Node v16 LTS installed (follow the `Run locally (for development)` instructions).

Install PM2:
```
npm install -g pm2
```
If the command above fails, run as root with `sudo`.

Clone your app somewhere on the server and navigate into the folder:
```sh
git clone <repository>
cd <project-folder>
```

Build the project for production:
```sh
npm run build
```

Start the project with PM2:
```sh
pm2 start ./dist/apps/server/main.js
```


## Project structure
The whole project is a monorepo managed by Nx Workspaces and written in TypeScript.

- apps
  - client - The client written in React + TailwindCSS
    - src
      - app - The client business logic
        - app.tsx - The main app component
        - ConnectionStatus.tsx - The component to display if the client is connected to the server
        - Game.tsx - The board for the game
        - InvitingForm.tsx - The form that pops up when you invite somebody to play
        - MetaMaskConnect.tsx - This component shows the "Connect to MetaMask" button
        - NoMetaMask.tsx - This component will be rendered if there is no MetaMask extension installed
        - OnlinePlayers.tsx - The component that lists all the online players
        - PlayerInvites.tsx - This component will be rendered when somebody invited you to play
      - main.tsx - The client app's entrypoint
  - server - The server written in Express + SocketIO
    - src
      - app - The server busioness logic
        - engine.ts - Handles the game logic
        - store.ts - In-memory store for games and players
        - types.ts - TypeScript types used only by the server
      - main.ts - The server app's entrypoint
  - libs - The commonly shared code between client and server
    - api.ts - The models that are used both on client and server
    - config.ts - The configuration for the game (expecially dimensions and timings)
