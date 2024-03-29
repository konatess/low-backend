export default {
    error: {
        type: {
            noLogin: "Not Logged In",
            invalid: {
                auth: "Invalid Authorization",
                unique: "Name Not Unique",
                story: "Invalid Story Id",
                author: "Invalid Author Id",
                page: "Invalid Page Id",
                tag: "Invalid Tag Id",
                string: "Invalid String",
            },
            notFound: {
                story: "Story Not Found",
                author: "Author Not Found",
                page: "Page Not Found",
                tag: "Tag Not Found",
                authorStory: "No Stories Found",
            },
            denied: {
                page: "Page Permission Denied",
                story: "Story Permission Denied"
            },
            notPublic: {
                story: "Story Not Public",
                page: {
                    orphan: "Orphaned Page",
                    notFinished: "Page Not Finished"
                }
            },
            default: "Unknown Error"
        },
        message: {
            notObj: "Error handler module expects an object!",
            noLogin: "Sorry, you need to be logged in to do that.",
            invalid: {
                auth: "Stop messing with me. That's not a valid id, and you shouldn't be here.",
                story: "Sorry, that's not a story.",
                author: "Please log in first!",
                unique: "Sorry, that username is already taken.",
                page: "Sorry, that's not a page.",
                tag: "What tag were you looking for?",
                string: "String did not pass checks",
            },
            notFound: {
                story: "Sorry, we couldn't find that story.",
                author: "Sorry, we couldn't find that author.",
                page: "Sorry, we couldn't find that page.",
                tag: "Tag Not Found",
                authorStory: "Sorry, we couldn't find any stories by this author.",
            },
            denied: {
                page: "Hands off!",
                story: "Hands off!",
            },
            notPublic: {
                story: "That story's not ready for prime-time!",
                page: "That page isn't ready for prime-time!"
            },
            default: "Sorry, something went wrong."
        },
        
    },
    linkDisplay: {
        home: "← Return Home",
        tags: "← See All Tags",
        authors: "← See All Authors"
    },
    url: {
        tags: "/tags",
        authors: "/authors",
    },
    defaultUsername: "test",
}