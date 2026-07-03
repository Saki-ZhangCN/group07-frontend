import { ref } from 'vue'
import TRTC from 'trtc-sdk-v5'
import { credential } from '../api/live'

export function useLiveRtc(roomId, role = 'audience') {
  const connected = ref(false), cameraOn = ref(false), micOn = ref(false), error = ref('')
  let trtc
  async function join(localViewId = 'local-video') {
    const auth = await credential(roomId, role)
    trtc = TRTC.create()

    trtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, ({ userId, streamType }) => {
      const id = `remote-${userId}`
      let view = document.getElementById(id)
      if (!view) {
        view = document.createElement('div')
        view.id = id
        view.style.cssText = 'width:100%;height:100%'
        document.getElementById('remote-grid')?.appendChild(view)
      }
      trtc.startRemoteVideo({ userId, streamType, view: id })
    })

    trtc.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, ({ userId, available }) => {
      if (available) {
        trtc.startRemoteAudio({ userId })
      }
    })

    trtc.on(TRTC.EVENT.ERROR, e => {
      error.value = e.message || '音视频连接异常'
    })

    await trtc.enterRoom({
      scene: 'live',
      sdkAppId: auth.sdkAppId,
      userId: auth.userId,
      userSig: auth.userSig,
      roomId: Number(auth.roomId),
      role: role === 'teacher' ? 'anchor' : 'audience'
    })

    connected.value = true

    if (role === 'teacher') {
      await trtc.startLocalVideo({ view: localViewId })
      await trtc.startLocalAudio()
      cameraOn.value = micOn.value = true
    }
  }

  async function toggleCamera() {
    if (!trtc) return
    if (cameraOn.value) await trtc.stopLocalVideo()
    else await trtc.startLocalVideo({ view: 'local-video' })
    cameraOn.value = !cameraOn.value
  }

  async function toggleMic() {
    if (!trtc) return
    if (micOn.value) await trtc.stopLocalAudio()
    else await trtc.startLocalAudio()
    micOn.value = !micOn.value
  }

  async function leave() {
    if (!trtc) return
    try {
      if (cameraOn.value) await trtc.stopLocalVideo()
      if (micOn.value) await trtc.stopLocalAudio()
      await trtc.exitRoom()
    } finally {
      trtc.destroy()
      trtc = null
      connected.value = false
    }
  }

  return { connected, cameraOn, micOn, error, join, leave, toggleCamera, toggleMic }
}