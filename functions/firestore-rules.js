rules_version = '2';

service cloud.firestore {
    function isCloudFunction() {
        return request.auth != null &&
            request.auth.token.email_verified == true &&
            request.auth.token.firebase.sign_in_provider_data in ["checkName", "changeAttendance", "getThread", "getThreads", "gueux", "newMessage", "newThread", "setPsw", "teamList"];
    }

    match /databases/{database}/documents {
        match /{document=**} {
            allow read, write: if isCloudFunction();
        }
    }
}
