// We add "async" here because talking to the internet takes a tiny bit of time
async function calculateSlacking() {
    const deadline = document.getElementById('deadline').value;
    const taskTime = document.getElementById('taskTime').value;
    const rawShowName = document.getElementById('showName').value;
    const resultDiv = document.getElementById('result');
    

    // Make sure they entered everything
    if (!deadline || !taskTime || !rawShowName.trim()) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "We need data!";
        resultDiv.style.backgroundColor = "#ffb3b3";
        return;
    }

    // Show a loading message while we wait for the internet
    resultDiv.style.display = "block";
    resultDiv.innerText = "Searching the web for " + rawShowName + "... 🔍";
    resultDiv.style.backgroundColor = "#fff3cd"; 
    resultDiv.style.color = "black";

    try {
        const response = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(rawShowName)}`);

        if (!response.ok) {
            throw new Error("Show not found");
        }

        const data = await response.json();
        let episodeLength = data.averageRuntime || data.runtime || 30; 
        let showDisplayName = data.name;

        const freeHours = deadline - taskTime;
        const episodes = Math.floor((freeHours * 60) / episodeLength); 

        // THE SCENARIOS
        if (freeHours < 0) {
            new Audio('https://www.myinstants.com/media/sounds/spongebob-fail.mp3').play();
            resultDiv.innerText = "You are cooked! Let's procrastinate some more, shall we?";
            resultDiv.style.backgroundColor = "#ff4d4d";
            resultDiv.style.color = "white";

        } else if (freeHours === 0) {
            new Audio('https://www.myinstants.com/media/sounds/vine-boom.mp3').play();
            resultDiv.innerText = "Absolutely no time left, great job procrastinator! You should make this your profession";
            resultDiv.style.backgroundColor = "#ffa64d";
            resultDiv.style.color = "black";

        } else {
            new Audio('https://www.myinstants.com/media/sounds/hallelujah.mp3').play();
            
            // Fire the classic party streamers!
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
            });

            resultDiv.innerText = "Good news! You have enough time to watch exactly " + episodes + " episodes of " + showDisplayName + " (based on " + episodeLength + " mins/episode) before you absolutely need to lock in!";
            resultDiv.style.backgroundColor = "#adebad";
            resultDiv.style.color = "black";
        }

    } catch (error) {
        new Audio('https://www.myinstants.com/media/sounds/faahhhhhhhh.mp3').play();
        resultDiv.innerText = "Couldn't find that show! Did you spell it right? 😅";
        resultDiv.style.backgroundColor = "#ffb3b3";
        resultDiv.style.color = "black";
    }
}