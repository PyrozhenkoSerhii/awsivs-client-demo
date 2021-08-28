'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const video = document.querySelector('video');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const startControls = document.getElementById('start-controls');
  const endControls = document.getElementById('end-controls');
  const constraints = {
    audio: true,
    video: {
      width: 640,
      height: 480,
    },
  };
  let websocket = null;
  let mediaRecorder = null;
  let streamKey = '';
  const wsUrl = 'wss://awsivs.codeda.com/f54b0d72-f0f2-4c9f-b910-781d1b6379e0';

  const initCamera = async (constraints, videoEl) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=h264',
        bitsPerSecond: 256 * 8 * 1024
      });

      return mediaRecorder;
    } catch (err) {
      throw err;
    }
  };

  const connect = (url, streamKey) => {
    const ws = new WebSocket(url, ['streamKey', streamKey]);

    ws.onopen = (event) => {
      console.log(`Connection opened: ${JSON.stringify(event)}`);
    };

    ws.onclose = (event) => {
      console.log(`Connection closed: ${JSON.stringify(event)}`);
    };

    ws.onerror = (event) => {
      console.log(`An error occurred with websockets: ${JSON.stringify(event)}`);
    };

    return ws;
  };

  const toggleControls = (livestreamStarted) => {
    if (livestreamStarted) {
      startControls.classList.add('hide');
      endControls.classList.remove('hide');
    } else {
      startControls.classList.remove('hide');
      endControls.classList.add('hide');
    }
  };

  startBtn.addEventListener('click', async () => {
    console.log("Starting...");
    try {
      const streamKeyInput = document.getElementById('stream-key-input');
      const streamKey = streamKeyInput.value;

      if (streamKey.trim() === '') {
        alert('Please enter a valid stream key!');
        return;
      }

      websocket = connect(wsUrl, streamKey);
      toggleControls(true);

      if (mediaRecorder === null) {
        websocket.close();
        websocket = null;
        toggleControls(false);
        return;
      }

      mediaRecorder.addEventListener('dataavailable', (e) => {
        websocket.send(e.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        websocket.close();
        websocket = null;
        toggleControls(false);
      });

      mediaRecorder.start(1000);
    } catch (err) {
      alert(err);
    }
  });

  stopBtn.addEventListener('click', async () => {
    console.log("Stoping...");
    try {
      mediaRecorder.stop();
      toggleControls(false);
      
      mediaRecorder = await initCamera(constraints, video)
      console.log("> Media recorder and camera reinitialized after stop")
    } catch (err) {
      alert(err);
    }
  });

  try {
    mediaRecorder = await initCamera(constraints, video);
    console.log("> Media recorder and camera initialized")
  } catch (err) {
    console.log(err);
  }
});