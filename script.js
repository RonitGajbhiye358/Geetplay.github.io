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
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.querySelectorAll("a");
    songs = [];
    for (const element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li class= "song"><img width="40" class="invert" src="img/svgs/music.svg" alt="">
                                <div class="info greyFontColor">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Divine, BadboyRonit, Dk....</div>
                                </div>
                                <div class="playnow greyFontColor">
                                    <span class="normalFont">Play Now</span>
                                    <img src="img/svgs/play.svg" alt="">
                                </div></li>`;
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    // Attach click event listener to all songs for highlighting
    document.querySelectorAll('.song').forEach(song => {
        song.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent the playlist click event from firing
            // Remove highlight from all songs
            document.querySelectorAll('.song').forEach(s => s.classList.remove('song-highlight'));
            // Highlight the clicked song
            this.classList.add('song-highlight');
        });
    });
    // Highlight the first song by default
    if (songs.length > 0) {
        let firstSongElement = document.querySelector('.song');
        firstSongElement.classList.add('song-highlight');
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/svgs/pause.svg";
        document.querySelector(".currSongInfo").innerHTML = `<video autoplay loop class="border" src="videoplayback.mp4" width="60px" height="60px" alt="MusicVideo"></video>
            <div class="songInfo normalFont">
                <h3 class="white normalFont ">${track.replaceAll("%20", " ")}</h3>
                <h5 class="greyFontColor normalFont">Ronit...</h5>
            </div>`;
    } else {
        // document.querySelector(".songinfo").innerHTML = decodeURI(track)
        document.querySelector(".currtime").innerHTML = "00:00";
        document.querySelector(".endtime").innerHTML = "00:00";
    }
};

async function displayAlbum() {
    console.log("displaying album");
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.querySelectorAll("a");
    let card = document.querySelector(".playList");
    for (const e of anchors) {
        if (e.href.includes(`/songs`)) {
            let folder = e.href.split("/").slice(-2)[0];
            // Metadata about the folder
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            // Update card
            card.innerHTML += `<div data-folder="${folder}" class="card">
            <img class="playlistplay" src="img/svgs/playlistplay.svg">
            <img class="cover" src="/songs/${folder}/cover.jpeg">
            <div class="card-content ">
                <div class="playlist-name">${response.title}</div>
                <div class="artist-names">${response.artist}</div>
            </div>
            </div>`;
            // Load songs
            // Load the playlist whenever card is clicked
            document.querySelectorAll(".card").forEach(e => {
                e.addEventListener("click", async item => {
                    console.log("Fetching Songs");
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                    playMusic(songs[0]);
                });
            });
        }
    }
}

async function main() {
    // Display all the albums on the page
    await displayAlbum();

    // Get the list of all the songs
    await getSongs("songs/arjit_singh/");
    playMusic(songs[0], true);

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/svgs/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".currtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".endtime").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`;
        let per = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".circle").style.left = per;
        document.querySelector(".progress").style.width = per;
    });

    // Add an event listener to seekbar
    seekBar.addEventListener("click", e => {
        let percent = (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".progress").style.width = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    //**********************************************************************************************************************************/
    // Add an event listener for hamburger
    let originalContent = document.querySelector(".left").innerHTML; // Store the original content
    let isCrossClicked = false;

    // Function to restore original content
    function restoreOriginalContent() {
        document.querySelector(".left").innerHTML = originalContent;
        document.querySelector(".left").style.width = "22vw";
        isCrossClicked = false;
        attachEventListeners(); // Reattach event listeners
    }

    // Function to attach event listeners
    function attachEventListeners() {
        // Attach event listener for the cross button
        const closeBtn = document.querySelector(".close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                console.log("cross button clicked");
                document.querySelector(".left").innerHTML = `<div class="home_container greyBackground border bolder">
                    <div class="homeBtn greyFontColor"><img src="img/svgs/home.svg" alt="Home" title="Home" /></div>
                    <div class="searchBtn greyFontColor"><img src="img/svgs/search.svg" alt="Search" title="Search" /></div>
                </div>
                <div class="library_container greyBackground border">
                    <div class="libraryBtn greyFontColor bolder"><img src="img/svgs/librarybtn.svg" alt="playlist"></div>
                </div>`;
                document.querySelector(".left").style.width = "auto";
                isCrossClicked = true;
                attachEventListeners(); // Reattach event listeners for the new content
            });
        }

        // Attach event listener for the library button
        const libraryBtn = document.querySelector(".libraryBtn");
        if (libraryBtn) {
            libraryBtn.addEventListener("click", () => {
                console.log("library button clicked");
                if (isCrossClicked) {
                    restoreOriginalContent();
                }
            });
        }
    }

    // Attach initial event listeners
    attachEventListeners();
    //**********************************************************************************************************************************/

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[index]);
        }
    });

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Add event listener for volume bar
    document.querySelector(".volBar").addEventListener("click", (e) => {
        let val = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.volume = val;
        document.querySelector(".Volprogress").style.width = val * 100 + "%";
        if (currentSong.volume > 0) {
            volImg.src = volImg.src.replace("mute.svg", "volume.svg");
        }
    });

    // Add event listener to mute the track
    volImg.addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.currentTarget.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".Volprogress").style.width = 0 + "%";
        } else {
            e.target.src = e.currentTarget.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.50;
            document.querySelector(".Volprogress").style.width = 50 + "%";
        }
    });
    document.querySelector(".Volprogress").style.width = 50 + "%";

    // Add event listener for download
    document.querySelector(".download").addEventListener('click', () => {
        // Get the file name and extension
        const fileName = currentSong.src.split('/').pop(); // Change this to the actual file name
        // Generate the file URL based on the file name and extension
        const fileUrl = `/songs/${currFolder}/${fileName}`; // Assuming the files are in the 'files' folder

        // Create a temporary <a> element for downloading
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;

        // Append the <a> element to the document body
        document.body.appendChild(a);

        // Trigger the click event on the <a> element to initiate the download
        a.click();

        // Remove the <a> element from the document body
        document.body.removeChild(a);
    });

    document.querySelector(".homeBtn").addEventListener('click', () => {
        // Reload the page
        location.reload();
    });

    // Add click event listener to the install button
    document.querySelector(".appInstall").addEventListener('click', function () {
        // Redirect to the Spotify download URL
        window.open('https://open.spotify.com/download', '_blank');
    });

    // Add click event listener to all playlists
    document.querySelectorAll('.card').forEach(playlist => {
        playlist.addEventListener('click', function () {
            // Remove highlight from all playlists
            document.querySelectorAll('.card').forEach(pl => pl.classList.remove('highlight'));
            // Highlight the clicked playlist
            this.classList.add('highlight');
        });
    });
}
main();
