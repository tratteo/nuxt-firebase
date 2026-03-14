# Nuxt Firebase + Genkit AI Demo app 

Feel free to use this demo app as a starting project for any of your Nuxt projects.

## 1. Firebase and UI: Setup

[![Youtube tutorial (Setup)](https://img.youtube.com/vi/BSuBX_mt2aw/0.jpg)](https://www.youtube.com/watch?v=BSuBX_mt2aw)

### Link to Firebase
Run the following commands to link your Firebase project to the repo:
```sh
firebase login
```
and then
```sh
firebase init
```

### Environment variables

The project requires a `.env` file to be located at the root folder with the following content:

```sh
# FIREBASE
NUXT_FIREBASE_API_KEY=""
NUXT_FIREBASE_AUTH_DOMAIN=""
NUXT_FIREBASE_PROJECT_ID=""
NUXT_FIREBASE_STORAGE_BUCKET=""
NUXT_FIREBASE_MESSAGING_SENDER_ID=""
NUXT_FIREBASE_APP_ID=""

# Copy and paste here the whole content of the serviceAccount.json file
NUXT_FIREBASE_SERVICE_ACCOUNT=''
```

### Install & run

Install dependencies with whatever package manager you are using:
```sh
bun install
```

And run the development server:
```sh
bun run dev
```

Check out the [video tutorial](https://www.youtube.com/watch?v=BSuBX_mt2aw) to know how to create your Firebase project and link it to this template.

## 2. Implementing AI features with Genkit
The project uses Genkit to add AI features to our app.

[![Youtube tutorial (Genkit)](https://img.youtube.com/vi/FBxahf-k868/0.jpg)](https://www.youtube.com/watch?v=FBxahf-k868)


### Cheers!