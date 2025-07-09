# **App Name**: Call Center Stats Streamer

## Core Features:

- Data Ingestion: Receives streaming data from a PBX (Private Branch Exchange) about call center activity via a webhook.
- Data Transformation: Transforms the received data into a structured format, parsing the different fields (date, time, queue time, agent, status, etc.)
- Call Log View: Allows filtering and viewing the ingested call data for the current day.
- Real-time Metrics Dashboard: Provides aggregate statistics of call center performance, such as total calls, average queue time, service level (percentage of calls answered within a specified time).
- AI-Powered Summaries: Generates a summary of key call center metrics and insights using a large language model, providing a daily executive summary.
- Status details viewer: Allows filtering and viewing the most common `status_detail` from all the calls to extract relevant data in real-time
- Anomaly detection: Uses an AI tool to identify patterns or anomalies in the call data, such as sudden spikes in abandoned calls or long queue times.

## Style Guidelines:

- Primary color: Soft blue (#77B5FE) to convey a sense of calmness, trustworthiness, and efficiency.
- Background color: Light gray (#F0F4F8), very slightly tinted with blue. Provides a clean, neutral backdrop that prevents eye strain during prolonged use.
- Accent color: Muted violet (#B19CD9) to highlight key performance indicators (KPIs) and actionable insights. It adds a touch of sophistication.
- Body and headline font: 'Inter' (sans-serif), provides a clear, modern, and highly readable typeface.
- Use a set of crisp, modern icons. For statistics, prefer simple bar and line charts. To communicate status or priority, consider color-coded dot indicators (green, yellow, red).
- Prioritize essential call center metrics at the top, and ensure the anomaly detection and executive summary sections stand out distinctly on the page.
- Use subtle animations for loading states or transitions between data views to enhance user engagement.