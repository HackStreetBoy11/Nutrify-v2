🚀 Live Deployment  

[Open Live App](https://nutrify-v2.vercel.app/track)

🧠 Overview

Nutrify is a live food tracking application built with **Next.js and TypeScript**.  
It helps users monitor their daily nutrient intake in real-time, fetches accurate nutritional data via APIs, and stores all user data securely in the cloud using **Convex**.  
The app features **Clerk authentication** for secure login and uses **ShadCN** for sleek, responsive UI components.  
It combines a modern frontend with a powerful backend for seamless tracking and personalized health insights.
# Nutrifiy 🥗

## Overview
Nutrifiy is a real-time nutrition tracking web application that helps users
analyze meals and receive personalized dietary insights. It integrates USDA
nutrition data and an AI model to generate intelligent meal recommendations.

---

## Features
- Secure user authentication using Clerk
- Real-time backend synchronization using Convex
- Nutrition data fetched from USDA API
- AI-powered personalized meal insights
- Responsive UI built with Next.js and Tailwind CSS

---

## Tech Stack
- Frontend: Next.js, Tailwind CSS
- Backend: Convex (BaaS)
- Authentication: Clerk
- APIs: USDA Nutrition API, OpenAI LLM
- Deployment: Vercel

---

## Architecture
1. User authenticates using Clerk.
2. User enters meal information.
3. Convex handles backend logic and real-time sync.
4. USDA API provides nutritional values.
5. OpenAI LLM generates meal insights.
6. Results are displayed instantly on the UI.

---

## Challenges & Learnings
- Implemented real-time data synchronization using Convex.
- Managed authentication flows with Clerk.
- Integrated third-party APIs efficiently.
- Learned prompt design for meaningful AI outputs.

---

## Getting Started
```bash
git clone https://github.com/your-username/nutrifiy.git
cd nutrify
npm install
npm run dev


🧰 Tech Stack
<div align="center">
<section aria-labelledby="techstack-heading" style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; padding:16px;">
  <h3 id="techstack-heading" style="margin-bottom:12px;">🧰 Tech Stack</h3>
  <div style="overflow-x:auto;">
    <table role="table" style="width:100%; border-collapse:collapse; min-width:600px;">
      <thead>
        <tr style="background:#0f172a; color:#fff;">
          <th scope="col" style="text-align:center; padding:12px 16px; font-weight:600; font-size:14px;">Frontend</th>
          <th scope="col" style="text-align:center; padding:12px 16px; font-weight:600; font-size:14px;">Backend</th>
          <th scope="col" style="text-align:center; padding:12px 16px; font-weight:600; font-size:14px;">Database</th>
          <th scope="col" style="text-align:center; padding:12px 16px; font-weight:600; font-size:14px;">Authentication</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#ffffff;">
          <td style="text-align:center; padding:18px 16px; border-bottom:1px solid #e6e9ef;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div style="font-size:28px;">⚛️</div>
              <div style="font-weight:700;">Next.js + TypeScript</div>
              <div style="font-size:13px; color:#555;">SSR · Client Components · Hooks</div>
            </div>
          </td>
          <td style="text-align:center; padding:18px 16px; border-bottom:1px solid #e6e9ef;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div style="font-size:28px;">🧠</div>
              <div style="font-weight:700;">Convex</div>
              <div style="font-size:13px; color:#555;">Realtime DB & Server Functions</div>
            </div>
          </td>
          <td style="text-align:center; padding:18px 16px; border-bottom:1px solid #e6e9ef;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div style="font-size:28px;">🍃</div>
              <div style="font-weight:700;">Convex Cloud DB</div>
              <div style="font-size:13px; color:#555;">NoSQL Database in Cloud</div>
            </div>
          </td>
          <td style="text-align:center; padding:18px 16px; border-bottom:1px solid #e6e9ef;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div style="font-size:28px;">🔑</div>
              <div style="font-weight:700;">Clerk</div>
              <div style="font-size:13px; color:#555;">Authentication & User Management</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
</div>

🖼️ Project Preview
<div align="center">
  <img src="https://github.com/HackStreetBoy11/Nutrify-v2/blob/master/public/Images/img2.png" alt="Screenshot 1" width="80%" />
  <br/><br/>
  <img src="https://github.com/HackStreetBoy11/Nutrify-v2/blob/master/public/Images/img3.png" alt="Screenshot 2" width="80%" />
  <br/>
</div>

🧩 Key Features

✅ Search and track food items with live nutrient data  
✅ Real-time API integration for accurate nutrition info  
✅ Cloud-based user data management with **Convex**  
✅ Secure login and authentication with **Clerk**  
✅ Sleek, responsive UI using **ShadCN**  

📬 Feedback

If you like this project, ⭐ it on GitHub and share your thoughts!  

