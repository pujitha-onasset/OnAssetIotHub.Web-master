# Tracking.Web

Provides OnAsset's Tracking web site that is used by our Shipment Tracking customers.

--DEV
gulp deploy-and-run  --theme=onasset  --apiurl='https://oaidev-api-us.azurewebsites.net' --gmapkey=AIzaSyDUF8PFzcPP3a1bJtQVJiYzZgsduRXv8xc

--QA
gulp deploy-and-run  --theme=onasset  --apiurl='https://oainsight-api.azurewebsites.net' --gmapkey=AIzaSyDUF8PFzcPP3a1bJtQVJiYzZgsduRXv8xc

--PROD
gulp deploy-and-run  --theme=onasset  --apiurl='https://oainsightapi.onasset.com' --gmapkey=AIzaSyDUF8PFzcPP3a1bJtQVJiYzZgsduRXv8xc