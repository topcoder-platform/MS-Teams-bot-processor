# Verification Guide

Once you have Ms Teams, Slack and the Topbot server setup, you can follow these steps for verification,

1. The Connect token has a short expiry time. It is best to refresh the token.
    a. Stop the running server.

    b. Follow steps in `Start server` -> `Obtain Connect User token` of [Deployment Guide](Deployment.md) to obtain a new token.

    c. Once you have the new token in `.env`, restart the server. No other changes or setup is needed.

    d. **NOTE** If you see a message like `Failed to authenticate token.` then it means that the token has expired. You need to repeat Step 1 and get a new token.

2. Issue a command `@topbot request Create a topcoder bot` in a Ms Teams channel.

![](images/request.png)

    You will see two things,

    a. A request acknowledgement is posted to Ms Teams

![](images/request_ack.png)

    b. The request is posted to the configured Slack channel

![](images/request_slack.png)

2. Click on the `Post a response` button in the Slack message. You will see a dialog with a text area where you can add a response. Add a response and click `Post`.

![](images/response.png)

    You will see two things,

    a. An acknowledgement is posted to Slack

![](images/response_ack.png)

    b. The response is posted back to Ms Teams with the `accept` and `decline` buttons

![](images/response_teams.png)

3. Click on the `Accept` button in Ms Teams

    Observe,

    a. An acknowledgement is posted to Ms Teams

![](images/accept_ack.png)

    b. A message with `Provide project name` is posted to slack

![](images/provide_name.png)

4. Click on the `Provide project button`. You will see a dialog where you can enter the project name. Add a name and click `Post`.

![](images/provide_name_dialog.png)

    Observe,

    a. A project created message is posted to Ms Teams

![](images/project_created.png)

    b. An acknowledgement is posted to Slack

![](images/project_created_slack.png)

5. Provide an email using `@topbot email mayur.gmail.com` as a reply to the project created message

![](images/provide_email.png)

    Observe,

    a. An invite confirmation message is posted to Ms teams with a link to the Connect project

![](images/email_ack.png)


    b. A message is posted to Slack saying user has been invited

![](images/email_slack.png)

6. Open the `Connect` link and login using `mess`/`appirio123`. You will see the created project along with the invited user

![](images/connect.png)

7. You can repeat Steps 1 and 2 and click the `Decline` button. You will see a message posted to Slack

![](images/decline.png)

8. You can also try different scenarios

    a. Invite user who is already invited

    b. Try email command in non request thread

    c. Multiple clicks on Accept and Decline
