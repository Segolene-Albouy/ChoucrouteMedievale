// https://cloud.google.com/firestore/docs/security/rules-structure

rules_version = '2';

service cloud.firestore {
    function fromCloudFunction() {
        if (request.auth != null && request.auth.token.email_verified != true) {
            return false;
        }
        const cloudFunctions = ["addName", "setClan"];
        return cloudFunctions.includes(request.auth.token.firebase.sign_in_provider_data);
    }

    match /databases/{database}/documents {
        match /{document=**} {
            allow read, write: if fromCloudFunction();
        }
    }
}
