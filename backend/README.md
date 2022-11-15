# Firebase use

## Work with emulators

Firebase allows you to start local emulators for all its services. Run `firebase init` to configure the services that you want to start when the emulator runs.

Everytime the firestore emulator goes down, all its data is lost. But it's possible export Firestore data while it's running using this command:

`firebase emulators:export --only firestore ./firestore_data`

Running it will save all firestore's data in the firestore_data folder.

You can load this exported data on emulator starts with this command:

`firebase emulators:start --import ./firestore_data`

## How to debug Firebase functions.

First you have to build your code in watch mode. Open one terminal and type:

`tsc --watch`

In other terminal you have to start the firebase emulator on watch mode with this command:

`firebase emulators:start --inspect-functions`

Finally to debug in vscode, open de Debug view and add this configuration:

    {
        "version": "0.2.0",
        "configurations": [
            {
            "type": "node",
            "request": "attach",
            "name": "Debug",
            "port": 9229
            }
        ]
    }


## In this project

Run `npm build:watch` to build code in debug mode.

Run `npm serve:watch` to run Firebase emulator in debug mode and import a bunch of data.

Run `npm serve` to start Firebase emulator and import a bunch of data.

Run `npm deploy` to deploy Firebase functions on Google Cloud.