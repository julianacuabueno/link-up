# Link-Up! 🔗
Welcome to Link-Up! You know that satisfying feeling when the plans finally make it out of the group chat? This shared calendar application helps friends group by coordinating hangouts easily

`insert image here`

---
Imagine you are a student who just finished their fall semester of college (thank god!) and have met some classmates that you'd like to hang out with after the semester ends. During class and in group chats, you all share ideas seen from social media that you'd be interested in doing together. However, these plans never seen the light of day and stay in the depths, forgotten in the group chat. What could possibly be the issue?
Is it the lack of planning? Are people not able to agree on the same thing? Too many different platforms to keep track of? Look no further! Link-Up is designed for friends to ensure created plans make it out of the group chat and reduce the common hassle.

---

## Table of Contents:
- [Tech Stack](https://github.com/julianacuabueno/link-up/edit/main/README.md#tech-stack)
- [Features](https://github.com/julianacuabueno/link-up/edit/main/README.md#features)
- [Challenges](https://github.com/julianacuabueno/link-up/edit/main/README.md#challenges)
- [Deployment](https://github.com/julianacuabueno/link-up/edit/phase-6/README.md#deployment)

### Tech Stack:
- **Frontend:** React, HTML, CSS
- **Backend:** Node.js/Express, DynamoDB
- **APIs:** Yelp, Google Calendar, Ticketmaster Discovery
- **Deployment:** AWS

### Features:
1. Sign up by creating an account
2. Sync Google Calendar with your Gmail account
3. Browse for local events from Ticketmaster
4. View places based on desired location from Yelp
5. Create event based on selected event or place
6. Event is shared with all attendees and reflects on the individuals' synced Google Calendar

### Challenges:
- Planning
    - Each of us had little to no experience building a web application using React and Node.js
    - No designated roles, especially no project manager to delegate tasks
- Research
    - definitely should've done more research after what we learned in class to understand how that benefits our project
- Expectations
    - our project idea seemed more feasible 

### Deployment:
Running locally 

```
##must need
Node.js v22.19.0
npm

cd link-up/frontend
npm install
npm run dev

cd ../backend
npm install
npm start
```

Running on AWS

Live app: 

