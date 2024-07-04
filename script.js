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
        let html = await response.text();
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        let anchors = tempDiv.querySelectorAll('a');
        songs = [];
        anchors.forEach(anchor => {
            if (anchor.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(anchor.href.split(`/${folder}/`)[1]));
            }
        });

        // Display songs in playlist
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        songs.forEach(song => {
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
        });

        // Attach click event listeners to each song
        document.querySelectorAll('.song').forEach(song => {
            song.addEventListener('click', function () {
                playMusic(song.querySelector('.info div').textContent.trim());
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
                <h3 class="white normalFont">${decodeURIComponent(track)}</h3>
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
        let html = await response.text();
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        let anchors = tempDiv.querySelectorAll('a');
        let card = document.querySelector(".playList");
        for (const anchor of anchors) {
            if (anchor.href.includes(`/songs/`)) {
                let folder = anchor.href.split("/").slice(-2)[0];
                let infoResponse = await fetch(`songs/${folder}/info.json`);
                let infoData = await infoResponse.json();
                card.innerHTML += `<div data-folder="${folder}" class="card">
                                    <img class="playlistplay" src="img/svgs/playlistplay.svg">
                                    <img class="cover" src="/songs/${folder}/cover.jpeg">
                                    <div class="card-content">
                                        <div class="playlist-name">${infoData.title}</div>
                                        <div class="artist-names">${infoData.artist}</div>
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
        console.error('Error displaying albums:', error);
    }
}

async function main() {
    // Display all albums on the page
    await displayAlbum();

    // Get initial list of songs (example path provided)
    await getSongs("songs/arjit_singh/");
    playMusic(songs[0], true);

    // Attach event listeners
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/svgs/play.svg";
        }
    });

    // Timeupdate event listener
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".currtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".endtime").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;
        let per = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".circle").style.left = per;
        document.querySelector(".progress").style.width = per;
    });

    // Seekbar event listener
    seekBar.addEventListener("click", e => {
        let percent = (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".progress").style.width = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Previous button event listener
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1]);
        }
    });

    // Next button event listener
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Volume bar event listener
    document.querySelector(".volBar").addEventListener("click", (e) => {
        let val = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.volume = val;
        document.querySelector(".Volprogress").style.width = val * 100 + "%";
        volImg.src = val > 0 ? "img/svgs/volume.svg" : "img/svgs/mute.svg";
    });

    // Mute button event listener
    volImg.addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            document.querySelector(".Volprogress").style.width = 0 + "%";
            volImg.src = "img/svgs/mute.svg";
        } else {
            currentSong.volume = 0.5;
            document.querySelector(".Volprogress").style.width = 50 + "%";
            volImg.src = "img/svgs/volume.svg";
        }
    });

    // Download button event listener
    document.querySelector(".download").addEventListener('click', () => {
        const fileName = currentSong.src.split('/').pop();
        const fileUrl = `/${currFolder}/${fileName}`;

        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Reload page on home button click
    document.querySelector(".homeBtn").addEventListener('click', () => {
        location.reload();
    });

    // Open Spotify download link on install button click
    document.querySelector(".appInstall").addEventListener('click', () => {
        window.open('https://open.spotify.com/download', '_blank');
    });

    // Highlight clicked playlist
    document.querySelectorAll('.card').forEach(playlist => {
        playlist.addEventListener('click', function () {
            document.querySelectorAll('.card').forEach(pl => pl.classList.remove('highlight'));
            this.classList.add('highlight');
        });
    });
}

main();
