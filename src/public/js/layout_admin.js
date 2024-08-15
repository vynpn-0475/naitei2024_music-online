$(document).ready(function () {
  const $audioPlayer = $('#main-audio-player');
  const $playPauseBtn = $('#play-pause-btn');
  const $prevBtn = $('#prev-btn');
  const $nextBtn = $('#next-btn');
  const $progress = $('#progress');
  const $volume = $('#volume');
  const $currentTimeElem = $('#current-time');
  const $durationElem = $('#duration');

  let isPlaying = false;
  let currentSongIndex = 0;
  let firstSong;

  const $playlistSongs = $('.playlist-song');
  const $playlistDataElem = $('#playlist-data');
  let playlistData = null;

  if ($playlistDataElem.length) {
    const playlistDataAttr = $playlistDataElem.attr('playlist-datas');
    try {
      playlistData = JSON.parse(playlistDataAttr);
    } catch (error) {
      console.error('Failed to parse playlist data:', error);
    }
  }

  if (playlistData) {
    let idTmp = localStorage.getItem('playlistIdTmp');
    if (idTmp != playlistData.id) {
      idTmp = playlistData.id;
      localStorage.setItem('playlistIdTmp', idTmp);
      firstSong = $('#first-song').attr('data-song-url');
      if (firstSong) {
        updateAudioPlayer_a(firstSong);
      }
    }
  }

  function updateAudioPlayer_a(songUrl, index) {
    if (index > -1) {
      currentSongIndex = index;
    }
    $audioPlayer.attr('src', songUrl)[0].play();
    isPlaying = true;
    $playPauseBtn.text('Pause');
    savePlayerState();
  }

  function updateTime() {
    const currentTime = $audioPlayer[0].currentTime;
    const duration = $audioPlayer[0].duration;
    $currentTimeElem.text(formatTime(currentTime));
    $durationElem.text(` / ${formatTime(duration)}`);
    $progress.val((currentTime / duration) * 100);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function loadPlayerState() {
    const savedUrl = localStorage.getItem('audioUrl');
    const savedTime = localStorage.getItem('audioTime');
    const savedVolume = localStorage.getItem('audioVolume');
    const savedIsPlaying = localStorage.getItem('audioIsPlaying') === 'true';

    if (savedUrl) {
      $audioPlayer.attr('src', savedUrl);
      $audioPlayer[0].currentTime = savedTime ? parseFloat(savedTime) : 0;
      $audioPlayer[0].volume = savedVolume ? parseFloat(savedVolume) : 1;
      isPlaying = savedIsPlaying;
      if (isPlaying) {
        $audioPlayer[0].play();
        $playPauseBtn.text('Pause');
      } else {
        $playPauseBtn.text('Play');
      }
    }
  }

  function savePlayerState() {
    localStorage.setItem('audioUrl', $audioPlayer.attr('src'));
    localStorage.setItem('audioTime', $audioPlayer[0].currentTime);
    localStorage.setItem('audioVolume', $audioPlayer[0].volume);
    localStorage.setItem('audioIsPlaying', isPlaying);
  }

  window.updateAudioPlayer = function (url, index) {
    updateAudioPlayer_a(url, index);
  };

  $playPauseBtn.on('click', function () {
    if (isPlaying) {
      $audioPlayer[0].pause();
      $playPauseBtn.text('Play');
    } else {
      $audioPlayer[0].play();
      $playPauseBtn.text('Pause');
    }
    isPlaying = !isPlaying;
    savePlayerState();
  });

  $prevBtn.on('click', function () {
    if ($playlistSongs.length > 0) {
      currentSongIndex =
        (currentSongIndex - 1 + $playlistSongs.length) % $playlistSongs.length;
      const prevSongUrl = $playlistSongs
        .eq(currentSongIndex)
        .attr('data-song-url');
      updateAudioPlayer(prevSongUrl);
    }
  });

  $nextBtn.on('click', function () {
    if ($playlistSongs.length > 0) {
      currentSongIndex = (currentSongIndex + 1) % $playlistSongs.length;
      const nextSongUrl = $playlistSongs
        .eq(currentSongIndex)
        .attr('data-song-url');
      updateAudioPlayer(nextSongUrl);
    }
  });

  $progress.on('input', function () {
    const seekTime = ($progress.val() / 100) * $audioPlayer[0].duration;
    $audioPlayer[0].currentTime = seekTime;
    savePlayerState();
  });

  $volume.on('input', function () {
    $audioPlayer[0].volume = $volume.val();
    savePlayerState();
  });

  setInterval(savePlayerState, 1000);

  $audioPlayer.on('timeupdate', updateTime);

  $audioPlayer.on('ended', function () {
    if ($playlistSongs.length > 0) {
      currentSongIndex = (currentSongIndex + 1) % $playlistSongs.length;
      const nextSongUrl = $playlistSongs
        .eq(currentSongIndex)
        .attr('data-song-url');
      updateAudioPlayer(nextSongUrl);
    }
  });

  loadPlayerState();

  $('a[data-page]').on('click', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');

    $.get(url)
      .done(function (html) {
        const $newContent = $('<div>').html(html);
        const newMainContent = $newContent.find('.container').html();
        const $currentMainContent = $('.container');
        $currentMainContent.html(newMainContent);

        window.history.pushState({ path: url }, '', url);
      })
      .fail(function () {
        req.flash('error', req.t('error.errorLoadingPage'));
      });
  });

  $(window).on('popstate', function (e) {
    if (e.originalEvent.state && e.originalEvent.state.path) {
      $.get(e.originalEvent.state.path)
        .done(function (html) {
          const $newContent = $('<div>').html(html);
          const newMainContent = $newContent.find('.container').html();
          const $currentMainContent = $('.container');
          $currentMainContent.html(newMainContent);
        })
        .fail(function () {
          req.flash('error', req.t('error.errorLoadingPage'));
        });
    }
  });
});
