const TOTAL_PIECES = 20;
const LIVE_HLS_URL = "https://live5.brownrice.com:444/polarbear2/polarbear2.stream/main_playlist.m3u8";

let progress = JSON.parse(localStorage.getItem('virtualPuzzleProgress')) || {
    unlockedPieces: [],
    scannedQRs: [],
    completed: false
};

const puzzleGrid = document.getElementById('puzzle-grid');
const progressCounter = document.getElementById('progress');
const overlay = document.getElementById('overlay');
const revealBtn = document.getElementById('reveal-video');
const finalVideo = document.getElementById('final-video');
const habitatInfo = document.getElementById('habitat-info');
const resetBtn = document.getElementById('reset-btn');

/* Create puzzle pieces */
for(let i=0; i<TOTAL_PIECES; i++){
    const div = document.createElement('div');
    div.classList.add('puzzle-piece');
    div.id = `piece-${i}`;
    div.style.backgroundImage = `url('pieces/piece-${i}.jpg')`;
    puzzleGrid.appendChild(div);
}

function updateProgress(){
    progressCounter.textContent =
        `${progress.unlockedPieces.length} / ${TOTAL_PIECES} pieces unlocked`;
}

function revealRandomPiece(){
    let remaining = [];

    for(let i=0;i<TOTAL_PIECES;i++){
        if(!progress.unlockedPieces.includes(i)){
            remaining.push(i);
        }
    }

    if(remaining.length === 0) return;

    let randomIndex = remaining[Math.floor(Math.random() * remaining.length)];
    document.getElementById(`piece-${randomIndex}`).style.opacity = 0;

    progress.unlockedPieces.push(randomIndex);
    saveProgress();

    if(progress.unlockedPieces.length === TOTAL_PIECES){
        progress.completed = true;
        saveProgress();
        overlay.classList.remove('hidden');
    }
}

function saveProgress(){
    localStorage.setItem('virtualPuzzleProgress', JSON.stringify(progress));
    updateProgress();
}

function playFinalVideo() {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(LIVE_HLS_URL);
        hls.attachMedia(finalVideo);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            finalVideo.play();
        });
    } else if (finalVideo.canPlayType('application/vnd.apple.mpegurl')) {
        finalVideo.src = LIVE_HLS_URL;
        finalVideo.play();
    }

    finalVideo.classList.remove('hidden');
    habitatInfo.classList.remove('hidden');
}

revealBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    playFinalVideo();
});

/* Reset button */
resetBtn.addEventListener('click', () => {
    localStorage.removeItem('virtualPuzzleProgress');
    location.reload();
});

/* Restore progress */
window.addEventListener('load', () => {

    progress.unlockedPieces.forEach(i => {
        document.getElementById(`piece-${i}`).style.opacity = 0;
    });

    updateProgress();

    if(progress.completed){
        overlay.classList.remove('hidden');
    }

    const params = new URLSearchParams(window.location.search);
    const q = parseInt(params.get('q'));

    if(q >= 1 && q <= TOTAL_PIECES){

        // ✅ NEW: prevent same QR from triggering twice
        if(!progress.scannedQRs.includes(q)){

            progress.scannedQRs.push(q);
            revealRandomPiece();
            saveProgress();
        }
    }
});
