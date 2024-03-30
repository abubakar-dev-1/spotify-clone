let currentSong = new Audio();
let songs
let currFolder
let prev = document.getElementById("previous");
let play = document.getElementById("play");
let next = document.getElementById("next");

function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60); 


  let formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  let formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return formattedMinutes + ":" + formattedSeconds;
}

async function getSongs(folder) {
  try {
    currFolder = folder
    let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    let html = await response.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    const links = div.querySelectorAll("a");
    songs = [];

    links.forEach((link) => {
      if (link.href.endsWith(".mp3")) {
        songs.push(link.href.split(`/${folder}/`)[1]);
      }
    });

    let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
        <img src="aessets/music.svg" alt="">
        <div class="info">
          <span>${song.replaceAll(/%20|%E2%80%99/g, " ")}</span>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img src="aessets/playbtn.svg" alt="">
        </div>
      </li>`;
  }

  let songListItems = document.querySelectorAll(".songList li");
  let arr = Array.from(songListItems);
  arr.forEach((e) => {
    e.addEventListener("click", (element) => {
      palyMusic(e.querySelector(".info").firstElementChild.innerHTML.trim(),true);
    });
  });
  return songs
   
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return [];
  }
}

function palyMusic(audio , pause = false) {
  currentSong.src = `/${currFolder}/` + audio;
  if(pause!=false)
  {
    play.src = "aessets/pause.svg";
    currentSong.play();
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(audio);
  document.querySelector(".songTime").innerHTML = "00:00/00:00";
}

async function albumsDisplay()
{
    let response = await fetch('http://127.0.0.1:5500/songs/');
    let html = await response.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let container = document.querySelector(".allCards")
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if(e.href.includes("/songs/")){
        let folderName = (e.href.split("/").slice(-1)[0])
        let data = await fetch(`http://127.0.0.1:5500/songs/${folderName}/info.json`)
        let jason = await data.json()
        console.log(jason)
        container.innerHTML = container.innerHTML + `<div data-folder= ${folderName} class="card">
        <div class="playButton">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
              stroke="#000000"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
          
        </div>
        <img
          src="/songs/${folderName}/cover.jpg"
          alt=""
        />
        <h3>${jason.title}</h3>
        <p>${jason.description}</p>
      </div>`
      }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
      e.addEventListener("click" , async element=>{
        songs = await getSongs(`songs/${element.currentTarget.dataset.folder}`);
        document.querySelector(".leftsection").style.left = "0px"
      })
    })

} 


async function main() {
  songs = await getSongs("songs/satinder");
  palyMusic(songs[0] , false )

  albumsDisplay()

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "aessets/pause.svg";
    } else {
      currentSong.pause();
      play.src = "aessets/playbtn.svg";
    }
  });
  
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currentSong.currentTime
      )}/${formatTime(currentSong.duration)}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%"
    });
    document.querySelector(".seekBar").addEventListener("click" , e=>{
      let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
      document.querySelector(".circle").style.left = percent + "%"
      currentSong.currentTime = ((currentSong.duration)*percent)/100
    })

    document.getElementById("hamBurger").addEventListener("click" , ()=>{
      document.querySelector(".leftsection").style.left = 0
    })

    document.getElementById("cross").addEventListener("click" , ()=>{
      document.querySelector(".leftsection").style.left = "-380px"
    })

    document.querySelector(".vol").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
      currentSong.volume = parseInt(e.target.value)/100
    })

    previous.addEventListener("click", () => {
      if (songs && songs.length > 0) {
          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
          if (index - 1 >= 0) {
              palyMusic(songs[index - 1], true);
          }
      } else {
          console.error("Songs array is not properly initialized or is empty.");
      }
  });
  
  next.addEventListener("click", () => {
      if (songs && songs.length > 0) {
          let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
          if (index + 1 < songs.length) {
              palyMusic(songs[index + 1], true);
          }
      } else {
          console.error("Songs array is not properly initialized or is empty.");
      }
  });

  document.getElementById("volume").addEventListener("click",(e)=>{
    if(e.target.src.includes("aessets/volume.svg")){
      currentSong.volume = 0
      e.target.src=e.target.src.replace("aessets/volume.svg", "aessets/mute.svg")
    }
    else{
      e.target.src=e.target.src.replace("aessets/mute.svg" , "aessets/volume.svg")
      currentSong.volume =.50
    }
  })
  }
  
main();
