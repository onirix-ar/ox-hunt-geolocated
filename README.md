# Geolocated AR treasure hunt for events

In [this tutorial](https://docs.onirix.com/tutorials/geolocated-ar-treasure-hunt-for-events) you will learn to set up and customize an augmented reality treasure hunt with **Onirix**, **Firebase** and **Vue**. This project can be used to provide a game-like experience to clients and visitors, for example, you could use the games to attract attention to stands at an event, shops at a mall, different points of interest at a festival, etc.

![onirix-hunt-docs](https://user-images.githubusercontent.com/118167082/201620090-435a8461-371b-4d46-a43c-53b0f688c1e9.jpeg)

The complete flow of the experience would be:

1. Users will access the url where the game has been hosted (or via QR code). This action will open the client application in the web browser (Google Chrome or Safari).
2. If they are not registered, they will need to input their email, a password and some basic information which will be stored. If they are registered but not logged in, they will need to write their credentials.
3. Once they are registered and logged in, the AR game will start. Users can visit different locations within a map, where points of interest marked with in-game pins can be viewed. By being near each of them (within a radius of action), they will be able to launch the AR (logo hunting game) experience. 
4. The goal of the game is to visit as many locations as possible, and get as many points in each of them, in order to exchange them for potential prizes (at a festival, event, etc.).
5. After completing each game you will be able to see your score, and how close or far you are from the different prize tiers available. This encourages players to continue searching for active locations.


## Step 1: Get the code
The first thing you need is to download our template project from the **Onirix** repositories on Github. Open this link in a new tab, login with your GitHub account and select the _Fork_ option and fill the form. Through the _Fork_ functionality you will be able to make a personal copy of this repository and modify it freely.

After the _fork_ is created, click the _Clone_ button and copy the link inside. Now, open a terminal in the desired folder and execute the “_git clone_” command followed by the URL you just copied. This will create a local copy of the repository in the folder.

Once it is downloaded, you can open it in your _IDE_ of choice and take a look at the content. However, before you run and test the project, you need to set up **Firebase** to store the data (events, users, etc) of the treasure hunt.

## Step 2: Set up Firebase
The Ipsum Hunt example uses **Firebase** to store and consume the data generated in the application and thus you will need to create a **Firebase** account using your Google account and configure a new project to connect it to the application.

### Create Firebase project
Once you are logged in on **Firebase**’s console, choose the “_Add project_” option. This will take you to the creation form, input the name for the project, enable (or disable Google Analytics for the project). If you choose to enable it, you will need to create an account on Analytics and Google will automatically create a new property for this project.

<img width="500" alt="createfirebaseproject" src="https://user-images.githubusercontent.com/118167082/201620403-869a8848-eda0-4dbd-8cd5-7dc4c0326bde.png">

!!! If you are interested in setting up Google Analytics on an Onirix Web AR experience check [this tutorial](https://docs.onirix.com/tutorials/include-google-analytics-in-web-ar).

Finally, select create project, wait for the process to complete and click _Continue_. 

### Add and configure the application
In the project overview page, select the </> icon in order to add a web app to the project, fill in the field with the name of the app (in this case “ox-hunt”) and click _Register app_.

After a short wait, **Firebase** will provide you with all the information you need to connect to it from the app (apiKey, authDomain, projectId, ...). Once you have copied it, head to the **index.ts** file under **client > src > services > firebase.service.js** in your project local repository and paste the values here:

![firebaseserviceconfig](https://user-images.githubusercontent.com/118167082/201620722-f295b652-6cf8-4f8e-b52d-be64511f9eee.png)

If you need to view this information again, in the dashboard, click on the project’s name and press the gear icon. This will lead you to the project’s settings where you can check the SDK configuration at the end of the page.

<img width="500" alt="firestoredata" src="https://user-images.githubusercontent.com/118167082/201620856-68c579db-b297-4564-bb39-5de7e6d36bc3.png">


### Create the database
Navigate to **Firestore Database** through the sidebar on the dashboard and select “Create database”. A creation wizard will appear, click next and select the desired location for you **Cloud Firestore** storage.

<img width="500" alt="createfirestoredb" src="https://user-images.githubusercontent.com/118167082/201622621-b1802007-2aba-4b20-ac17-82608d57f304.png">

In this case the example was set up in _europe-west_, nevertheless you should choose your own region or the one where the project will be used. Click enable and after a short wait your database will be created.

<img width="500" alt="firestoredb" src="https://user-images.githubusercontent.com/118167082/201620953-69f00f00-bcd6-4d4c-8dc9-345644c35451.png">

Once it’s created, you will need to copy the name of the **Firebase** application (in this case “ipsum-hunt”) and paste it on the **.firebaserc** file “default” field. You will also have to change **Firestore** region to the one you selected on two files:
* On backend > functions > src > index.ts.

<img width="300" alt="admininti" src="https://user-images.githubusercontent.com/118167082/201621040-a4530522-5221-4af3-bbe4-da5da1a3a660.png">

* On client > src > services > firebase.service.js.

<img width="300" alt="euwest" src="https://user-images.githubusercontent.com/118167082/201621150-91f9e8af-f7fc-439d-8000-3f1bc43b50af.png">

### Authentication
In this example the authentication is handled directly with **JWT** tokens saved on the **Firebase** collections. The only requirement to start using this approach is defining a secret for the **JWT** and generating a token for the Admin user. The defined secret should be written in the _CONSTANTS_ object on **index.ts**. 

After creating it, go to the backend > functions > scripts folder and execute (node) the **tokenService.js** script setting the _jwt_secret_ to the one you just defined. Then, copy the generated token printed on the console and paste on client > src > services > firebase.service.js.

<img width="300" alt="admintoken" src="https://user-images.githubusercontent.com/118167082/201621377-1b520af4-5f9d-4997-a55f-1aa903e41ad6.png">

Nevertheless, you can set it up with your authentication method of choice. For example, under the _Authentication_ options on **Firebase**’s dashboard, Google provides many different types of authentication that can be enabled and configured for your project.

## Step 3: Set up mail notifications
When the registered users forget their password and ask for a new one, the application handles it through emails. For this to work a mail service will be needed, in this example [**Sendgrid**](https://sendgrid.com/) is used. However, you can utilize any that you prefer and then change the code accordingly.

To set it up with **Sendgrid**: 
1. Create a new account and follow their documentation to generate an **API key**.
2. Then copy this key and paste it on the _CONSTANTS_ object in **index.ts**. 

You will also need to write the email address that will be used as the sender of the notifications and the URL of the domain where your application will be hosted.

## Step 4: Create Studio project
The next step is to create an **Onirix Studio** account and build a new AR project that can be connected to the Ipsum Hunt example.
Navigate to [Onirix Studio](https://studio.onirix.com/register) and fill both parts of the form and validate the account.

Once you are logged in **Studio**, you will be presented with several videos, tutorials and some premade assets and projects that you can use to get familiarized with the tool. You can start by creating a new project and building it following some of the other Studio tutorials like:
* [Car configurator](https://docs.onirix.com/tutorials/embed-sdk-and-online-code-editor)
* [Geolocated Treasure Hunt](https://docs.onirix.com/tutorials/geolocated-treasure-hunt)

### Create Treasure Hunt experiences
A Scavenger Hunt consists in capturing certain elements that will appear in the AR experience. Where and when these objects appear is configured through the scene editor of **Onirix Studio**. So, the first step is creating a new [surface scene](https://docs.onirix.com/onirix-studio/projects/surface).

To achieve this, you need to create a new Project and name it or you can also download from the experience library the following projects to get a general idea and examples of the topics that will be discussed below. 
* [Hunt logos](https://www.onirix.com/experience/ar-games-hunt-logos-time-limit/)
* [Treasure Hunt](https://www.onirix.com/experience/treasure-hunt-version-with-geolocalized-maps/ )

Once it’s created, the form to create a new scene will show up. Select surface type and input a name. Then, click the “Share” button on the top right corner of the page and make sure that the project is set to “Public” as it needs to be public in order to be consumed from the web or the app.

For the games to be divided into different locations, it is essential to have a geolocated project.
To achieve this, in the upper right corner, you must click on settings and then activate "Geolocated project".

![geolocated-option](https://user-images.githubusercontent.com/118167082/201621477-24ead232-6023-4b4f-888c-9a63afd36ab6.png)

**Add locations**

Once the scenes are created it's time to put them in a certain location.

To do this you need to click on "Show Map" button at the top bar. Once there you can see a map and a list of the different scenes.
To set a location for a scenes it's only necessary to click on a scene, then click on "Add location" and finally select a point on the map.

![add-locations](https://user-images.githubusercontent.com/118167082/201621520-7d9d90eb-1ac5-419c-9f89-98c1565569c0.png)


**Add elements to the scene**

Inside the scene editor, you will now have to add the game objectives that the user will need to capture on their mobile phones. For this to work correctly, the most important step will be to name the elements (one or more) that form your objectives so they can be correctly identified. For example, if your objective is formed by logos, you will have to add elements with the name “logo” to the scene. 

![elements](https://user-images.githubusercontent.com/118167082/201621597-5e04067e-4c8e-486c-9b7d-11451d6b0d57.png)


To complete the game, the user will have to capture (click) in every objective element that we add to the scene.

### Custom styles
To custom the styles of the AR experience we need to use [online code editor](/onirix-player/online-code-editor) to include the new CSS rules that overwrite the default styles.

**Landing page**

Using the **#webar-geolocated-welcome-logo** selector we can change the landing page image and with **#webar-geolocated-welcome-card** the section below which is shown until the GPS activates and the user clicks the start button. We can also swap the location icon inside it.

We can also change de image inside the welcome logo as well as the image inside the card.

```css
#webar-geolocated-welcome-logo {
    background-image: url("https://my-host/images/oxhunt-welcome-logo.png") !important;
}

#webar-geolocated-welcome-logo img {
    content: url("https://my-host/images/oxhunt-logo.png") !important;
}

#webar-geolocated-welcome-card img {
    content: url("https://my-host/images/oxhunt-card-logo.png");
}
```

In this same view, the menu buttons and the options can also be changed with the following selectors:
* **.ox-g-round-button**: for all the buttons with rounded borders. It includes the “_View locations_” button of the welcome page.
* **.ox-navigate-button**: for the round buttons used for navigation (“_View on map_”).
* **#webar-geolocated-back-button**: for the back button on the top left corner.
* **#webar-geolocated-menu-button**: for the hamburger menu button on the top right corner.
* **.ox-locations-menu**: for the close icon on the locations menu.

```css
.ox-location-panel .ox-g-round-button.ox-navigate-button span { 
	display: none;
 }
.ox-location-panel .ox-g-round-button.ox-navigate-button::after {
	content: "Play this location";
    position: absolute;
    color: white !important;
    border-radius: 14px !important;
    background-color: #ee0979 !important;
 }
```

![styles](https://user-images.githubusercontent.com/118167082/201621673-6e810565-f5bf-453c-9133-2dd0de4b0612.png)


**Map styles**

On the online code editor we can change the location icon, the radius os the location, etc.

With **.ox-map-location-wrapper .ox-map-location** we can change the default image of the point on the map.
```css
.ox-map-location-wrapper .ox-map-location {
    background-image: url("https://my-host/images/oxhunt-poi.png") !important;
}
```

Also there are other states for available locations:
* **Normal**: the usual state of the location. It is neither selected nor accessible. Use **.ox-map-location-wrapper** to modify it.
* **Accessible**: when the user is inside the range of activation of a location the class **.ox-ar-enabled** is added to the location wrapper.
* **Selected**: a location is selected when the user has clicked on the location. Use **.ox-selected** to change its style.

For example:
```css
.ox-map-location-wrapper.ox-ar-enabled .ox-map-location {
    background-image: url("https://my-host/images/oxhunt-poi-selected.png") !important;
}
```

Finally, to change the radius you must use **.ox-location-radius**.
```css
.ox-location-radius {
    opacity: 1 !important;
    border: solid 3px rgba(49, 0, 76, 0.12) !important;
    background-color: rgba(49, 0, 76, 0.1) !important;
}
```

All of these can be combined to create custom states:
```css
.ox-map-location-wrapper.ox-selected .ox-location-radius {
    border: solid 4px rgba(238, 9, 121, 0.38) !important;
  background-color: rgba(238, 9, 121, 0.1) !important;
}
```

**OxHunt Tent**

To custom a single point on the map (in this case this point indicates a stand where the users can redeem theirs points), it is necessary to know the **OID** of the scene that represent this point.

![oid-copy](https://user-images.githubusercontent.com/118167082/201621759-0339e576-1569-4db3-ad1c-f1af2f9ecc0e.png)


Once the oid is known the steps to change the styles are the same, but adding the reference to that oid.
```css
.ox-map-location-wrapper.ox-map-location-wrapper--e1c89e721aea46b4b1f298caa0fe3eea {
    width: 50px;
    height: 50px;
}

.ox-map-location-wrapper.ox-map-location-wrapper--e1c89e721aea46b4b1f298caa0fe3eea .ox-map-location {
    background-image: url("oxhunt-tent-poi.png") !important;
    width: 100%;
    height: 100%;
    transform: translateY(50%);
    background-size: cover !important;
}

.ox-map-location-wrapper.ox-map-location-wrapper--e1c89e721aea46b4b1f298caa0fe3eea.ox-selected .ox-map-location {
    background-image: url("https://my-host/images/oxhunt-tent-poi.selected.png") !important;
}

.ox-map-location-wrapper.ox-map-location-wrapper--e1c89e721aea46b4b1f298caa0fe3eea .ox-location-radius {
    display: none;
}

.ox-map-location-wrapper.ox-map-location-wrapper--e1c89e721aea46b4b1f298caa0fe3eea.ox-selected {
    width: 50px !important;
    height: 50px !important;
}

.ox-map-location-wrapper.ox-map-location-wrapper--e1c89e721aea46b4b1f298caa0fe3eea.ox-selected .ox-map-location {
    width: 100% !important;
    height: 100% !important;
}

.ox-location-panel.ox-location-panel--e1c89e721aea46b4b1f298caa0fe3eea .ox-location-header > span:first-child {
    position: relative;
    color: transparent;
}

.ox-location-panel.ox-location-panel--e1c89e721aea46b4b1f298caa0fe3eea .ox-location-header > span:first-child::after {
    content: "OxHunt Tent" !important
}

.ox-location-panel.ox-location-panel--e1c89e721aea46b4b1f298caa0fe3eea .ox-g-round-button {
    display: none;
}
```
With this styles you can obtain something like this:

<img width="500" alt="oxhunt-tent" src="https://user-images.githubusercontent.com/118167082/201621819-4555a9f7-db54-453f-a183-ea2cf348da0f.png">


## Step 5: Connect to Onirix Studio

### Set up the token
After you have created a project and the scenes that you want to play on the web application, you need to set your **Onirix API key** on the client so it can read your Studio data and pull the projects and scenes.

To achieve this, select the project that you have just created, click the _Settings_ button on the top right corner, look for the “Onirix token” section and click “**Copy Onirix token**” to copy your key to the clipboard. Finally, paste it on the **.env.development** and **env.production** files in the client folder.

![copy-onirix-token](https://user-images.githubusercontent.com/118167082/201621908-e6321d0f-796b-4878-887a-576789589ee1.png)
<img width="300" alt="env" src="https://user-images.githubusercontent.com/118167082/201621942-7187fac9-99b6-4df7-bf7b-837c90d8c404.png">


### Settings collection
To configure the project you have to set some values in a single and unique record inside the Settings collection on Firestore:

* **name**: name of the festival / event
* **appHost**: host where the app is deployed (used in mails).
* **emailFrom**: emails from address.
* **startDate**: the date when the event starts (UTC).
* **endDate**: the date when the event ends (UTC).
* **startTime**: the hour and minutes that game period starts (UTC).
* **endTime**: the hour and minutes that game period ends (UTC).
* **onirixHost**: the Onirix Studio host.
* **onirixProjectOid**: the oid of the project used by de app.
* **onirixProjectToken**: the public token of the project.
* **scenes**: the oids of playable scenes.
* **cashierToken**: password used by cashier to redeem user's points.
* **tiers**:
    * **name**: name of the tier.
    * **min**: min score.
    * **max**: max score (can be null).

Start and end time applies to each day between start and end date.

Firestore stores dates in UTC so be careful because Firebase considers the date entered as local and is automatically converted to UTC.

### Add IFrame
In order for the experience to be seen, it is necessary to [embed the iframe](/onirix-player/embedded-iframes) of this experience in the application code.

To do this you need to copy the Iframe from Studio.

![add-iframe](https://user-images.githubusercontent.com/118167082/201622005-ef6dc437-bfbb-4f87-84b8-a64f68132fc6.png)

Once copied, we simply have to paste it into one of our components (the one we want to be responsible for the game itself)

![iframe](https://user-images.githubusercontent.com/118167082/201622065-79193892-1e6b-45a8-8762-8a3d05326f15.png)


Here an example of a component with communication with Studio to send and receive messages and save the score using integration with firebase:

```js
<template>
    <div>
       <iframe id="visor" 
       ref="onirixIframe"
       style="position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:999;display:block;border:none;" 
       src="https://studio.onirix.com/projects/9986960545584d38ba33e14d817b2d28/webar/beta?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyNjczLCJwcm9qZWN0SWQiOjMyMDQ3LCJyb2xlIjozLCJpYXQiOjE2NjI5ODE1ODd9.eEtm74BzSU57VJ8wt52V2uDnT-Ojp82WhEwtXFV6p4s" 
       allow="camera;gyroscope;accelerometer;magnetometer;fullscreen;xr-spatial-tracking;geolocation;"> 
       </iframe>
    </div>
</template>
<script>
import firebaseService from "../../services/firebase.service";
import oxhuntFunctions from "../../services/functions.service";

export default {
    name: 'GameView',
    data() {
        return {
            iframeUrl: null,
            messageListener: (messageEvent) => this.onMessageReceived(messageEvent)
        }
    },
    beforeMount() {
        this.setIframeUrl();
    },
    async created() {
        window.addEventListener('message', this.messageListener);
    },
    beforeUnmount() {
        window.removeEventListener('message', this.messageListener); 
    },
    methods: {
        async setIframeUrl() {
            const settings = await firebaseService.getSettings();
            const user = await firebaseService.getUser(true);
            let scenesPlayed = '';
            if (user.playedGames && 0 < user.playedGames.length) {
                scenesPlayed = `&oxhuntPlayed=${user.playedGames.map( game => game.sceneOid).join()}`;
            }
            this.iframeUrl = `${settings.onirixHost}/projects/${settings.onirixProjectOid}/webar?token=${settings.onirixProjectToken}${scenesPlayed}&locale=${this.$i18next.language}`;           
        },
        async onMessageReceived(msg) {
            if (msg && msg.data) {
                try {
                    const gameMessage = JSON.parse(msg.data);
                    if ('oxhunt-game-end' === gameMessage.action) {
                        try {
                            const response = await this.saveScore(gameMessage.sceneOid, gameMessage.score);
                            this.sendMessageToStudio(response, 'score-saved');
                        } catch (error) {
                            console.error(`Error on save score`, error.message);
                            let msg = {
                                title: error.message,
                                detail: ''
                            }
                            if (error.message == 'Game already played.') {
                                msg = {
                                    type: 'played',
                                    text: this.$t('game-played'),
                                }
                            } else if (error.message == 'Unknown game') {
                                msg = {
                                    type: 'played',
                                    text: this.$t('game-location'),
                                }
                            } else {
                                const settings = await firebaseService.getSettings();
                                msg = {
                                    type: 'closed',
                                    title: this.$t('game-closed-title'),
                                    text: this.$t('game-closed-text'),
                                    detail: oxhuntFunctions.getDateString(settings),
                                }
                            }
                            this.sendMessageToStudio(msg, 'error');    
                        }
                    } else if ('oxhunt-go-home' === gameMessage.action) {
                        this.$router.push('/');
                    }
                } catch (error) {
                    console.debug(`Unknown message`, msg.data, error);
                }
            }
        },
        async saveScore(sceneOid, score) {
            const response = await firebaseService.saveScore(sceneOid, score);
            return response;
        },
        sendMessageToStudio(msg, action) {
            msg['origin']= 'OxHuntMusic';
            msg['action']= action;
            this.$refs.onirixIframe.contentWindow.postMessage(JSON.stringify(msg), '*');
        }
    }
}
</script>
```

Once this is set up, you can start to develop the experience.

## Step 6: Test the game
After you have cloned the project code, configured **Firebase**, registered on **Onirix** account, designed the scenes associated with the hunt and written all the API keys, you can start testing the application and developing it more.

To accomplish this, launch the application on localhost following the next steps:
1. On one terminal window, navigate to the functions folder inside the backend one.
    1.1. Run _npm install_ to get all the npm packages.
    1.2. Then, _run npm run build:watch_ so a new bundle is built after every change.
2. On another terminal, navigate to the backend folder.
    2.1. Execute _firebase init emulators_ and select at least _Functions_, _Firestore_ and _Storage_.
    2.2. On the same terminal, _run firebase emulators:start_.
    4.3. You should be able to see the **Firestore Emulator Suite** on http://localhost:4000. 
3. On another terminal, navigate to the client folder.
    3.1. Execute _npm install_ to get **Vue** and the other packages.
    3.2. Run _npm run serve_ in order to deploy the web client on port 8080.

!!! Apart from third party packages, the client application depends on two Onirix libraries: [@onirix/api-client](https://www.npmjs.com/package/@onirix/api-client) and [@onirix/embed-sdk](https://www.npmjs.com/package/@onirix/embed-sdk). Make sure everything is correctly installed when running _npm install_.

### Play the game
Now that your game is running in local, you need to access localhost:8080 from the browser, once there, the landing page will be displayed.

The first time you access any user account has been created, so, the first step y register on the application.

<img width="300" alt="client-register" src="https://user-images.githubusercontent.com/118167082/201622129-2f288e47-9e7e-4434-800f-c2ead76c7c37.png">


Once you're register, the second step is read the game rules. This is an important step because here are the rules and how the game works.
When you have read the rules, go back to the home page and click on "Play". This will take you to the AR experience, where "View Locations" option is displayed.

When you click on "View Locations" the map will appear with the different locations. To be able to play one of them, you must be in its access radius, then, once inside the radius, simply click on it and press "Play this location".

This example shows how you must be inside the radius to be able to play:

<img width="300" alt="access-radius-enable" src="https://user-images.githubusercontent.com/118167082/201622189-c1ab4bac-c382-4d34-9711-cfe60c0dbd0e.png">


When we access the location game, we will see several logos that we have to capture in less than 30s, each captured logo gives a number of points, ideally we would like to catch all the logos to get the highest score.

Once the game is over, we can stay on the map to play another location or redeem the points to obtain the corresponding prize.

## Step 7: Deploy your Scavenger Hunt
In order to deploy your own scavenger hunt on a server, you will have to deploy the custom Firebase functions, serve the clients bundle from a server or cloud service and secure the administration panel so only the managers of the application can access it.

### Deploy firebase functions
To correctly deploy the firebase functions on **index.ts** to the online **Firebase** application, you will need to open a new terminal and run the command _firebase deploy_. This will compile the code, connect to Google’s cloud services and deploy the functions there.

!!! To achieve this you will need to upgrade your **Firebase** plan to the “Blaze (pay as you go)” billing plan.

### Generate and serve the client’s bundle
After the **Firebase** backend is deployed, your next action should be to serve the web application so it can be publicly accessed.

To achieve this, first, navigate to the client folder and, from a terminal, run _npm run build_. This command will compile the **Vue** application and generate in the “dist” folder all the files that you need to deploy in a server. Although an **Apache Server** was used for this example, you can deploy this with your tool of choice (AWS, Google Cloud, Window Server, …).

<img width="300" alt="dist" src="https://user-images.githubusercontent.com/118167082/201622267-45e449c9-170f-4da0-bb79-5f75af2460fa.png">

### Secure the administration panel
As you already saw, this application is divided in two different parts: the administration panel and the client (phone oriented) zone. Through the first one, the manager of the event can inspect the data generated by the users of the AR experience (registered users and the games played by them). On the second part, the user can register if they are a new user, log in with their credentials if they already participated before, read the game instructions and play with the AR scenes.

As the name indicates, the administration panel should be exclusive to the managers of the application and as such has to be protected from the public. In order to achieve this, in this example [**Nginx**](https://www.nginx.com/) was used but, as mentioned before with the email or the storage, you can implement your preferred method of security.

If you opt for using Nginx for deploying the app, you can protect the admin location from your Nginx configuration file like:

```
location / {
	try_files $uri /index.html;
}

location /admin {
    auth_basic "Administrator's Area";
    auth_basic_user_file /etc/nginx/.ipsumhunt.htpasswd;
    try_files $uri /index.html;
}
```

For more information on how to achieve this HTTP security with Nginx and how to generate the _htpasswd_ file check their [documentation](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/).

