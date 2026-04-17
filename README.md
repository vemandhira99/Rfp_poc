# 🏛️ Enterprise RFP AI Pipeline

An AI-powered RFP (Request for Proposal) processing pipeline designed to automate document analysis, extract structured intelligence, and support enterprise bid decision workflows.

---

## 🧠 System Overview

This system is a full-stack AI-powered platform that enables organizations to ingest large RFP documents, analyze them using Gemini AI, and generate structured outputs such as summaries, compliance matrices, and bidding insights.

The system is built as a **Proof of Concept (POC)** under the guidance of senior leadership, focusing on **accuracy, performance, and usability in real-world enterprise workflows**.

---

## ⚙️ Backend Stack

**Core Framework**:
FastAPI (Python) – Provides high-performance asynchronous APIs for handling file uploads, AI processing, and dashboard services.

**Database (ORM)**:
SQLAlchemy + PostgreSQL – Manages RFP records, extracted metadata, compliance requirements, users, and audit logs.

**AI Engine**:
Google GenAI (Gemini 2.5 Flash) – Handles full-document reasoning, summary extraction, structured outputs, and chat-based interactions.

**File Management (Key Design Choice)**:
Google GenAI File API – Instead of using vector databases, the entire PDF is uploaded and referenced using a unique `file_uri`.

This approach:

* Eliminates chunking and embeddings
* Preserves document structure (tables, layout, formatting)
* Enables full-context reasoning across the entire RFP

---

## 🔄 Integrated Workflow

```mermaid
graph TD
    A[RFP PDF Upload] --> B[FastAPI Backend]
    B --> C[Google File API Ingestion]
    C --> D[Store gemini_file_uri in DB]
    D --> E[Full-Context AI Analysis]
    E --> F[Populate summary_json + Metadata]
    F --> G[CEO Review Dashboard]
    G --> H[Interactive SA Chatbot]
    H --> I[AI Compliance Matrix Extraction]
```

---

## 🔍 Workflow Breakdown

### Step 1: Ingestion (Native File Handling)

* User uploads an RFP PDF
* Backend uploads file to Google File API
* System stores `file_uri` in database
* AI can now access the document in its original format

---

### Step 2: Automated Analysis (Caching Layer)

* AI processes the document once using full context
* Extracted fields:

  * Estimated value (₹)
  * Effort
  * Risks
  * Executive summary

**Optimization**:

* Results are cached in `summary_json`
* Prevents repeated AI calls
* Enables near-instant dashboard loading

---

### Step 3: Architect Interaction (AI Chat Modes)

When interacting with AI, two modes are supported:

**RFP-Only Mode**

* Strictly uses document content
* Ensures compliance accuracy

**Hybrid Mode**

* Combines RFP content with general industry knowledge
* Useful for solution suggestions and best practices

---

### Step 4: Compliance Matrix Extraction

* AI extracts all requirements in structured JSON format
* Data is stored in database for tracking

Supports:

* Compliant
* Partial
* Non-Compliant

Enables full lifecycle compliance management

---

### Step 5: Dashboard Metrics

* Backend aggregates metadata in real-time
* Calculates:

  * Total pipeline value
  * Risk distribution
  * RFP status

All metrics are derived from stored structured data

---

## 📈 Performance Considerations

* **Asynchronous Processing**: All I/O operations are non-blocking
* **Caching Strategy**: AI outputs stored in DB to avoid recomputation
* **Background Tasks**: AI processing runs outside request lifecycle
* **Reduced Latency**: Dashboard reads precomputed values instead of recalculating

---

## 🧠 Data Handling Approach

* Structured outputs enforced via JSON
* Relational storage using SQLAlchemy models
* Separation of:

  * Raw document reference (`file_uri`)
  * Extracted intelligence (`summary_json`)
  * Compliance records

---

## 🎨 Frontend Stack

**Core Framework**:
Next.js 14 (React) – Uses App Router for efficient rendering and navigation

**Styling**:
Tailwind CSS – Custom design system with responsive layouts and clean UI

**Visualization**:
Recharts + Framer Motion – Used for charts, metrics, and UI interactions

**API Client Layer**:
`api.ts` – Centralized layer for:

* API calls
* Error handling
* Polling ingestion status

---

## 💻 Key Frontend Features

* **Executive Dashboard**
  Displays pipeline value, risk insights, and RFP distribution

* **Architect Workspace**
  AI chat interface for querying RFP and generating responses

* **Processing Status Tracking**
  Shows ingestion → analysis → completion stages

* **Error Handling**
  Displays API issues (e.g., rate limits) while preserving cached data

---

## 🔗 Frontend–Backend Integration

* Frontend communicates via REST APIs
* Backend exposes endpoints for:

  * Upload
  * Summary
  * Chat
  * Compliance data

**Flow**:
Frontend → FastAPI → Gemini → Database → Response → UI

* Polling mechanism tracks background processing
* Cached responses ensure fast UI updates

---

## 🔐 Environment Variables

Create a `.env` file inside backend:

```
GEMINI_API_KEY=your_api_key
DATABASE_URL=postgresql://user:password@localhost/db_name
PORT=8000
```

---

## 📦 Installation & Setup

### Backend

```bash
cd rfp-backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd rfp-frontend
npm install
npm run dev
```

---

## 📄 Notes

* This is a **POC implementation**
* Designed to validate:

  * Full-context AI reasoning
  * File-based ingestion approach
  * Structured data extraction workflows
* Not optimized yet for production-scale deployment

---

## ⚔️ Key Design Decisions

- Chose File API over vector DB to preserve full document context
- Introduced caching layer (`summary_json`) to eliminate repeated AI calls
- Used async FastAPI to handle large file ingestion efficiently
- Structured outputs enforced via JSON for reliable downstream usage

  ---
  
## 👨‍💻 Credits

**Built by Veman Chippa**
Under the guidance of **Yash Kanvinde**
