# Auth setup

## Packages

To setup the auth:

> npm i firebase-admin

If you need to load from .env file :

> npm i dotenv

## Setup

Go to your firebase module and generate a service key.

Create the following variables in your environment :

```
FIREBASE_PRIVATE_KEY="<the key>"
FIREBASE_CLIENT_EMAIL="<firebase email>"
FIREBASE_DATABASE_URL="<not needed if you don't use FB as database>"
FIREBASE_PROJECT_ID= "<your project id in FB>"
```
