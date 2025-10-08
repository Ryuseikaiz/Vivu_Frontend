# Vivu Frontend

React application for Vivu Travel Agent.

## Tech Stack
- React 18
- React Router
- Axios
- Leaflet Maps
- Create React App

## Deployment on Vercel

### Prerequisites
1. Backend must be deployed first
2. Get backend URL

### Deploy Steps
1. Connect this repository to Vercel
2. Framework Preset: `Create React App`
3. Build Command: `npm run build`
4. Output Directory: `build`
5. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend-domain.vercel.app`
   - `REACT_APP_GOOGLE_CLIENT_ID` = `your_google_client_id`

## Local Development

```bash
npm install
npm start
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

App runs on http://localhost:3000
