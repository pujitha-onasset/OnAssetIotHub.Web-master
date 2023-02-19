# Sentinel.Gateway.Web

This is the secured website that provides a user-interface on top of the Sentinel.Gateway.Api project


## Setup

For environment setup follow these steps
- install npm (which is packaged in node.hs) from here http://nodejs.org/dist/v0.12.4/x64/node-v0.12.4-x64.msi
- modify the PATH system environment variable to include the npm dir. Should be {USER_DIR}\AppData\Roaming\npm
- from the command line run: npm install bower -g
- from the command line run: npm install gulp -g

For project setup
- run setup.bat

Live Reload is used to update the browser in real time as changes are made. You will need the Live Reload browser extenstion for this to work. 
Go here to install it https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?utm_source=chrome-app-launcher-info-dialog

To start the app
- run start.bat

Once the app is running, go to http://localhost:3081
Be sure to enable the Live Reload extension


For Build Server Setup
- Follow the steps above while logged into the build server as the team city user that the team city build agent service runs under.
- install the node plugin (https://github.com/jonnyzzz/TeamCity.Node)
- Create a project and setup a VCS root
- Add a build step and call it "Run npm" 
	- Set the runner type to "Node.js NPM". 
	- In the npm commands text box type "install". 
- Add another build step and call it "Run gulp" 
	- Set the runner type to "Gulp". 
	- In the "Gulp File:" text box type gulpfile.js. 
	- In the "Gulp Tasks:" text box type "clean-build-app-release". 
	- In the "Additional command line parameters:" text box type "--apiurl='{API_URL}'" replacing {API_URL} with the url of the target api. For example the qa server is setup to use "--apiurl='https://api-visionqa.onasset.com'"
- Add a build step and call it "Release to {SERVER_NAME}" replacing {SERVER_NAME} with the target server
	- Set the runner type to "Powershell"
	- In the "Script" drop down select "Source Code"
	- In the "Scrip Source" text box type "Import-Module .\deploy.psm1"
	- On the next line type "Deploy-Website -computer "{SERVER_NAME}" -destPath "{DESTINATION_PATH}"" replacing {SERVER_NAME} with the target name or IP address and replacing {DESTINATION_PATH} with the target directory path for the site i.e. "C:\Applications\Vision.Tracking.Web"
- Repeat the last step for each app server being deployed to.
 
-Run commands:

--DEV
gulp deploy-and-run --apiurl='https://oaidev-api-us.azurewebsites.net' --gmapkey=AIzaSyDUF8PFzcPP3a1bJtQVJiYzZgsduRXv8xc

--QA
gulp deploy-and-run --apiurl='https://oainsight-api.azurewebsites.net' --gmapkey=AIzaSyDUF8PFzcPP3a1bJtQVJiYzZgsduRXv8xc

--PROD
gulp deploy-and-run --apiurl='https://oainsightapi.onasset.com' --gmapkey=AIzaSyDUF8PFzcPP3a1bJtQVJiYzZgsduRXv8xc --visionapiurl='https://api-vision.onasset.com'


