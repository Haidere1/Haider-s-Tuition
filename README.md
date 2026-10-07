# Star Tutors – Parent Portal (Firebase)

No server needed. `index.html` talks straight to Firebase (Auth + Firestore).
Deploy the single file on GitHub Pages.

## 1. Firebase setup (5 min)
1. https://console.firebase.google.com -> Add project (free Spark plan is enough).
2. Build -> Authentication -> Get started -> enable **Email/Password**.
   Users tab -> Add user: your email + your teacher password. That is your teacher login.
3. Build -> Firestore Database -> Create database (production mode).
4. Firestore -> Rules tab -> paste `firestore.rules`, replace `YOUR_TEACHER_EMAIL`
   with the email from step 2, click Publish.
5. Project settings (gear) -> Your apps -> Web (</>) -> register -> copy the config.

## 2. Edit index.html
Near the top of the script:
- paste the config into `firebaseConfig`
- set `ADMIN_EMAIL` to your teacher email (same one as in the rules)

## 3. GitHub Pages
Push the repo -> Settings -> Pages -> Deploy from branch `main` / root.
In Firebase -> Authentication -> Settings -> Authorized domains, add `YOUR-USERNAME.github.io`.

## How access works
- Teacher: types the password on the site (email is fixed in the page). Firebase checks it. Only that account can add, edit or delete.
- Parent: types their child's 8-character code. The code is the document ID, so a parent can read only that one report. They cannot list other students or see private notes.
- The Firebase config in index.html is public by design. The security is the rules file, so publish it.
