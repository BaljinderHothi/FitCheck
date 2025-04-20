# Fit Check Archetecture

![Fit Check Architecture](./image.png)


Fit Check is built around two main components: a website (hosted on Vercel) and a Chrome extension, both connected to a Supabase backend.
Users sign up on the website and complete a style survey. That data is stored in Supabase and used by the Chrome extension (only available if the user is logged in) to:

- Evaluate if a product fits their preferences,
- Prompt for reviews after purchases,
- Pass reviews into a Sentiment Analysis Model, which feeds into an LLM Engine connected to a product/shop database for smart recommendations.

All user data and review history are stored in Supabase, keeping everything in sync and personalized.

### Entity Diagram – User Review & Sentiment Feature

![Entity Diagram](./architecture/entity-diagram.png)

This diagram models the relationship between users, the products they review, and the sentiments analyzed from those reviews. Each product review is tied to a user and contains a star rating and text. That text is sent to a sentiment model, and the resulting label and score are stored in the sentiment table along with the original review and a reference to the user. This structure allows for tracking user preferences and improving future recommendations.