# Travel Journal

מערכת יומן מסע (Travel Journal) – אפליקציית רישום טיולים ורשומות אישיות, מבוססת React (frontend) ו-Node.js/Express (backend) עם MongoDB.

## תכונות עיקריות
- **הרשמה והתחברות** – ניהול משתמשים עם JWT.
- **ניהול טיולים (Trips)** – הוספה, עריכה, מחיקה, תצוגה, העלאת תמונה לכל טיול.
- **ניהול רשומות (Entries)** – הוספה, עריכה, מחיקה, תצוגה, העלאת תמונה לכל רשומה, קישור לטיול.
- **העלאת תמונות** – שמירה ב-Cloudinary (או לשרת).
- **ריספונסיביות מלאה** – עיצוב Tailwind CSS.
- **React Router** – ניווט בין מסכים, הגנה על ראוטים.
- **שמירה וטעינה מהשרת בלבד** – כל המידע נשמר ב-MongoDB.
- **מיון, עיצוב, ופונקציונליות מתקדמת**.

## מבנה הפרויקט
```
travel-journal-backend/
  server.js           # שרת Express, מסלולים, חיבור ל-MongoDB
  models/Entry.js     # מודל רשומה
  models/Trip.js      # מודל טיול
  package.json        # תלויות backend

travel-journal-frontend/
  src/
    App.jsx           # רכיב ראשי, ניהול ראוטים
    main.jsx          # כניסה לאפליקציה
    components/
      Dashboard.jsx   # דשבורד רשומות לטיול
      EntryForm.jsx   # טופס הוספת רשומה
      Trips.jsx       # דף טיולים
      Login.jsx       # דף התחברות
      Signup.jsx      # דף הרשמה
  package.json        # תלויות frontend
  tailwind.config.js  # קונפיגורציית Tailwind
  ...
```

## התקנה והרצה
1. **שכפול הריפוזיטורי**
2. **התקנת תלויות**
   - ב-backend: `npm install`
   - ב-frontend: `npm install`
3. **הגדרת משתני סביבה**
   - ב-backend: קובץ `.env` עם:
     ```
     MONGO_URI=... # כתובת MongoDB
     JWT_SECRET=... # מפתח JWT
     CLOUDINARY_CLOUD_NAME=...
     CLOUDINARY_API_KEY=...
     CLOUDINARY_API_SECRET=...
     ```
4. **הרצת השרת**
   - ב-backend: `npm start` (הרצה רגילה) או `npx nodemon server.js` (הרצה עם ריענון אוטומטי)
   - ב-frontend: `npm run dev`
5. **גישה לאפליקציה**
   - frontend: [http://localhost:5173](http://localhost:5173)
   - backend: [http://localhost:5000](http://localhost:5000)

## טכנולוגיות עיקריות
- React, React Router, Tailwind CSS
- Node.js, Express
- MongoDB + Mongoose
- Multer, Cloudinary

## הערות
- כל משתמש רואה רק את הטיולים והרשומות שלו.
- העלאת תמונה אפשרית גם בטיול וגם ברשומה.
- כל שינוי נשמר בשרת ומוצג מיידית ב-UI.

---

לשאלות/הערות: ניתן לפנות למפתח.
