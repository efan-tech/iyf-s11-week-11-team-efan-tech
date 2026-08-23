# NIKO ON

## Author
- **Name:** Albert (Efan Tech)
- **GitHub:** [@efan-tech](https://github.com/efan-tech)
- **Date:** August 21, 2026

## Project Description
Community Hub is a full-stack web application designed to handle campus community updates, dynamic post feeds, and user feedback submissions in a unified dashboard.

## Technologies Used
- HTML5
- CSS3 / Tailwind CSS
- JavaScript
- React (Vite)
- Node.js & Express.js
- MongoDB & Mongoose
- Axios
- Vercel (Frontend Hosting)
- Render (Backend Hosting)

## Features
- Dynamic post feeds, activity streams, and card components
- Interactive feedback forms, modals, floating action buttons, and status alerts
- Express REST API with MongoDB database schemas and validation
- JWT security handling, protected endpoints, and error handling
- Cross-Origin Resource Sharing (CORS) setup connecting live Vercel and Render deployments

## 📁 Repository Structure
community-hub/
├── frontend/    # Vite + React UI & Components
└── backend/     # Express API Routes & Database Models

## How to Run
1. Clone this repository
   ```bash
   git clone [https://github.com/efan-tech/community-hub.git](https://github.com/efan-tech/community-hub.git)
   cd community-hub
 ```
 frontend setup
 ```bash
 cd frontend
 npm install
 npm run dev
 ```

 backend setup
 ```bash
 cd ../backend
 npm install
 npm start
 ```
 ## Lessons Learned
 - Building a full-stack application step-by-step from layout design to backend deployment.
 - Setting up and initializing every core module required for an app to run reliably.
 - Deploying frontend and backend services sequentially using Vercel and Render.
 - Integrating database models, REST routes, and CORS headers step-by-step.
 - Coordinating multi-developer git workflows and branch protection strategies.
 
 ## Challenges Faced
 - Navigating the complexities of teamwork and coordinating tasks across multiple roles.
 - Managing project integration when tasks were not as simple or straightforward as they initially seemed.
 - Troubleshooting code using AI tools, where pinpointing issue root causes remained difficult without deep foundational knowledge of where errors originated.
 - Resolving environment variable and CORS mismatch issues during final production deployment.
 - Handling merge conflicts and keeping developer branches aligned during concurrent feature pushes.
 
 ## 🚀 Live Deployments
 - **Frontend (Vercel):** https://community-hub-murex.vercel.app
 - **Backend (Render):** https://community-hub-2af6.onrender.com
 
