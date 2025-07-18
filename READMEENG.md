# Travel Journal

A full-featured Travel Journal app – React frontend and Node.js/Express backend with MongoDB.


## Main Features
- **Sign Up & Login** – User management with JWT authentication.
- **Trips Management** – Add, edit, delete, view trips, including image upload for each trip.
- **Entries Management** – Add, edit, delete, view entries, including image upload for each entry, and link to a trip.
- **Image Upload** – Images are stored in Cloudinary (or on the server).
- **Fully Responsive** – Styled with Tailwind CSS.
- **React Router** – Navigation between screens, route protection.
- **Server-Only Data** – All data is saved and loaded from MongoDB via the backend.
- **Sorting, Styling, and Advanced Functionality**.

## Project Structure
```
travel-journal-backend/
  server.js           # Express server, routes, MongoDB connection
  models/Entry.js     # Entry model
  models/Trip.js      # Trip model
  package.json        # Backend dependencies

travel-journal-frontend/
  src/
    App.jsx           # Main component, routing
    main.jsx          # App entry point
    components/
      Dashboard.jsx   # Dashboard for trip entries
      EntryForm.jsx   # Add entry form
      Trips.jsx       # Trips page
      Login.jsx       # Login page
      Signup.jsx      # Signup page
  package.json        # Frontend dependencies
  tailwind.config.js  # Tailwind config
  ...
```

## Installation & Running
1. **Clone the repository**
2. **Install dependencies**
   - Backend: `npm install`
   - Frontend: `npm install`
3. **Set environment variables**
   - In backend, create a `.env` file with:
     ```
     MONGO_URI=... # Your MongoDB connection string
     JWT_SECRET=... # JWT secret key
     CLOUDINARY_CLOUD_NAME=...
     CLOUDINARY_API_KEY=...
     CLOUDINARY_API_SECRET=...
     ```
4. **Run the servers**
   - Backend: `npm start` (regular run) or `npx nodemon server.js` (auto-restart on changes)
   - Frontend: `npm run dev`
5. **Access the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000](http://localhost:5000)

## Technologies
- React, React Router, Tailwind CSS
- Node.js, Express
- MongoDB + Mongoose
- Multer, Cloudinary
- reactbits.dev (Text Animations/Text Cursor)

## Notes
- Each user sees only their own trips and entries.
- Image upload is available for both trips and entries.
- All changes are saved to the server and reflected immediately in the UI.

---

For questions or feedback, contact the developers:
Ben & Nadav
