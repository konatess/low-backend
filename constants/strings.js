export default {
    error: {
        type: {
            noLogin: "Not Logged In",
            invalid: {
                auth: "Invalid Authorization",
                story: "Invalid Story Id",
                author: "Invalid Author Id",
                page: "Invalid Page Id",
                tag: "Invalid Tag Id",
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
            }
        },
        message: {
            notObj: "Error handler module expects an object!",
            noLogin: "Sorry, you need to be logged in to do that.",
            invalid: {
                story: "Sorry, that's not a story.",
                author: "Please log in first!",
                page: "Sorry, that's not a page.",
                tag: "What tag were you looking for?",
            },
            notFound: {
                story: "Sorry, we couldn't find that story.",
                author: "Sorry, we couldn't find that author.",
                page: "Sorry, we couldn't find that page.",
                tag: "Tag Not Found",
                authorStory: "Sorry, we couldn't find any stories by this author.",
            },
            denied: "Hands off!",
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
    }
}