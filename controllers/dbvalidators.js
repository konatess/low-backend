const validString = (str) => {
    return typeof str === "string"
}

export default {
    // these should all return true or false for convention
    userName: (username) => {
        return !validString(username) || username.length < 3 || username.length > 50 ? false : true
    },
    storyTitle: (title) => {
        return !validString(title) || title.length < 2 || title.length > 100 ? false : true
    },
    storyDesc: (description) => {
        return !validString(description) || description.length > 100 ? false: true
    },
    tagName: (tagname) => {
        return !validString(tagname) || tagname.length < 2 || tagname.length > 50 ? false : true
    }, 
    pageTitle: (title) => {
        return !validString(title) || title.length < 1 || title.length > 100 ? false : true
    }, 
    pageContent: (content) => {
        return !validString(content) || content.length < 1 || content.length > 5000 ? false : true
    },
    linkName: (linkname) => {
        return !validString(linkname) || linkname.length < 1 || linkname.length > 100 ? false : true
    },
}