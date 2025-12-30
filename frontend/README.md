# Fraud Detection Frontend

Next.js frontend for the fraud detection API.

## Setup Instructions

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Important: Backend Must Be Running

Make sure your FastAPI backend is running before using the frontend:

```bash
# In the project root
cd src
uvicorn app:app --reload
```

Backend should be available at: `http://127.0.0.1:8000`

## Usage

1. Enter transaction features as comma-separated numbers
2. Click "Check for Fraud"
3. View the prediction result and fraud probability

## API Connection

The frontend connects to the FastAPI backend at `http://127.0.0.1:8000/predict` using the native `fetch` API.

### Request Format:
```json
{
  "features": [1.5, 2.3, 0.8, 4.2, ...]
}
```

### Response Format:
```json
{
  "fraud_probability": 0.75,
  "prediction": "Fraud"
}
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Native Fetch API
