# New README for sprint 4
Project Overview

TigerTix is a full-stack microservices application designed to give students a simple and convenient way to find and book events at Clemson. It provides secure user authentication, an accessible user interface for all users, such as keyboard and voice navigation, and an AI-powered integrated LLM chatbot that uses English for ticket booking.

**Tech Stack (React, Node.js, Express, SQLite/Supabase, LLM API)**
**Frontend**
React.js
User interface, accessibility features, chatbot interaction
**Backend Framework**
Node.js
RESTful microservices (Admin, Client, Auth, LLM) - GET, POST, PUT, etc.
**Database**
SQLite and JSON packages
Persistent local database shared between services. SQLite was used for some DB management
**Authentication**
bcryptjs, jsonwebtoken (JWT)
Secure password hashing and session management
**AI Integration**
OpenAI API
Natural language parsing for ticket booking
**Accessibility**
Web Speech API, ARIA labels
Voice input and screen-reader support
**Deployment**
Render & Vercel
Deployment + hosting services.


**Architecture Summary (microservices + data flow)**
Frontend React - Port 3000: Displays events, buttons, and login forms, and different accessibility features
User Authentication Service - Port 5000: Handles registration, login verification, JWT, and session handling 
Admin Service - Port 5001: Manages event creation and details
Client Service - Port 6001: Endpoints for ticket purchasing and event viewing
LLM-Driven Booking - Port 8080: Parses the language entered in the chatbox for the AI.

**Installation & Setup Instructions**
After cloning the repository, go to each microservice and run npm install
Go to admin-service, client-service, user-authentication, llm-driven-booking, front-end and in each run npm install

**Environment Variables Setup**
The user-authentication/.env and llm-driven-booking/.env need to be set up and configured to your preference for security.
In the user-authentication in the .env, create a JWT_SECRET= (CHOOSE YOUR OWN)
Use PORT=5000

In the llm-driven-booking in the .env, create an OPENAI_API_KEY=(CHOOSE YOUR OWN KEY)
Use PORT=8080

**How to run regression tests**
Install test dependencies on each backend service. (admin-service, client-service, user-authentication, etc.):
Run: npm install --save-dev jest supertest
npm test
If jest is not defined as a script, run npx jest
If you are flagged for running scripts, use the following: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
After this, cd into each service folder and run npm test
**Manual Regression Tests for Frontend**
Perform these steps in the browser after automated tests:
Login/Register - a user via the frontend.
Book an event - using the chatbot or event buttons.
Logout - and verify token clearance.
Test accessibility - navigate using keyboard (Tab/Enter) and voice input.
 LLM chatbot - make sure text commands like “Book 2 tickets for Tiger Fest” are parsed correctly.



**Team Members, instructor, TAs, and roles**
Maxton Negreiros- Product Owner
Grayson Simmons- Scrum Master

Instructor: Professor Brinkley
TA: Colt Dolster
TA: Atik Enam


**License**
(https://choosealicense.com/licenses/)
MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


