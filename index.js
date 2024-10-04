const messagebox = document.getElementById("messagebox")
const sdpofferbox = document.getElementById("sdpoffer")
const sdpanswerinput = document.getElementById("sdpanswer")
const sdpofferinput = document.getElementById("sdpofferinput")
const callbtn = document.getElementById("callbtn")
const receivebtn = document.getElementById("receivebtn")
const setanswerbtn = document.getElementById("setanswerbtn")
const localVideo = document.getElementById("local_video")
const remoteVideo = document.getElementById("remote_video")
let mediaStream;

let connection, datachannel;

async function call() {
  connection = new RTCPeerConnection()
  datachannel = connection.createDataChannel("channel")
  datachannel.onopen = _ => {
    console.log("Connection Opened")
  }
  datachannel.onmessage = e => {
    console.log("Message: ", e.data)
    const message = document.createElement("div")
    message.innerText = e.data
    messagebox.appendChild(message)
  }
  connection.onicecandidate = e => {
    console.log(connection.localDescription)
    sdpofferbox.innerText = JSON.stringify(connection.localDescription)
  }
  connection.ontrack = e => {
    console.log("Got track: ", e)
    remoteVideo.srcObject = e.streams[0]
  }
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    // audio: true,
  })
  localVideo.srcObject = mediaStream
  mediaStream.getTracks().forEach(track => {
    connection.addTrack(track, mediaStream)
    console.log("Added Track: ", track)
  })

  connection.createOffer()
    .then(offer => connection.setLocalDescription(offer))
}

function setanswer() {
  const answer = JSON.parse(sdpanswerinput.value)
  connection.setRemoteDescription(answer)
}

async function receive() {
  const offer = JSON.parse(sdpofferinput.value)
  connection = new RTCPeerConnection()
  connection.ondatachannel = e => {
    datachannel = e.channel
    datachannel.onopen = _ => {
      console.log("Connection Opened")
    }
    datachannel.onmessage = e => {
      console.log("Message: ", e.data)
      const message = document.createElement("div")
      message.innerText = e.data
      messagebox.appendChild(message)
    }
  }
  connection.ontrack = e => {
    console.log("Got track: ", e)
  }
  connection.onicecandidate = e => {
    console.log(connection.localDescription)
    sdpofferbox.innerText = JSON.stringify(connection.localDescription)
  }
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    // audio: true,
  })
  localVideo.srcObject = mediaStream
  mediaStream.getTracks().forEach(track => {
    connection.addTrack(track, mediaStream)
    console.log("Added Track: ", track)
  })
  await connection.setRemoteDescription(offer)
  connection.createAnswer().then(answer => connection.setLocalDescription(answer)).then(e => sdpofferbox.innerText = JSON.stringify(connection.localDescription))
}

async function enableVideo() {
  if (localVideo.srcObject) {
    mediaStream.getVideoTracks().forEach(t => t.enabled = true)
    return;
  }


}

async function disableVideo() {
  if (mediaStream) {
    mediaStream.getVideoTracks().forEach(t => t.enabled = false)
  }
}
