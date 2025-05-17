## FitCheck Architecture

This document outlines the system architecture for the FitCheck Chrome Extension.

![FitCheck Architecture Diagram](./highlevelcomponentdiagram.png)

## Description
The system architecture of FitCheck involves a user interacting through a React-based Chrome Extension and a hosted website (via Vercel). User data is sent through HTTPS to a Supabase backend, which handles authentication, data storage, and retrieval. The extension collects purchase data and browsing behaviors, which are used to generate product recommendations through a built-in Sentiment Analysis Model and LLM engine. These services analyze feedback and style preferences to provide smarter, more personalized suggestions in real-time.
