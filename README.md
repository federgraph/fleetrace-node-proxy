# FR Node Proxy

Also known as
- *fr-node-server-c* (my local name)
- *fr-output-proxy* (description in package.json)

This application is expected to be used with FR69 or similar application.
FR69 would be the Delphi result server application, the backend.

This application is expected to be used with FR03A1 or similar Angular SPA application.

This node application uses the `request` lib to proxy api calls over to the backend.

But it will also have tcp connections to the Delphi app, and a web-socket channel back to the Angular app.

As a proxy, it will sit in between the Angular apps (can be many), and the Delphi app (just one).

## Quick manual testing tour

### 1. Build the Angular SPA
- Build the Angular app on the same machine.
- Note the path to dist folder.

### 2. Prepare Delphi Result Server application
- Open FR69 on the same machine.
- Check that it has listening ports for Input connection and Output connection.
- Note both tcp ports.
- Check url for api web (http access to FR69).
- Note web access url.
- Press Clear button to reset, this should give a default, empty event.
- Let it run.

### 3. Prepare this node/express application
- Check hardcoded value for **iconn.port**, default = 3427.
- Check hardcoded value for **oconn.port**, default = 3428.
- Check hardcoded value for **target** url, default is localhost, port 8086.
- Check hardcoded path to dist folder in line starting with **app.use('/fr', express.static(**.
- Compile app with `npm run tsc`.
- Start up app with `npm run start`.
- Make sure you can see the console.
- Let it run.

### 4. Use the Angular application

#### 4.1 Open the Angular app
- Browse to the static html page, see `client/index.html`.
- From the link there start up the Angular SPA.
- Make sure that **Dashed** is selected in **Url Option** component. 

#### 4.2 Download current event data
- Click on **more** button on Api component to show more (more buttons).
- Click on **Pull E** button to download current event data.
- Check that the node server will proxy this api call back to the Delphi application.
- It should respond with plain text event data.

#### 4.3 Make connections

From the Angular app you will control 
- the tcp connections from node proxy to Delphi app.
- the web-socket channel between Angular client and node proxy.

The Angular app has two instances of a Connection component, which looks like a button-bar.
There is one component for Input, and another component for Output.
Both under the Heading of **Conn**.

The sequence of button clicks in this manual test setup should be:

- **In - on - In - Out - on - Out - watch**
- It will take you through the connection process step by step.
- Let me explain below.

##### 4.3.1 Make Input Connection
- Click on **In** button (the LED button for Input) to make api call and see the input connection status as color.
- If not connected, click **on** button to connect. 
  You are requesting that the node server open a tcp connection to Input.
  This is an asynchronous operation, meaning that the api call returns without waiting for the tcp connection to succeed.
  The LED button should turn yellow, meaning that we don't know whether the connection could be made.
- Wait *a second*, then click the **In** button again.
  The LED button should turn green if connected.

If Input LED is green all is good, proceed with Output.  

##### 4.3.2 Make Output Connection

Very similar to Input. Start by clicking on **Out** button.
The json result from the resulting api call will convey the info whether the node proxy server supports web-sockets.

##### 4.3.3 Make the Web Socket Connection

- Click on **watch**.
- Note that the button caption changes into **stop watching**.
- Check that the last button in the **Out** button bar reads **Active**.
  If it reads **Drop** you should click the button once. This is a toggle button.

Since the node server supports web-sockets the **watch** button becomes *enabled*.
Note that *both* watch buttons become enabled, they act in synch.
You have two separate connection components, each having a *watch* button, but there is just one web-socket channel. It does not matter which button you click.

Via the web-socket channel we are expected to receive input from external sources later.
That input may travel via the output socket of the Delphi application to the node proxy, and from there via the web-socket channel to the Angular client.

Input messages may have originated from an Angular app or from some timing provider application connected directly to the input socket of the Delphi application.

Decide for yourself whether or not you should *accept* or *drop* incoming traffic via web-socket.

### 4.4 Do the normal manual testing

I have explained above how to connect the apps for the test case.
But I will not explain here how to do normal manual testing.
If you know how to use the Delphi app, or the Angular app, you know it already.

But basically, it goes like this:
- Click on a **bib** to generate a time for that bib at a time point in a race.
- If the time point is a finish time point, a finish position message will be generated as well.
- Check that the message has reached the other side.
- Check in both, race view and event view.
- You can show them manually, in race view select the correct time point and race.
- Check that it works both ways.
- Input in Angular app will appear in Delphi desktop application.
- Input in Delphi application will appear in Angular apps, all of them.

## Comparison notes

Compare this app against similar apps.
For example, compare `fr-node-server-c` to `fr-node-server-d`.

### Api
- It uses the `request` lib.
- It uses the dashed-urls.

### Connections
- It uses the Dummy class.
- It uses real tcp input and output connections through the Conn class.
- It defines request lines, not used.
- WantRequest is false.

### Web Sockets
- It has web-socket support.
- The web-socket is registered with output connection.

## Status

- This is not a production version.
- It *seems* to work.
- But there are lots of things to do.
- I hope you can see where I am heading.
- Help is welcome.
- Users are wanted.

## One of next steps
- Node proxy should be running on a raspberry pi.
- Result server should run on a Windows desktop machine.
- Angular app should be tested from tablet.
