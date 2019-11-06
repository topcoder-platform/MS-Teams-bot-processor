# Deployment Guide

You will need to create free accounts for Ms Teams and Slack in order to deploy the bot.

## Ms Teams setup

### Office 365 subscription

1. Create a new microsoft account if you don't have one already. You can sign up [here](https://account.microsoft.com/account)

2. Add a First and Last name to your account if you don't have one already. Click `Add Name` button [here](https://account.microsoft.com/profile/)

![](images/add_name.png)

3. Once done, join the Office 365 Developer Program by clicking `Join Now` button [here](https://dev.office.com/devprogram). 

    If you just added your name in Step 2, you need to wait a couple of hours before you can join the Office 365 Developer Program.

![](images/wait.png)

4. Provide country, company name, accept license and click Next

![](images/dev_program.png)

5. Provide required fields, I provided values, `Information technology`, `Personal projects`, `Personal projects`, `Microsoft Teams`. Click `Next`.

![](images/dev_required.png)

6. Click `Set Up Subscription` in the following step, provide username, domain and password and click continue. Remember these values. Your TEAMS_EMAIL for subsequent steps will be `username@domain.onmicrosoft.com` and your TEAMS_PASSWORD will be the password you entered.

![](images/dev_sub_1.png)

7. Provide your phone number for a verification code and enter it

![](images/dev_sub_2.png)

### Admin portal setup

1. Go to [Admin portal](https://portal.office.com/adminportal/home) and sign in using TEAMS_EMAIL and TEAMS_PASSWORD from above

2. Click on `Users` -> `Active Users` -> Select your user -> `Licenses and Apps` in the side menu, Check the license `Microsoft 365 E5 Developer (without Windows and Audio Conferencing)` and click `Save changes`.

![](images/admin.png)

### Ms Teams setup

1. Sign in to MS teams [here](https://products.office.com/en-us/microsoft-teams/group-chat-software?SilentAuth=1) using the TEAMS_EMAIL and TEAMS_PASSWORD from above. Click `Use the web app instead`

2. On success, you will see teams. Click `Teams` -> `Create a team` -> `Build a teams from scratch` -> `Public` -> Provide a name and click `Create`

![](images/create_team.png)

3. Skip adding members. On success, you should see your team created,

![](images/team_created.png)

### Create a bot

1. Go to https://dev.botframework.com/bots/new and sign in using TEAMS_EMAIL and TEAMS_PASSWORD.

2. Provide details,

  a. Display name

  b. Bot handle

![](images/create_ms_bot.png)

  c. Configuration -> Click Create Microsoft App ID. You will be redirected to Azure. Click `Register an application`. Provide name and select `Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)` and click register

![](images/azure_1.png)

![](images/azure_2.png)

  d. Copy you Application (client) id

![](images/app_id.png)

  e. Paste App id back in the `Create bot` -> `Configuration` -> `Paste your app ID below to continue` section. This will be your app id. Provide this value in `.env` -> `# MS Teams configuration` -> `APP_ID`

![](images/paste_app_id.png)

  f. Accept license and click `Register`

3. On the bot page, click `Add featured channel` -> `Ms Teams`

![](images/add_teams_1.png)

4. Click `Save`

![](images/add_teams_2.png)

### App Studio setup

1. Go back to Ms Teams and click `...` -> Search for `App Studio` and `Add` it

![](images/app_studio_1.png)

2. Click `Manifest Editor` -> `Import Existing App` -> Select `manifest.zip`

3. Click `Edit` manifest

![](images/edit_manifest.png)

4. In `App details` click `Identification` -> `Generate`

5. In `Capabilities` -> `Bots` -> Click `Delete` to delete any existing bot. Then click, `Setup` -> `Existing bot`

6. Provide name, select existing bot -> choose bot from `Create a bot section`, Check `Scope` Personal, Team and Group and click `Save`

![](images/add_ms_bot.png)

7. Under `App passwords` click `Generate new password`. Copy this value to `.env` -> `# MS Teams configuration` -> ` APP_PASSWORD`

8. Your `.env` file should have all the config needed for `MS Teams configuration` now

9. Now follow the steps in `Slack setup` section. You should be able to deploy Slack and start the server. Come back to `App studio` -> `Bots` once done and follow subsequent steps.

10. In `Messaging endpoint` provide value `NGROK_URL/v5/topbot-ms/api/messages`

11. Click `Add` in `Commands`. Provide values, command text as `request`, Help text `Send a project description message`. Scope all 3 and click `Save`

![](images/command.png)

12. Repeat step 11 for `email` command. Provide values, command text as `email`, Help text `Provide an email id to invite to project`. Scope all 3 and click `Save`

![](images/email.png)

13. Click `Finish` -> `Test and distribute` -> `Download`. Save the zip file

14. Go to `...` -> `More apps` -> `Upload a custom app` and upload the zip file from step 12

15. Click on the uploaded app and `Add` it to team by selecting `Add to team` in dropdown.

![](images/add_app.png)

![](images/add_app_team.png)

16. Now if you go to the `General` or any other new channel you create, you will be able to see `@topbot`. Follow steps in [Verification Guide](Verification.md) to verify.

## Slack setup

### Create account

1. Create a slack account if you don't have one already. Click `Create a new workspace` [here](https://slack.com/get-started).

2. Provide an email address and click confirm

3. A verification code will be sent to your email, post the verification code back to the slack setup page

4. Create a team and a project. The project name will be your channel name. Provide these values in `.env` -> `# Slack configuration` -> `TEAM` and `CHANNEL`

5. Click `Skip for now` if you don't want to add more users

![](images/skip.png)

6. You should see your team and your channel created

![](images/created.png)

### Create a Slack App

1. Open the create app page, click [here](https://api.slack.com/apps?new_app=1)

2. Provide a name and select a workspace

![](images/create_app.png)

3. Go to app credentials from `Settings` -> `Basic Information`. Get the value of `Signing Secret` and provide it in `.env` -> `# Slack configuration` -> `SIGNING_SECRET`

![](images/credentials.png)

4. Click on `Features` -> `Bot users` -> `Add a Bot User`. Provide a name and click `Add Bot User`

![](images/add_bot_user.png)

5. Click on `Features` -> `OAuth & Permissions` -> `Install App to Workspace`

![](images/install.png)

6. Click `Allow`

![](images/allow.png)

8. On the same page, go to `Scopes` -> `Oauth Scopes` -> Add scope `channels.write` and click `Save changes`. Reinstall the app by clicking the link on the top banner.

![](images/channels_write.png)

![](images/reinstall.png)

9. On success, you will see your `Bot User OAuth Access Token` in `OAuth Tokens & Redirect URLs`. Copy this value and provide it in `.env` -> `# Slack configuration` -> `BOT_TOKEN`

10. Your `.env` should look something like,
    ```
    # MS Teams configuration
    APP_ID=b77d1f2c-215a-47e5-9ec9-81bf4ac1ae3c
    APP_PASSWORD=3=1wejmf.0KhQQTOVf1OCmIcs@_snENL

    # Slack configuration
    SIGNING_SECRET=52810ea6b0cf1e67b2861be8bddce102
    BOT_TOKEN=xoxb-751151625041-759783514870-CT0xFbzPllSoRPJq3HfpPoz6
    TEAM=Topcoder
    CHANNEL=topbot

    # Connect configuration
    BEARER_TOKEN=
    ```

11. Follow steps in the `Start server` section of this document. Once done, come back and follow subsequent steps.

12. Once you have the NGROK_URL, click on `Features` -> ` Interactive Components`. Turn it on. In the `Request URL` section provide url, `NGROK_URL/v5/topbot-ms/slack/receive` and click `Save changes`

![](images/interactive.png)

13. Click on `Features` -> `Event Subscriptions`. Turn it on.

14. Go to `Subscribe to Bot Events` section and add all the `message` events. You should see 4 events 

![](images/bot_events.png)

15. Scroll up and provide a `Request URL`. Provide value `NGROK_URL/v5/topbot-ms/slack/receive` and click `Save changes` once verified. If you need to reinstall the app, then do so.

![](images/verified.png)

**Now you can* continue where you left off the MS teams setup. i.e. start from step 9 of `App Studio setup`**

## Start server

### Obtain Connect User token

1. With the network tools of your browser open, login to https://connect.topcoder-dev.com using user `mess` and password `appirio123`. (Alternate credentials are `tonyj`/`appirio123` or `callmekatootie`/`appirio123`)

2. Find a request in the list of api calls with a bearer token. One such request is the 2nd call made to `mess/`

![](images/token.png)

3. Copy this value and update `Connect configuration` -> `BEARER_TOKEN` in `.env`.

### Run server

You should have all the values needed by `.env` now. It will look something like,
    ```
      # MS Teams configuration
      APP_ID=f2c4e3bd-a40d-4be6-b85e-57c7a3397858
      APP_PASSWORD=V:I?UKPy=Frz@2hEoogQ6I2YGKXj3tT?

      # Slack configuration
      SIGNING_SECRET=49162bd8ebe79a8f64a9a29332e22c74
      BOT_TOKEN=xoxb-755656631591-802800975089-14AJhPBPsXIneGK1Ci5FTozI
      TEAM=appify
      CHANNEL=topbot_ms

      # Connect configuration
        BEARER_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJjb3BpbG90IiwiYWRtaW5pc3RyYXRvciJdLCJpc3MiOiJodHRwczovL2FwaS50b3Bjb2Rlci1kZXYuY29tIiwiaGFuZGxlIjoibWVzcyIsImV4cCI6MTU3MjI1ODE5MiwidXNlcklkIjoiMzA1Mzg0IiwiaWF0IjoxNTcyMjU3NTkyLCJlbWFpbCI6Im1lc3NAYXBwaXJpby5jb20iLCJqdGkiOiJjY2EyZTQ4YS0yNjAzLTQ4ZTktYjQwMy1jNjYzNzU2ZWFlZDAifQ.Qt1RE0pIZyZZVUREjlsrJanSM9uuhcY3G71DyHeSC6o
    ```

You can now start the server. Follow these steps,

1. Install node modules `npm i`

2. Run lint if needed, `npm run lint` to detect errors and `npm run lint:fix` to fix lint errors

3. Start the server `npm start`

4. Expose the server using `ngrok`. Run `ngrok http 3000`. You will obtain a url like `https://c238256a.ngrok.io`. Note down this value. I will refer to it as NGROK_URL.

**Now you can continue where you left off the Slack setup. i.e. start from step 11 of `Create a Slack App`**
