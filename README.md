# Air Hockey - AI Game

A 2D Air Hockey game built with Phaser 3.

## Features
- **1 Player Mode**: Play against a CPU opponent.
- **2 Player Mode**: Local multiplayer (WASD vs Arrow Keys).
- **Campaign Mode**: Beat 3 stages with unique rules to win coins.
    - **Stage 1**: Standard.
    - **Stage 2**: Long Field (Wide).
    - **Stage 3**: Tall Field (Zoomed out).
- **Crazy Mode**: Press 'R' to remove field restrictions (for fun!).
- **Currency System**: Earn coins for scoring and winning stages.
- **Persistence**: Progress is saved automatically.

## How to Play Online (GitHub Pages)

You can host this game for free using **GitHub Pages**. Since this is a "No-Build" project (just HTML/JS), it's very easy.

### Step 1: Create a GitHub Repository
1.  Log in to [GitHub.com](https://github.com).
2.  Click the **+** icon in the top right and select **New repository**.
3.  Name it `air-hockey` (or whatever you like).
4.  Make it **Public** (Github Pages is free for public repos).
5.  Click **Create repository**.

### Step 2: Push your code
Open your terminal in this project folder and run:

```bash
git add .
git commit -m "Initial game upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/air-hockey.git
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username)*

### Step 3: Enable GitHub Pages
1.  Go to your repository settings on GitHub.
2.  Click **Pages** in the left sidebar.
3.  Under **Build and deployment** > **Branch**, select `main` and `/ (root)`.
4.  Click **Save**.

### Step 4: Share the Link
Wait a minute or two, and your game will be live at:
`https://YOUR_USERNAME.github.io/air-hockey/`

Send this link to your friends!
