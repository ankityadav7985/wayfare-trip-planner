# ✈️ Wayfare – AI Trip Planner

Wayfare is an AI-powered trip planner that converts a natural language travel description into a structured, editable day-by-day itinerary.

## Features

- Generate AI-powered travel itineraries
- Edit, add, remove, and reorder trip stops
- Handles malformed AI responses safely
- Responsive React UI
- Express backend with secure API key handling

## Tech Stack

### Frontend
- React 18
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js

### AI
- Groq / OpenAI-compatible APIs

## Installation

```bash
npm install
copy .env.example .env
```

Update `.env` with your API key.

```bash
npm start
```

Frontend: http://localhost:5173

Backend: http://localhost:3001

## Project Workflow

1. User enters a trip description.
2. React sends the request to the Express backend.
3. The backend calls the AI model.
4. The AI returns itinerary data.
5. The frontend validates and displays the itinerary.
6. Users can edit the generated itinerary interactively.

## Challenges Solved

- Parsing inconsistent AI responses
- Preventing outdated API responses from replacing newer ones
- Graceful error handling
- Interactive itinerary editing
- Secure backend API integration

## Future Improvements

- User authentication
- Save itineraries
- Google Maps integration
- PDF export
- Weather information
- Budget estimation

## Development

This project was completed as part of a frontend assessment. I configured the application, integrated the AI API, tested the complete workflow, fixed runtime issues, and verified that the application met the assignment requirements.

## Time Spent

Approximately 8–10 hours.
