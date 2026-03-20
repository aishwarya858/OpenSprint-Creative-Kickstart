# ProcrasTech: The Procrastination Calculator

**ProcrasTech** is a funny web application designed to mathematically optimize slacking off. It answers the ultimate question for students: "Exactly how many episodes of my favorite show can I binge before I completely ruin my timeline?" 

Instead of fighting the exhaustion after a long day of classes, **ProcrasTech** leans into it by calculating the exact window of free time you have left down to the final minute.

---

## Core Features

1. **Live Media Syncing:** Integrates with the free **TVmaze API** to pull real-time, accurate episode runtimes. Unlike basic calculators, it handles fractional logic—if you have 50 minutes free for a 40-minute show, it tells you exactly how many minutes of the next episode you can squeeze in.

2. **Smart Auto-Fill Engine:** Built-in keyword detection to speed up your "Side Quest" entries. 
   - Typing **'Assignment'** defaults to **2.0 hrs**.
   - Typing **'PPT'** or **'Presentation'** defaults to **1.5 hrs**.
   - Typing **'Homework'** defaults to **1.0 hr**.

3. **Dynamic Chaos Engine:**
   - **Success State:** Plays a heavenly choir while launching a responsive **Canvas-Confetti** streamer celebration.
   - **Zero-Hour State:** Triggers a **Vine Boom** sound to let you know you are living on the absolute edge.
   - **Negative-Hour State:** Alerts the user that they are completely cooked via the classic **SpongeBob Fail** sound and a **3-Blink Red Strobe** visual alert.

---

## Tech Stack

1. **HTML:** The structural foundation and Neo-Brutalist layout. **(THE STRUCTURE)**
2. **CSS:** Custom animations (Floating Emojis/Strobe), Tailwind utility classes, and Outfit/Jakarta typography. **(THE DESIGN)**
3. **JavaScript:** API fetching, LocalStorage persistence, and Audio object instantiations. **(THE BEHAVIOUR)**

---

## How to Run Locally

1. Clone or download this repository to your local machine.
2. Ensure all three files (`index.html`, `style.css`, `script.js`) are in the same folder.
3. Double-click `index.html` to open it in your default web browser.
4. Input your deadline, add your tasks (or use the auto-fill keywords), and search for your target show.
5. Enjoy your (calculated) free time!

---

*Note: This project is for educational (and recreational) purposes. Please actually finish your assignments.*
