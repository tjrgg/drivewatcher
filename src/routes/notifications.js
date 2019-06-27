const config = require("../../config.js");
const router = module.exports = require("express").Router();

router.post("/notifications", (req, res) => {
    if (!req.get("User-Agent") || req.get("User-Agent") !== "APIs-Google" || req.get("X-Goog-Channel-Token") !== config.googleAuthToken)
        return res.status(400).send("Request was not sent from Google.");

    const XGoogChannelID = req.get("X-Goog-Channel-ID")
    const XGoogResourceState = req.get("X-Goog-Resource-State");

    if (XGoogResourceState == "sync") {
        // A new channel was successfully created. You can expect to start receiving notifications for it.

    } else if (XGoogResourceState == "add") {
        // A new resource was created or shared.

    } else if (XGoogResourceState == "remove") {
        // 	An existing resource was deleted or unshared.

    } else if (XGoogResourceState == "update") {
        // One or more properties (metadata) of a resource have been updated.
        // For update events, the X-Goog-Changed HTTP header might be provided. That header contains a comma-separated list that describes the types of changes that have occurred.
        const XGoogChanged = req.get("X-Goog-Changed");
        /*
            content:	    The content of the resource has been updated.
            properties:	    One or more properties of the resource have been updated.
            parents:	    One or more parents of the resource have been added or removed.
            children:	    One or more children of the resource have been added or removed.
            permissions:	The permissions of the resource have been updated.
        */

    } else if (XGoogResourceState == "trash") {
        // A resource has been moved to the trash.

    } else if (XGoogResourceState == "untrash") {
        // A resource has been removed from the trash.

    } else {
        // Unknown state
        console.log(`An unknown state occurred: ${XGoogResourceState}`);
    }
});
