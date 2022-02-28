import str from "../constants/strings.js";

export default {
    messageTemplate: function (err) {
        if(typeof(err)!=="object") {
            throw new Error(str.error.message.notObj);
        }
        //create an object to hold info about the error that we'll pass to the front end
        let errorInfo = {}; 
        //now look at the error object to figure out what to say!
        switch (err.message) {
        case str.error.noLogin: 
            errorInfo.errorMessage = str.error.message.noLogin;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.invalid.story:
            errorInfo.errorMessage = str.error.message.invalid.story;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.invalid.author:
            errorInfo.errorMessage = str.error.message.invalid.author;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.invalid.auth:
            errorInfo.errorMessage = str.error.message.invalid.auth;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.invalid.unique:
            errorInfo.errorMessage = str.error.message.invalid.unique;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.invalid.page: 
            errorInfo.errorMessage = str.error.message.invalid.page;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;   
        case str.error.type.invalid.tag:
            errorInfo.errorMessage = str.error.message.invalid.tag;
            errorInfo.url = str.url.tags;
            errorInfo.linkDisplay = str.linkDisplay.tags;
            break;      
        case str.error.type.notFound.story: 
            errorInfo.errorMessage = str.error.message.notFound.story;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.notFound.page:
            errorInfo.errorMessage = str.error.message.notFound.page;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;         
            break;
        case str.error.type.denied.story:
            errorInfo.errorMessage = str.error.message.denied;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.notPublic.story:
            errorInfo.errorMessage = str.error.message.notPublic.story;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.denied.page: 
            errorInfo.errorMessage = str.error.message.denied;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.notPublic.page.orphan: str.error.type.notPublic.page.orphan
            errorInfo.errorMessage = str.error.message.notPublic.page;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.notPublic.page.notFinished:
            errorInfo.errorMessage = str.error.message.notPublic.page;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        case str.error.type.notFound.author:
            errorInfo.errorMessage = str.error.message.notFound.author;
            errorInfo.url = str.url.authors;
            errorInfo.linkDisplay = str.linkDisplay.authors;
            break;
        case str.error.type.notFound.authorStory: 
            errorInfo.errorMessage = str.error.message.notFound.authorStory;
            errorInfo.url = str.url.authors;
            errorInfo.linkDisplay = str.linkDisplay.authors;
            break;
        default: //if we get a misc error, assume server error
            errorInfo.errorMessage = str.error.message.default;
            errorInfo.url = "/";
            errorInfo.linkDisplay = str.linkDisplay.home;
            break;
        }
        return errorInfo;
    },
    statusCode: function(err) {
        if(typeof(err)!=="object") {
            throw new Error({message: str.error.message.notObj});
        }
        //otherwise, send the right type of status (depending on the error)
        var statusNumber;
        switch(err.message) {
        //status numbers for malformed requests
        case str.error.noLogin:
            statusNumber = 400;
            break;
        case str.error.type.invalid.story:
            statusNumber = 400;
            break;
        case str.error.type.invalid.author:
            statusNumber = 400;
            break;
        case str.error.type.invalid.auth:
            statusNumber = 400;
            break;
        case str.error.type.invalid.unique:
            statusNumber = 400;
            break;
        case str.error.type.invalid.page: 
            statusNumber = 400;
            break;
        case str.error.type.invalid.tag:
            statusNumber = 400;
            break;
            //status numbers for 404s (not found)
        case str.error.type.notFound.story:
            statusNumber = 404;
            break;
        case str.error.type.notFound.page:
            statusNumber = 404;
            break;
        case str.error.type.notFound.author:
            statusNumber = 404;
            break;
        case str.error.type.notPublic.story:
            statusNumber = 403;
            break;
        case str.error.type.denied.story:
            statusNumber = 403;
            break;
        case str.error.type.denied.page:
            statusNumber = 403;
            break;
        case str.error.type.notPublic.page.orphan:
            statusNumber = 403;
            break;
        case str.error.type.notPublic.page.notFinished:
            statusNumber = 403;
            break;
        default: 
            statusNumber = 500;
            break;
        }
        return statusNumber;
    }
};