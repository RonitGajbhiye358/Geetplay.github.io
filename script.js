let play = document.querySelector(".play");
let next = document.querySelector(".next");
let previous = document.querySelector(".previous");
let seekBar = document.querySelector(".seekBar");
let volImg = document.querySelector(".volImg");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`/${folder}/`);
        let text = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "text/html");
        let as = doc.querySelectorAll("a");
        songs = [];
        for (const element of as) {
            if (element.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1].replace(/\+/g, ' ')));
            }
        }

        // Update playlist UI
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `<li class="song">
                <img width="40" class="invert" src="img/svgs/music.svg" alt="">
                <div class="info greyFontColor">
                    <div>${decodeURIComponent(song.replace(/\+/g, ' '))}</div>
                    <div>Divine, BadboyRonit, Dk....</div>
                </div>
                <div class="playnow greyFontColor">
                    <span class="normalFont">Play Now</span>
                    <img src="img/svgs/play.svg" alt="">
                </div>
            </li>`;
        }

        // Attach click event listener to each song
        document.querySelectorAll('.song').forEach(song => {
            song.addEventListener('click', function () {
                playMusic(song.querySelector(".info div").textContent.trim());
            });
        });

        // Highlight the first song by default
        if (songs.length > 0) {
            document.querySelector('.song').classList.add('song-highlight');
        }

        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/svgs/pause.svg";
        document.querySelector(".currSongInfo").innerHTML = `<video autoplay loop class="border" src="videoplayback.mp4" width="60px" height="60px" alt="MusicVideo"></video>
            <div class="songInfo normalFont">
                <h3 class="white normalFont">${decodeURIComponent(track.replace(/\+/g, ' '))}</h3>
                <h5 class="greyFontColor normalFont">Ronit...</h5>
            </div>`;
    } else {
        document.querySelector(".currtime").innerHTML = "00:00";
        document.querySelector(".endtime").innerHTML = "00:00";
    }
};

async function displayAlbum() {
    try {
        let response = await fetch(`songs/`);
        let text = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "text/html");
        let anchors = doc.querySelectorAll("a");
        let card = document.querySelector(".playList");
        for (const e of anchors) {
            if (e.href.includes(`/songs/`)) {
                let folder = e.href.split("/").slice(-2)[0];
                let response = await fetch(`songs/${folder}/info.json`);
                let data = await response.json();
                card.innerHTML += `<div data-folder="${folder}" class="card">
                    <img class="playlistplay" src="img/svgs/playlistplay.svg">
                    <img class="cover" src="songs/${folder}/cover.jpeg">
                    <div class="card-content">
                        <div class="playlist-name">${data.title}</div>
                        <div class="artist-names">${data.artist}</div>
                    </div>
                </div>`;
                // Load songs when card is clicked
                document.querySelectorAll(".card").forEach(card => {
                    card.addEventListener("click", async () => {
                        songs = await getSongs(`songs/${card.dataset.folder}`);
                        playMusic(songs[0]);
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error displaying album:', error);
    }
}

async function main() {
    await displayAlbum(); // Display albums on the page
    await getSongs("songs/arjit_singh/"); // Load initial songs
    playMusic(songs[0], true); // Play the first song

    // Event listeners
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/svgs/play.svg";
        }
    });

    // Time update listener
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".currtime").innerHTML = secondsToMinutesSeconds(currentSong.currentTime);
        document.querySelector(".endtime").innerHTML = secondsToMinutesSeconds(currentSong.duration);
        let per = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".circle").style.left = per;
        document.querySelector(".progress").style.width = per;
    });

    // Previous and next buttons
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[index]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Seek bar listener
    seekBar.addEventListener("click", e => {
        let percent = (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".progress").style.width = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Volume control
    document.querySelector(".volBar").addEventListener("click", e => {
        let val = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.volume = val;
        document.querySelector(".Volprogress").style.width = val * 100 + "%";
        if (currentSong.volume > 0) {
            volImg.src = "img/svgs/volume.svg";
        }
    });

    volImg.addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            volImg.src = "img/svgs/mute.svg";
            document.querySelector(".Volprogress").style.width = 0 + "%";
        } else {
            currentSong.volume = 0.5;
            volImg.src = "img/svgs/volume.svg";
            document.querySelector(".Volprogress").style.width = 50 + "%";
        }
    });

    // Download button
    document.querySelector(".download").addEventListener('click', () => {
        const fileName = currentSong.src.split('/').pop();
        const fileUrl = `/songs/${currFolder}/${fileName}`;
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Reload button
    document.querySelector(".homeBtn").addEventListener('click', () => {
        location.reload();
    });

    // Install button
    document.querySelector(".appInstall").addEventListener('click', () => {
        window.open('https://open.spotify.com/download', '_blank');
    });

    // Playlist highlighting
    document.querySelectorAll('.card').forEach(playlist => {
        playlist.addEventListener('click', function () {
            document.querySelectorAll('.card').forEach(pl => pl.classList.remove('highlight'));
            this.classList.add('highlight');
        });
    });
}

main(); // Initialize the main function
